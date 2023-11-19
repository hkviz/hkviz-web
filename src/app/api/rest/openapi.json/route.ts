import { generateOpenApiDocument } from 'trpc-openapi';
import { appRouter } from '~/server/api/root';

export const openApiDocument = generateOpenApiDocument(appRouter, {
    title: 'HKViz OpenAPI',
    version: '1.0.0',
    baseUrl: 'http://localhost:3000/api/rest',
});

export function GET() {
    return Response.json(openApiDocument);
}
