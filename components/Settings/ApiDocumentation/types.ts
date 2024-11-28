export interface ApiEndpoint {
    method: string;
    path: string;
    description: string;
    parameters?: Array<{
        name: string;
        type: string;
        description: string;
        required?: boolean;
    }>;
}

export interface ApiError {
    code: string;
    message: string;
    description: string;
    solution?: string;
}

export interface ApiDefinition {
    id: string;
    name: string;
    description: string;
    category: string;
    features: string[];
    protocols: string[];
    formats: string[];
    pricing?: string;
    limits?: Record<string, string>;
    authentication: {
        type: string;
        description: string;
        steps?: string[];
    };
    endpoints: ApiEndpoint[];
    errors: ApiError[];
    isFavorite?: boolean;
}