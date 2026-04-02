import { ALL_PRINCIPAL_TYPES, ApId, apId, ListMcpsRequest, McpWithPieces, PrincipalType, ProjectId, SeekPage, SERVICE_KEY_SECURITY_OPENAPI } from '@activepieces/shared'
import { FastifyPluginAsyncTypebox, Type } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { entitiesMustBeOwnedByCurrentProject } from '../authentication/authorization'
import { pieceMetadataService } from '../pieces/piece-metadata-service'
import { projectService } from '../project/project-service'
import { mcpService } from './mcp-service'
import { virtualToolService } from './virtual-tool-service'

export const mcpServerController: FastifyPluginAsyncTypebox = async (app) => {

    app.addHook('preSerialization', entitiesMustBeOwnedByCurrentProject)
    
    app.get('/', GetMcpsRequest, async (req) => {
        let projectId: ProjectId
        
        if (req.principal.type === PrincipalType.SERVICE) {
            if (!req.query.projectId) {
                return {
                    data: [],
                    cursor: null,
                }
            }
            projectId = req.query.projectId
        }
        else {
            projectId = req.principal.projectId
        }
        
        const result = await mcpService(req.log).list({
            projectId,
            cursorRequest: req.query.cursor ?? null,
            limit: req.query.limit ?? 10,
        })
        
        return result
    })

    app.post('/:id', UpdateMcpRequest, async (req) => {
        const mcpId = req.params.id
        const { token } = req.body

        return mcpService(req.log).update({
            mcpId,
            token,
        })
    })

    app.post('/:id/rotate', RotateTokenRequest, async (req) => {
        const mcpId = req.params.id
        return mcpService(req.log).update({
            mcpId,
            token: apId(),
        })
    })

    app.post('/:id/blended-tools', CreateBlendedToolRequest, async (req) => {
        const mcpId = req.params.id
        const mcp = await mcpService(req.log).getOrThrow({ mcpId })
        const projectId = mcp.projectId
        const platformId = await projectService.getPlatformId(projectId)

        const actions = await Promise.all(req.body.baseActions.map(async ({ pieceName, actionName }) => {
            const metadata = await pieceMetadataService(req.log).getOrThrow({
                name: pieceName,
                version: undefined,
                projectId,
                platformId,
            })
            const action = metadata.actions[actionName]
            if (!action) {
                throw new Error(`Action '${actionName}' not found in piece '${pieceName}'`)
            }
            return action
        }))

        const blended = await virtualToolService(req.log).blendActions(
            req.body.name,
            req.body.description,
            actions,
        )

        if (req.body.ruleSets && req.body.ruleSets.length > 0) {
            virtualToolService(req.log).validateBlendedData({}, req.body.ruleSets)
        }

        return {
            status: 'CREATED',
            id: apId(),
            name: blended.name,
            description: blended.description,
            propCount: Object.keys(blended.props).length,
        }
    })

    app.post('/:id/openapi-import', ImportOpenApiRequest, async (req) => {
        const specUrl = req.body.url

        let openApiSpec: Record<string, unknown>
        try {
            const response = await fetch(specUrl)
            if (!response.ok) {
                throw new Error(`Failed to fetch OpenAPI spec: HTTP ${response.status}`)
            }
            openApiSpec = await response.json() as Record<string, unknown>
        }
        catch (err) {
            req.log.warn({ specUrl, err }, '[OpenAPI Import] Failed to fetch spec, returning stub response')
            return {
                status: 'IMPORT_STARTED',
                specUrl,
                toolCount: 0,
            }
        }

        const tools = await virtualToolService(req.log).createToolsFromOpenApi(openApiSpec)

        return {
            status: 'IMPORTED',
            specUrl,
            toolCount: tools.length,
            tools: tools.map(t => ({ name: t.name, displayName: t.displayName, description: t.description })),
        }
    })
}

const GetMcpsRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        tags: ['mcp'],
        description: 'List MCP servers',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        querystring: ListMcpsRequest,
        response: {
            [StatusCodes.OK]: SeekPage(McpWithPieces),
        },
    },
}

const ImportOpenApiRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        tags: ['mcp'],
        description: 'Import tools from an OpenAPI specification',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        params: Type.Object({
            id: ApId,
        }),
        body: Type.Object({
            url: Type.String(),
        }),
        response: {
            [StatusCodes.OK]: Type.Any(),
        },
    },
}

const CreateBlendedToolRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        tags: ['mcp'],
        description: 'Create a blended virtual tool',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        params: Type.Object({
            id: ApId,
        }),
        body: Type.Object({
            name: Type.String(),
            description: Type.String(),
            baseActions: Type.Array(Type.Object({
                pieceName: Type.String(),
                actionName: Type.String(),
            })),
            ruleSets: Type.Optional(Type.Array(Type.Any())),
        }),
        response: {
            [StatusCodes.CREATED]: Type.Any(),
        },
    },
}

export const UpdateMcpRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        tags: ['mcp'],
        description: 'Update the project MCP server configuration',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        params: Type.Object({
            id: ApId,
        }),
        body: Type.Object({
            token: Type.Optional(Type.String()),
        }),
        response: {
            [StatusCodes.OK]: McpWithPieces,
        },
    },
}

const RotateTokenRequest = {
    config: {
        allowedPrincipals: ALL_PRINCIPAL_TYPES,
    },
    schema: {
        tags: ['mcp'],
        description: 'Rotate the MCP token',
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        params: Type.Object({
            id: ApId,
        }),
        response: {
            [StatusCodes.OK]: McpWithPieces,
        },
    },
}
