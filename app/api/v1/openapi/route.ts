/**
 * GET /api/v1/openapi
 * Hand-curated OpenAPI 3.1 spec for the public API. Public route — no
 * auth required so docs tools (Swagger UI, ReDoc, Postman) can pull it
 * directly. When endpoints change, update the relevant `paths` block
 * here; there's no auto-generator yet because the v1 surface is small
 * and a curated spec stays correct longer than an inferred one.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'Tour Manager OS API',
      version: '1.0.0',
      description:
        'Read-only access to a tour\'s data — tours, shows, itineraries, expenses, merch, and venue contacts. Authenticate with an API key (`Authorization: Bearer tmos_...`) generated from /admin/api-keys.',
      contact: { email: 'bam@awews.com' },
    },
    servers: [{ url: `${origin}/api/v1` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API key (tmos_*)',
        },
      },
      schemas: {
        Tour: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            artist_name: { type: 'string' },
            description: { type: 'string', nullable: true },
            start_date: { type: 'string', format: 'date', nullable: true },
            end_date: { type: 'string', format: 'date', nullable: true },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'completed', 'cancelled'],
            },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Show: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tour_id: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date' },
            city: { type: 'string' },
            state: { type: 'string', nullable: true },
            country: { type: 'string' },
            venue_name: { type: 'string', nullable: true },
            status: { type: 'string' },
            timezone: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tour_id: { type: 'string', format: 'uuid' },
            show_id: { type: 'string', format: 'uuid', nullable: true },
            member_id: { type: 'string', format: 'uuid', nullable: true },
            date: { type: 'string', format: 'date' },
            category: {
              type: 'string',
              enum: [
                'travel', 'hotel', 'per_diem', 'meals', 'equipment',
                'crew', 'merch', 'marketing', 'insurance', 'other',
              ],
            },
            amount: { type: 'number' },
            description: { type: 'string', nullable: true },
            is_tax_deductible: { type: 'boolean' },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'reimbursed', 'rejected'],
            },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        MerchProduct: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            sku: { type: 'string', nullable: true },
            category: {
              type: 'string',
              enum: ['apparel', 'vinyl', 'cd', 'poster', 'accessory', 'bundle', 'other'],
              nullable: true,
            },
            price: { type: 'number' },
            cost_basis: { type: 'number', nullable: true },
            image_url: { type: 'string', nullable: true },
            active: { type: 'boolean' },
            weight_oz: { type: 'number', nullable: true },
            length_in: { type: 'number', nullable: true },
            width_in: { type: 'number', nullable: true },
            height_in: { type: 'number', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        VenueContact: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            venue_id: { type: 'string', format: 'uuid' },
            role: {
              type: 'string',
              enum: ['booker', 'production', 'hospitality', 'sound', 'lighting', 'merch', 'security', 'house', 'other'],
            },
            name: { type: 'string' },
            phone: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            is_primary: { type: 'boolean' },
            verified_at: { type: 'string', format: 'date-time', nullable: true },
            tags: { type: 'array', items: { type: 'string' } },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: { error: { type: 'string' } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      '/tours': {
        get: {
          summary: 'List tours',
          tags: ['Tours'],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Tour' } },
                      count: { type: 'integer' },
                    },
                  },
                },
              },
            },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '429': { description: 'Rate limited' },
          },
        },
      },
      '/shows': {
        get: {
          summary: 'List shows',
          tags: ['Shows'],
          parameters: [
            { name: 'tour_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Show' } },
                      count: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/itineraries': {
        get: {
          summary: 'List itinerary days',
          tags: ['Itineraries'],
          parameters: [
            { name: 'tour_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { '200': { description: 'OK' } },
        },
      },
      '/finances/expenses': {
        get: {
          summary: 'List expenses',
          tags: ['Finances'],
          parameters: [
            { name: 'tour_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'reimbursed', 'rejected'] } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 500, default: 100 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/Expense' } },
                      count: { type: 'integer' },
                      limit: { type: 'integer' },
                      offset: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/merch/products': {
        get: {
          summary: 'List merch products',
          tags: ['Merch'],
          parameters: [
            { name: 'active', in: 'query', schema: { type: 'string', enum: ['true', 'false'] } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/MerchProduct' } },
                      count: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/venues/contacts': {
        get: {
          summary: 'List venue contacts',
          tags: ['Venues'],
          parameters: [
            { name: 'venue_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
            { name: 'role', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      data: { type: 'array', items: { $ref: '#/components/schemas/VenueContact' } },
                      count: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }

  return Response.json(spec, {
    headers: {
      'Cache-Control': 'public, max-age=300, s-maxage=600',
    },
  })
}
