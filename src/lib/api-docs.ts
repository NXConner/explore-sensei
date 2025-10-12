/**
 * API Documentation Generator for Explore Sensei
 * Generates OpenAPI/Swagger documentation for all API endpoints
 */

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  summary: string;
  description: string;
  tags: string[];
  parameters?: APIParameter[];
  requestBody?: APIRequestBody;
  responses: APIResponse[];
  security?: APISecurity[];
  deprecated?: boolean;
  externalDocs?: APIExternalDocs;
}

export interface APIParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  description: string;
  required: boolean;
  schema: APISchema;
  example?: any;
}

export interface APIRequestBody {
  description: string;
  required: boolean;
  content: {
    [mediaType: string]: {
      schema: APISchema;
      example?: any;
    };
  };
}

export interface APIResponse {
  status: number;
  description: string;
  content?: {
    [mediaType: string]: {
      schema: APISchema;
      example?: any;
    };
  };
}

export interface APISchema {
  type: string;
  properties?: { [key: string]: APISchema };
  items?: APISchema;
  required?: string[];
  example?: any;
  enum?: any[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface APISecurity {
  type: string;
  scheme?: string;
  bearerFormat?: string;
}

export interface APIExternalDocs {
  description: string;
  url: string;
}

// OpenAPI 3.0 specification
export const generateOpenAPISpec = (): any => {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Explore Sensei API',
      description: 'AI-assisted development for pavement analysis and performance tracking, specifically optimized for asphalt paving and sealing, with a strategic focus on church parking lot repair, sealcoating, and line-striping. Supporting both Virginia and North Carolina contractor licensing.',
      version: '1.0.0',
      contact: {
        name: 'Explore Sensei Support',
        email: 'support@exploresensei.com',
        url: 'https://exploresensei.com/support'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://api.exploresensei.com/v1',
        description: 'Production server'
      },
      {
        url: 'https://staging-api.exploresensei.com/v1',
        description: 'Staging server'
      },
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      }
    ],
    paths: generatePaths(),
    components: {
      schemas: generateSchemas(),
      securitySchemes: generateSecuritySchemes(),
      responses: generateCommonResponses(),
      parameters: generateCommonParameters()
    },
    tags: generateTags(),
    externalDocs: {
      description: 'Explore Sensei Documentation',
      url: 'https://docs.exploresensei.com'
    }
  };
};

