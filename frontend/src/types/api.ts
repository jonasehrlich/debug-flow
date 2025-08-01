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
        /**
         * List debug flows
         * @description List all debug flows
         */
        get: operations["list_flows"];
        put?: never;
        /**
         * Create debug flow
         * @description Create debug flow
         */
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
        /**
         * Get debug flow
         * @description Get debug flow
         */
        get: operations["get_flow"];
        put?: never;
        /**
         * Store debug flow
         * @description Store debug flow
         */
        post: operations["store_flow"];
        /**
         * Delete debug flow
         * @description Delete debug flow
         */
        delete: operations["delete_flow"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/git/branches": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List branches
         * @description List all local branches in the repository, optionally filtered by a glob pattern.
         */
        get: operations["list_branches"];
        put?: never;
        /**
         * Create new branch
         * @description Creates a new branch at the specified revision.
         */
        post: operations["create_branch"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/git/commit/{revision}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get commit for a revision
         * @description Get a single commit by its revision.
         *         The revision can be anything accepted by `git rev-parse`. For a branch it will return the HEAD of the branch.
         */
        get: operations["get_revision"];
        put?: never;
        /**
         * Checkout commit for a revision
         * @description Checkout a commit by its revision.
         *         The revision can be anything accepted by `git rev-parse`. For a branch it will checkout the HEAD of the branch.
         */
        post: operations["checkout_revision"];
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
        /**
         * List commits
         * @description List the commits in a range similar to `git log`, the commits are always ordered from newest to oldest in the tree.
         */
        get: operations["list_commits"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/git/diffs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List diffs
         * @description List the diffs in a commit range
         */
        get: operations["list_diffs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/git/repository/status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get repository status
         * @description Get the current status of the repository, including the current HEAD commit and branch.
         */
        get: operations["get_repository_status"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/git/tags": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List tags
         * @description List the tags in the repository
         */
        get: operations["list_tags"];
        put?: never;
        /**
         * Create new tag
         * @description Creates a new lightweight git tag with the specified name on the provided revision.
         */
        post: operations["create_tag"];
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
        Branch: {
            /** @description Commit ID of the branch head */
            head: components["schemas"]["Commit"];
            /** @description Name of the branch */
            name: string;
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
            /** @description Kind of the diff */
            kind: components["schemas"]["DiffKind"];
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
        DiffKind: "binary" | "text";
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
        ListBranchesResponse: {
            /** @description Found branches */
            branches: components["schemas"]["Branch"][];
        };
        ListCommitsResponse: {
            /** @description Array of commits between the base and head commit IDs
             *     in reverse chronological order. */
            commits: components["schemas"]["Commit"][];
        };
        ListDiffsResponse: {
            /** @description Array of diffs in this commit range */
            diffs: components["schemas"]["Diff"][];
        };
        ListFlowsResponse: {
            flows: components["schemas"]["FlowMetadata"][];
        };
        ListTagsResponse: {
            tags: components["schemas"]["TaggedCommit"][];
        };
        ReactFlowState: {
            /** @description Edges of the reactflow state, the types of the nodes are managed on the frontend */
            edges: unknown[];
            /** @description Nodes of the reactflow state, the types of the nodes are managed on the frontend */
            nodes: unknown[];
        };
        RepositoryStatusResponse: {
            /** @description The current branch name, not set if in a detached HEAD state */
            currentBranch?: string | null;
            /** @description The current HEAD commit */
            head: components["schemas"]["Commit"];
        };
        Signature: {
            email: string;
            name: string;
        };
        TaggedCommit: {
            /** @description Commit the tag is on */
            commit: components["schemas"]["Commit"];
            /** @description Tag on the commit */
            tag: string;
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
    list_branches: {
        parameters: {
            query?: {
                /** @description string filter against with the branch name is matched */
                filter?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of branches */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListBranchesResponse"];
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
    create_branch: {
        parameters: {
            query: {
                /** @description Name of the branch to create */
                name: string;
                /** @description Revision to create the branch on, this can be a short hash, full hash or a tag */
                revision: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Branch created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Branch"];
                };
            };
            /** @description Bad request */
            400: {
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
    get_revision: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description The revision of the commit to retrieve.
                 *
                 *     This can be the short hash, full hash, a tag, or any other reference such as `HEAD`, a branch name or a tag name
                 * @example HEAD
                 */
                revision: string;
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
    checkout_revision: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /**
                 * @description The revision of the commit to checkout.
                 *
                 *     This can be the short hash, full hash, a tag, or any other reference such as `HEAD`, a branch name or a tag name
                 * @example HEAD
                 */
                revision: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Revision checked out successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["Commit"];
                };
            };
            /** @description Revision not found */
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
                /** @description string filter for the commits. Filters commits by their ID or summary. */
                filter?: string | null;
                /** @description The base revision of the range, this can be short hash, full hash, a tag,
                 *     or any other reference such a branch name. If empty, the first commit is used. */
                baseRev?: string | null;
                /** @description The head revision of the range, this can be short hash, full hash, a tag,
                 *     or any other reference such a branch name. If empty, the current HEAD is used. */
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
    list_diffs: {
        parameters: {
            query?: {
                /** @description The base revision of the range, this can be short hash, full hash, a tag,
                 *     or any other reference such a branch name. If empty, the first commit is used. */
                baseRev?: string | null;
                /** @description The head revision of the range, this can be short hash, full hash, a tag,
                 *     or any other reference such a branch name. If empty, the current HEAD is used. */
                headRev?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of diffs */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListDiffsResponse"];
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
    get_repository_status: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Repository status */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["RepositoryStatusResponse"];
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
    list_tags: {
        parameters: {
            query?: {
                /** @description String filter against which the tag name is matched. */
                filter?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of tags */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListTagsResponse"];
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
    create_tag: {
        parameters: {
            query: {
                /** @description Name of the tag to create */
                name: string;
                /** @description Revision to tag, this can be a short hash, full hash or a tag */
                revision: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Tag created successfully */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaggedCommit"];
                };
            };
            /** @description Bad request */
            400: {
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
}
