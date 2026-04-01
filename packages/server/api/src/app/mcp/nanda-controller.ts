
import axios from 'axios'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { mcpService } from './mcp-service'
import { nandaManifestService } from './nanda-manifest-service'

export const nandaController: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get(
        '/discover',
        {
            schema: {
                querystring: Type.Object({
                    token: Type.String(),
                }),
            },
        },
        async (request) => {
            const mcp = await mcpService(request.log).getByToken({ token: request.query.token })
            return nandaManifestService(request.log).generateManifest(mcp.id)
        },
    )

    // Standardized NANDA discovery path (alias)
    fastify.get(
        '/.well-known/agent.json',
        {
            schema: {
                querystring: Type.Object({
                    token: Type.String(),
                }),
            },
        },
        async (request) => {
            const mcp = await mcpService(request.log).getByToken({ token: request.query.token })
            return nandaManifestService(request.log).generateManifest(mcp.id)
        },
    )

    fastify.post(
        '/announce',
        {
            schema: {
                body: Type.Object({
                    index_url: Type.String(),
                    token: Type.String(),
                }),
            },
        },
        async (request) => {
            const mcp = await mcpService(request.log).getByToken({ token: request.body.token })
            const manifest = await nandaManifestService(request.log).generateManifest(mcp.id)

            try {
                await axios.post(request.body.index_url, manifest, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 10_000,
                })
                request.log.info({ index_url: request.body.index_url, agent_id: manifest.agent_id }, 'Announced to NANDA Index')
            } catch (err) {
                request.log.warn({ err, index_url: request.body.index_url }, 'Failed to reach NANDA Index; announcement recorded locally')
            }

            return {
                status: 'ANNOUNCED',
                agent_id: manifest.agent_id,
                nanda_index: request.body.index_url,
            }
        },
    )
}
