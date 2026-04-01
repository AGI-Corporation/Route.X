
import { FastifyBaseLogger } from 'fastify'
import { mcpService } from './mcp-service'
import { pieceMetadataService } from '../pieces/piece-metadata-service'
import { projectService } from '../project/project-service'
import { McpPieceStatus } from '@activepieces/shared'

export const nandaManifestService = (logger: FastifyBaseLogger) => ({
    async generateManifest(mcpId: string) {
        const mcp = await mcpService(logger).getOrThrow({ mcpId })
        const projectId = mcp.projectId
        const platformId = await projectService.getPlatformId(projectId)

        const enabledPieces = mcp.pieces.filter((piece) => piece.status === McpPieceStatus.ENABLED)

        const capabilities = await Promise.all(enabledPieces.map(async (p) => {
            const metadata = await pieceMetadataService(logger).getOrThrow({
                name: p.pieceName,
                version: undefined,
                projectId,
                platformId,
            })

            return {
                id: metadata.name,
                type: 'TOOL_PROVIDER',
                name: metadata.displayName,
                description: metadata.description,
                version: metadata.version,
                tools: Object.values(metadata.actions).map(action => ({
                    name: action.name,
                    description: (action as any).aiDescription || action.description,
                    parameters: action.props,
                    trust_policy: (action as any).trustPolicy || 'STRICT_PRIVATE',
                    reward_model: {
                        unit: 'CREDIT',
                        base_cost: 0,
                    }
                })),
                protocol: 'MCP/NANDA-1.0',
            }
        }))

        return {
            '@context': [
                'https://www.w3.org/ns/credentials/v2',
                'https://projectnanda.org/context/agent-facts/v1'
            ],
            id: `urn:uuid:${projectId}`,
            agent_id: `urn:uuid:${mcp.id}`,
            type: 'AgentFacts',
            agentName: `MCP.My.ID Project ${projectId}`,
            ttl: 3600,
            endpoints: [
                {
                    type: 'MCP_SSE',
                    uri: `{{SYSTEM_URL}}/api/v1/mcp/messages?token=${mcp.token}`,
                    priority: 1
                }
            ],
            usageFormat: {
                protocol: 'MCP/NANDA-1.0',
                capabilities,
            },
            governance: {
                data_retention: 'ZERO_RETENTION_PREFERENCE',
                human_in_loop: 'REQUIRED_FOR_SENSITIVE',
                compliance: enabledPieces.some(p => p.pieceName.includes('fhir')) ? ['HIPAA', 'GDPR_HEALTH'] : [],
            },
            trust_anchor: 'MCP_MY_ID_VERIFIED',
            nanda_version: '1.0.0',
            composition: {
                blended_tools_count: capabilities.reduce((sum, c) => sum + c.tools.length, 0),
                data_fusion: 'ENABLED',
            }
        }
    }
})
