/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
    "/api/v1/flows": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description List all debug flows */
        get: operations["list_flows"];
        put?: never;
        /** @description Create a debug flow */
        post: operations["create_flow"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/flows/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Get a debug flow */
        get: operations["get_flow"];
        put?: never;
        /** @description Store a debug flow */
        post: operations["store_flow"];
        /** @description Delete a debug flow */
        delete: operations["delete_flow"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/git/commit/{commit_id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Get a commit */
        get: operations["get_commit"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/git/commits": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description List commits */
        get: operations["list_commits"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        ApiStatusDetailResponse: {
            /** @description More details */
            details?: string[] | null;
            /** @description Error message */
            message: string;
            /** @description Canonical reason for the error */
            reason: string;
            /**
             * Format: int32
             * @description HTTP status code
             */
            status: number;
        };
        /** @description Basic serializable API status response */
        ApiStatusResponse: {
            /** @description Canonical reason for the error */
            reason: string;
            /**
             * Format: int32
             * @description HTTP status code
             */
            status: number;
        };
        Commit: {
            author: components["schemas"]["Signature"];
            body: string;
            committer: components["schemas"]["Signature"];
            id: string;
            summary: string;
            /** Format: date-time */
            time: string;
        };
        CreateFlowRequest: {
            name: string;
        };
        CreateFlowResponse: {
            flow: components["schemas"]["FlowMetadata"];
        };
        Diff: {
            /** @description Type of the diff */
            diffType: components["schemas"]["DiffType"];
            new?: null | components["schemas"]["DiffFile"];
            old?: null | components["schemas"]["DiffFile"];
            /** @description Patch between old and new */
            patch: string;
        };
        DiffFile: {
            /** @description Content of the diff file */
            content?: string | null;
            /** @description Path to the diff file */
            path?: string | null;
        };
        /** @enum {string} */
        DiffType: "binary" | "text";
        FlowData: {
            /** @description Name of the debug flow */
            name: string;
            /** @description Representation of the reactflow state */
            reactflow: components["schemas"]["ReactFlowState"];
        };
        FlowMetadata: {
            /** @description ID of the debug flow */
            id: string;
            /**
             * Format: date-time
             * @description Last modified date
             */
            lastModifiedDate: string;
            /** @description Name of the debug flow */
            name: string;
            /** @description Number of edges in the debug flow */
            numEdges: number;
            /** @description Number of nodes in the debug flow */
            numNodes: number;
        };
        FullFlowRequestResponse: {
            flow: components["schemas"]["FlowData"];
        };
        ListCommitsResponse: {
            /** @description Array of commits between the base and head commit IDs
             *     in reverse chronological order. */
            commits: components["schemas"]["Commit"][];
            diffs: components["schemas"]["Diff"][];
        };
        ListFlowsResponse: {
            flows: components["schemas"]["FlowMetadata"][];
        };
        ReactFlowState: {
            /** @description Edges of the reactflow state, the types of the nodes are managed on the frontend */
            edges: unknown[];
            /** @description Nodes of the reactflow state, the types of the nodes are managed on the frontend */
            nodes: unknown[];
        };
        Signature: {
            email: string;
            name: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    list_flows: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List debug flows */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListFlowsResponse"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusDetailResponse"];
                };
            };
        };
    };
    create_flow: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateFlowRequest"];
            };
        };
        responses: {
            /** @description Debug Flow created */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CreateFlowResponse"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusDetailResponse"];
                };
            };
        };
    };
    get_flow: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Debug flow is available */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FullFlowRequestResponse"];
                };
            };
            /** @description File not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusDetailResponse"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusDetailResponse"];
                };
            };
        };
    };
    store_flow: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FullFlowRequestResponse"];
            };
        };
        responses: {
            /** @description Debug flow is stored */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusResponse"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusDetailResponse"];
                };
            };
        };
    };
    delete_flow: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Debug flow is deleted */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusResponse"];
                };
            };
            /** @description File not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusDetailResponse"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusDetailResponse"];
                };
            };
        };
    };
    get_commit: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description The ID of the commit to retrieve
                 * @example abc123
                 */
                commit_id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Commit exists */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Commit"];
                };
            };
            /** @description Commit not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusDetailResponse"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusDetailResponse"];
                };
            };
        };
    };
    list_commits: {
        parameters: {
            query?: {
                /** @description The base revision of the range, if empty, the first commit is used. */
                baseRev?: string | null;
                /** @description The head revision of the range, if empty, the current HEAD is used. */
                headRev?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of commits */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListCommitsResponse"];
                };
            };
            /** @description Internal server error */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ApiStatusDetailResponse"];
                };
            };
        };
    };
}