// Generate API paths
const generatePaths = (): any => {
  return {
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User Login',
        description: 'Authenticate user and return JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginResponse'
                }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'User Logout',
        description: 'Logout user and invalidate token',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SuccessResponse'
                }
              }
            }
          }
        }
      }
    },
    '/jobs': {
      get: {
        tags: ['Jobs'],
        summary: 'Get Jobs',
        description: 'Retrieve list of jobs with optional filtering',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            description: 'Filter by job status',
            required: false,
            schema: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'cancelled']
            }
          },
          {
            name: 'client_id',
            in: 'query',
            description: 'Filter by client ID',
            required: false,
            schema: {
              type: 'string',
              format: 'uuid'
            }
          },
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Items per page',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20
            }
          }
        ],
        responses: {
          '200': {
            description: 'Jobs retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobsResponse'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Jobs'],
        summary: 'Create Job',
        description: 'Create a new job',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateJobRequest'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Job created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobResponse'
                }
              }
            }
          },
          '400': {
            description: 'Invalid request data',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/jobs/{id}': {
      get: {
        tags: ['Jobs'],
        summary: 'Get Job by ID',
        description: 'Retrieve a specific job by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Job ID',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Job retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobResponse'
                }
              }
            }
          },
          '404': {
            description: 'Job not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      put: {
        tags: ['Jobs'],
        summary: 'Update Job',
        description: 'Update an existing job',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Job ID',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateJobRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Job updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/JobResponse'
                }
              }
            }
          },
          '404': {
            description: 'Job not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Jobs'],
        summary: 'Delete Job',
        description: 'Delete a job',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Job ID',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '204': {
            description: 'Job deleted successfully'
          },
          '404': {
            description: 'Job not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse'
                }
              }
            }
          }
        }
      }
    },
    '/time-entries': {
      get: {
        tags: ['Time Tracking'],
        summary: 'Get Time Entries',
        description: 'Retrieve time entries with optional filtering',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'employee_id',
            in: 'query',
            description: 'Filter by employee ID',
            required: false,
            schema: {
              type: 'string',
              format: 'uuid'
            }
          },
          {
            name: 'job_id',
            in: 'query',
            description: 'Filter by job ID',
            required: false,
            schema: {
              type: 'string',
              format: 'uuid'
            }
          },
          {
            name: 'start_date',
            in: 'query',
            description: 'Filter by start date',
            required: false,
            schema: {
              type: 'string',
              format: 'date'
            }
          },
          {
            name: 'end_date',
            in: 'query',
            description: 'Filter by end date',
            required: false,
            schema: {
              type: 'string',
              format: 'date'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Time entries retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TimeEntriesResponse'
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Time Tracking'],
        summary: 'Create Time Entry',
        description: 'Create a new time entry',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateTimeEntryRequest'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Time entry created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TimeEntryResponse'
                }
              }
            }
          }
        }
      }
    },
    '/fleet/vehicles': {
      get: {
        tags: ['Fleet Management'],
        summary: 'Get Vehicles',
        description: 'Retrieve list of vehicles',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Vehicles retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/VehiclesResponse'
                }
              }
            }
          }
        }
      }
    },
    '/fleet/vehicles/{id}/location': {
      get: {
        tags: ['Fleet Management'],
        summary: 'Get Vehicle Location',
        description: 'Get real-time location of a vehicle',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Vehicle ID',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Vehicle location retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/VehicleLocationResponse'
                }
              }
            }
          }
        }
      }
    },
    '/ai/analyze': {
      post: {
        tags: ['AI Analysis'],
        summary: 'Analyze Asphalt Condition',
        description: 'Analyze asphalt condition using AI',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                $ref: '#/components/schemas/AIAnalysisRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Analysis completed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AIAnalysisResponse'
                }
              }
            }
          }
        }
      }
    },
    '/weather/current': {
      get: {
        tags: ['Weather'],
        summary: 'Get Current Weather',
        description: 'Get current weather conditions',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'lat',
            in: 'query',
            required: true,
            description: 'Latitude',
            schema: {
              type: 'number',
              format: 'float'
            }
          },
          {
            name: 'lon',
            in: 'query',
            required: true,
            description: 'Longitude',
            schema: {
              type: 'number',
              format: 'float'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Weather data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/WeatherResponse'
                }
              }
            }
          }
        }
      }
    },
    '/route/optimize': {
      post: {
        tags: ['Route Optimization'],
        summary: 'Optimize Route',
        description: 'Optimize route for multiple stops',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RouteOptimizationRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Route optimized successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RouteOptimizationResponse'
                }
              }
            }
          }
        }
      }
    }
  };
};

// Generate schemas
const generateSchemas = (): any => {
  return {
    LoginRequest: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address'
        },
        password: {
          type: 'string',
          minLength: 8,
          description: 'User password'
        }
      }
    },
    LoginResponse: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'JWT access token'
        },
        refreshToken: {
          type: 'string',
          description: 'JWT refresh token'
        },
        user: {
          $ref: '#/components/schemas/User'
        }
      }
    },
    User: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'User ID'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'User email'
        },
        name: {
          type: 'string',
          description: 'User full name'
        },
        role: {
          type: 'string',
          enum: ['admin', 'manager', 'employee'],
          description: 'User role'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'User creation date'
        }
      }
    },
    Job: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'Job ID'
        },
        title: {
          type: 'string',
          description: 'Job title'
        },
        description: {
          type: 'string',
          description: 'Job description'
        },
        status: {
          type: 'string',
          enum: ['pending', 'in_progress', 'completed', 'cancelled'],
          description: 'Job status'
        },
        clientId: {
          type: 'string',
          format: 'uuid',
          description: 'Client ID'
        },
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Job start date'
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'Job end date'
        },
        estimatedCost: {
          type: 'number',
          format: 'float',
          description: 'Estimated job cost'
        },
        actualCost: {
          type: 'number',
          format: 'float',
          description: 'Actual job cost'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Job creation date'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Job last update date'
        }
      }
    },
    CreateJobRequest: {
      type: 'object',
      required: ['title', 'description', 'clientId', 'startDate'],
      properties: {
        title: {
          type: 'string',
          description: 'Job title'
        },
        description: {
          type: 'string',
          description: 'Job description'
        },
        clientId: {
          type: 'string',
          format: 'uuid',
          description: 'Client ID'
        },
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Job start date'
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'Job end date'
        },
        estimatedCost: {
          type: 'number',
          format: 'float',
          description: 'Estimated job cost'
        }
      }
    },
    UpdateJobRequest: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Job title'
        },
        description: {
          type: 'string',
          description: 'Job description'
        },
        status: {
          type: 'string',
          enum: ['pending', 'in_progress', 'completed', 'cancelled'],
          description: 'Job status'
        },
        startDate: {
          type: 'string',
          format: 'date',
          description: 'Job start date'
        },
        endDate: {
          type: 'string',
          format: 'date',
          description: 'Job end date'
        },
        estimatedCost: {
          type: 'number',
          format: 'float',
          description: 'Estimated job cost'
        },
        actualCost: {
          type: 'number',
          format: 'float',
          description: 'Actual job cost'
        }
      }
    },
    JobResponse: {
      type: 'object',
      properties: {
        job: {
          $ref: '#/components/schemas/Job'
        }
      }
    },
    JobsResponse: {
      type: 'object',
      properties: {
        jobs: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Job'
          }
        },
        pagination: {
          $ref: '#/components/schemas/Pagination'
        }
      }
    },
    Pagination: {
      type: 'object',
      properties: {
        page: {
          type: 'integer',
          description: 'Current page number'
        },
        limit: {
          type: 'integer',
          description: 'Items per page'
        },
        total: {
          type: 'integer',
          description: 'Total number of items'
        },
        pages: {
          type: 'integer',
          description: 'Total number of pages'
        }
      }
    },
    TimeEntry: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'Time entry ID'
        },
        employeeId: {
          type: 'string',
          format: 'uuid',
          description: 'Employee ID'
        },
        jobId: {
          type: 'string',
          format: 'uuid',
          description: 'Job ID'
        },
        startTime: {
          type: 'string',
          format: 'date-time',
          description: 'Start time'
        },
        endTime: {
          type: 'string',
          format: 'date-time',
          description: 'End time'
        },
        duration: {
          type: 'number',
          format: 'float',
          description: 'Duration in hours'
        },
        description: {
          type: 'string',
          description: 'Work description'
        },
        location: {
          type: 'object',
          properties: {
            lat: {
              type: 'number',
              format: 'float',
              description: 'Latitude'
            },
            lng: {
              type: 'number',
              format: 'float',
              description: 'Longitude'
            },
            address: {
              type: 'string',
              description: 'Address'
            }
          }
        },
        status: {
          type: 'string',
          enum: ['pending', 'approved', 'rejected'],
          description: 'Time entry status'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Creation date'
        }
      }
    },
    CreateTimeEntryRequest: {
      type: 'object',
      required: ['employeeId', 'jobId', 'startTime', 'endTime'],
      properties: {
        employeeId: {
          type: 'string',
          format: 'uuid',
          description: 'Employee ID'
        },
        jobId: {
          type: 'string',
          format: 'uuid',
          description: 'Job ID'
        },
        startTime: {
          type: 'string',
          format: 'date-time',
          description: 'Start time'
        },
        endTime: {
          type: 'string',
          format: 'date-time',
          description: 'End time'
        },
        description: {
          type: 'string',
          description: 'Work description'
        },
        location: {
          type: 'object',
          properties: {
            lat: {
              type: 'number',
              format: 'float',
              description: 'Latitude'
            },
            lng: {
              type: 'number',
              format: 'float',
              description: 'Longitude'
            },
            address: {
              type: 'string',
              description: 'Address'
            }
          }
        }
      }
    },
    TimeEntryResponse: {
      type: 'object',
      properties: {
        timeEntry: {
          $ref: '#/components/schemas/TimeEntry'
        }
      }
    },
    TimeEntriesResponse: {
      type: 'object',
      properties: {
        timeEntries: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/TimeEntry'
          }
        },
        pagination: {
          $ref: '#/components/schemas/Pagination'
        }
      }
    },
    Vehicle: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'Vehicle ID'
        },
        make: {
          type: 'string',
          description: 'Vehicle make'
        },
        model: {
          type: 'string',
          description: 'Vehicle model'
        },
        year: {
          type: 'integer',
          description: 'Vehicle year'
        },
        licensePlate: {
          type: 'string',
          description: 'License plate number'
        },
        vin: {
          type: 'string',
          description: 'Vehicle identification number'
        },
        color: {
          type: 'string',
          description: 'Vehicle color'
        },
        status: {
          type: 'string',
          enum: ['active', 'maintenance', 'out_of_service', 'retired'],
          description: 'Vehicle status'
        },
        currentLocation: {
          type: 'object',
          properties: {
            lat: {
              type: 'number',
              format: 'float',
              description: 'Latitude'
            },
            lng: {
              type: 'number',
              format: 'float',
              description: 'Longitude'
            },
            address: {
              type: 'string',
              description: 'Address'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Location timestamp'
            }
          }
        },
        assignedEmployee: {
          type: 'string',
          format: 'uuid',
          description: 'Assigned employee ID'
        },
        fuelLevel: {
          type: 'number',
          format: 'float',
          description: 'Fuel level percentage'
        },
        mileage: {
          type: 'number',
          format: 'float',
          description: 'Vehicle mileage'
        },
        lastMaintenance: {
          type: 'string',
          format: 'date',
          description: 'Last maintenance date'
        },
        nextMaintenance: {
          type: 'string',
          format: 'date',
          description: 'Next maintenance date'
        },
        insuranceExpiry: {
          type: 'string',
          format: 'date',
          description: 'Insurance expiry date'
        },
        registrationExpiry: {
          type: 'string',
          format: 'date',
          description: 'Registration expiry date'
        }
      }
    },
    VehiclesResponse: {
      type: 'object',
      properties: {
        vehicles: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Vehicle'
          }
        }
      }
    },
    VehicleLocationResponse: {
      type: 'object',
      properties: {
        location: {
          type: 'object',
          properties: {
            lat: {
              type: 'number',
              format: 'float',
              description: 'Latitude'
            },
            lng: {
              type: 'number',
              format: 'float',
              description: 'Longitude'
            },
            address: {
              type: 'string',
              description: 'Address'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Location timestamp'
            }
          }
        }
      }
    },
    AIAnalysisRequest: {
      type: 'object',
      required: ['image'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image file to analyze'
        },
        analysisType: {
          type: 'string',
          enum: ['asphalt_condition', 'crack_detection', 'surface_quality'],
          description: 'Type of analysis to perform'
        }
      }
    },
    AIAnalysisResponse: {
      type: 'object',
      properties: {
        analysisId: {
          type: 'string',
          format: 'uuid',
          description: 'Analysis ID'
        },
        conditionScore: {
          type: 'number',
          format: 'float',
          description: 'Overall condition score (0-100)'
        },
        detectedIssues: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'List of detected issues'
        },
        recommendations: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'List of recommendations'
        },
        confidenceScore: {
          type: 'number',
          format: 'float',
          description: 'Confidence score (0-100)'
        },
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Severity level'
        },
        estimatedCost: {
          type: 'number',
          format: 'float',
          description: 'Estimated repair cost'
        },
        priority: {
          type: 'integer',
          description: 'Priority level (1-10)'
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Analysis timestamp'
        }
      }
    },
    WeatherResponse: {
      type: 'object',
      properties: {
        current: {
          type: 'object',
          properties: {
            temperature: {
              type: 'number',
              format: 'float',
              description: 'Current temperature in Celsius'
            },
            humidity: {
              type: 'number',
              format: 'float',
              description: 'Humidity percentage'
            },
            windSpeed: {
              type: 'number',
              format: 'float',
              description: 'Wind speed in km/h'
            },
            windDirection: {
              type: 'number',
              format: 'float',
              description: 'Wind direction in degrees'
            },
            pressure: {
              type: 'number',
              format: 'float',
              description: 'Atmospheric pressure in hPa'
            },
            visibility: {
              type: 'number',
              format: 'float',
              description: 'Visibility in km'
            },
            uvIndex: {
              type: 'number',
              format: 'float',
              description: 'UV index'
            },
            description: {
              type: 'string',
              description: 'Weather description'
            },
            icon: {
              type: 'string',
              description: 'Weather icon code'
            }
          }
        },
        forecast: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                format: 'date',
                description: 'Forecast date'
              },
              temperature: {
                type: 'object',
                properties: {
                  min: {
                    type: 'number',
                    format: 'float',
                    description: 'Minimum temperature'
                  },
                  max: {
                    type: 'number',
                    format: 'float',
                    description: 'Maximum temperature'
                  }
                }
              },
              description: {
                type: 'string',
                description: 'Weather description'
              },
              icon: {
                type: 'string',
                description: 'Weather icon code'
              },
              precipitation: {
                type: 'number',
                format: 'float',
                description: 'Precipitation probability'
              }
            }
          }
        },
        alerts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Alert title'
              },
              description: {
                type: 'string',
                description: 'Alert description'
              },
              severity: {
                type: 'string',
                enum: ['low', 'moderate', 'severe', 'extreme'],
                description: 'Alert severity'
              },
              startTime: {
                type: 'string',
                format: 'date-time',
                description: 'Alert start time'
              },
              endTime: {
                type: 'string',
                format: 'date-time',
                description: 'Alert end time'
              }
            }
          }
        }
      }
    },
    RouteOptimizationRequest: {
      type: 'object',
      required: ['stops'],
      properties: {
        stops: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Stop ID'
              },
              lat: {
                type: 'number',
                format: 'float',
                description: 'Latitude'
              },
              lng: {
                type: 'number',
                format: 'float',
                description: 'Longitude'
              },
              address: {
                type: 'string',
                description: 'Address'
              },
              duration: {
                type: 'number',
                format: 'float',
                description: 'Stop duration in minutes'
              },
              priority: {
                type: 'integer',
                description: 'Stop priority (1-10)'
              }
            }
          }
        },
        startLocation: {
          type: 'object',
          properties: {
            lat: {
              type: 'number',
              format: 'float',
              description: 'Start latitude'
            },
            lng: {
              type: 'number',
              format: 'float',
              description: 'Start longitude'
            }
          }
        },
        endLocation: {
          type: 'object',
          properties: {
            lat: {
              type: 'number',
              format: 'float',
              description: 'End latitude'
            },
            lng: {
              type: 'number',
              format: 'float',
              description: 'End longitude'
            }
          }
        },
        constraints: {
          type: 'object',
          properties: {
            maxDistance: {
              type: 'number',
              format: 'float',
              description: 'Maximum total distance in km'
            },
            maxDuration: {
              type: 'number',
              format: 'float',
              description: 'Maximum total duration in hours'
            },
            timeWindows: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  start: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Time window start'
                  },
                  end: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Time window end'
                  }
                }
              }
            }
          }
        }
      }
    },
    RouteOptimizationResponse: {
      type: 'object',
      properties: {
        optimizedRoute: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              stopId: {
                type: 'string',
                description: 'Stop ID'
              },
              order: {
                type: 'integer',
                description: 'Visit order'
              },
              arrivalTime: {
                type: 'string',
                format: 'date-time',
                description: 'Arrival time'
              },
              departureTime: {
                type: 'string',
                format: 'date-time',
                description: 'Departure time'
              },
              distance: {
                type: 'number',
                format: 'float',
                description: 'Distance from previous stop in km'
              },
              duration: {
                type: 'number',
                format: 'float',
                description: 'Travel time from previous stop in minutes'
              }
            }
          }
        },
        summary: {
          type: 'object',
          properties: {
            totalDistance: {
              type: 'number',
              format: 'float',
              description: 'Total distance in km'
            },
            totalDuration: {
              type: 'number',
              format: 'float',
              description: 'Total duration in minutes'
            },
            totalCost: {
              type: 'number',
              format: 'float',
              description: 'Total estimated cost'
            },
            fuelConsumption: {
              type: 'number',
              format: 'float',
              description: 'Estimated fuel consumption in liters'
            }
          }
        }
      }
    },
    ErrorResponse: {
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error message'
        },
        code: {
          type: 'string',
          description: 'Error code'
        },
        details: {
          type: 'object',
          description: 'Additional error details'
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Error timestamp'
        }
      }
    },
    SuccessResponse: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Success message'
        },
        data: {
          type: 'object',
          description: 'Response data'
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Response timestamp'
        }
      }
    }
  };
};

// Generate security schemes
const generateSecuritySchemes = (): any => {
  return {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'JWT token for authentication'
    },
    apiKey: {
      type: 'apiKey',
      in: 'header',
      name: 'X-API-Key',
      description: 'API key for authentication'
    }
  };
};

// Generate common responses
const generateCommonResponses = (): any => {
  return {
    UnauthorizedError: {
      description: 'Authentication information is missing or invalid',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse'
          }
        }
      }
    },
    ForbiddenError: {
      description: 'Access denied',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse'
          }
        }
      }
    },
    NotFoundError: {
      description: 'Resource not found',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse'
          }
        }
      }
    },
    ValidationError: {
      description: 'Validation error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse'
          }
        }
      }
    },
    InternalServerError: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/ErrorResponse'
          }
        }
      }
    }
  };
};

// Generate common parameters
const generateCommonParameters = (): any => {
  return {
    PageParam: {
      name: 'page',
      in: 'query',
      description: 'Page number',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        default: 1
      }
    },
    LimitParam: {
      name: 'limit',
      in: 'query',
      description: 'Items per page',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20
      }
    },
    SortParam: {
      name: 'sort',
      in: 'query',
      description: 'Sort field',
      required: false,
      schema: {
        type: 'string',
        enum: ['createdAt', 'updatedAt', 'title', 'status']
      }
    },
    OrderParam: {
      name: 'order',
      in: 'query',
      description: 'Sort order',
      required: false,
      schema: {
        type: 'string',
        enum: ['asc', 'desc'],
        default: 'desc'
      }
    }
  };
};

// Generate tags
const generateTags = (): any => {
  return [
    {
      name: 'Authentication',
      description: 'User authentication and authorization'
    },
    {
      name: 'Jobs',
      description: 'Job management operations'
    },
    {
      name: 'Time Tracking',
      description: 'Time entry and tracking operations'
    },
    {
      name: 'Fleet Management',
      description: 'Vehicle and fleet management operations'
    },
    {
      name: 'AI Analysis',
      description: 'AI-powered analysis operations'
    },
    {
      name: 'Weather',
      description: 'Weather data and forecasting'
    },
    {
      name: 'Route Optimization',
      description: 'Route planning and optimization'
    },
    {
      name: 'Invoicing',
      description: 'Invoice and payment operations'
    },
    {
      name: 'Reports',
      description: 'Reporting and analytics operations'
    }
  ];
};

// Export the API documentation generator
export default {
  generateOpenAPISpec,
  generatePaths,
  generateSchemas,
  generateSecuritySchemes,
  generateCommonResponses,
  generateCommonParameters,
  generateTags
};
