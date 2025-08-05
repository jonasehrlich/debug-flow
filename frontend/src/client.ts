import log from "loglevel";
import createClient, { type Middleware } from "openapi-fetch";
import z from "zod";
import type { paths } from "./types/api";

const logger = log.getLogger("api-client");

/**
 * Middleware for the API client to log all requests and their params
 */
const loggerMiddleware: Middleware = {
  async onRequest({ request, params, schemaPath }) {
    if (logger.getLevel() > log.levels.DEBUG) {
      // Exit early if the logger's log level is larger than DEBUG.
      // No need to parse the request if it is anyways not logged
      return;
    }
    const args: unknown[] = [];
    if (Object.hasOwn(params, "query")) {
      args.push("queryParams:", params.query);
    }
    if (Object.hasOwn(params, "path")) {
      args.push("pathParams:", params.path);
    }
    if (
      request.method === "POST" &&
      request.headers.get("content-type")?.includes("application/json") &&
      request.body !== null
    ) {
      const body: unknown = await request.clone().json();
      args.push("body:", body);
    }

    logger.debug(request.method, schemaPath, ...args);
  },
};

export const client = createClient<paths>({ baseUrl: "/" });
client.use(loggerMiddleware);

const metaDataTypes = ["tag", "commit", "branch"] as const;
export type GitMetaDataType = (typeof metaDataTypes)[number];

interface CommonGitMetadata<T extends GitMetaDataType> {
  /** Tag/ commit ID / branch name */
  rev: string;
  /** Summary of the referring commit (for branches: HEAD) */
  summary: string;
  /** type of the metadata */
  type: T;
}
export type CommitMetadata = CommonGitMetadata<"commit">;
type TagMetadata = CommonGitMetadata<"tag">;
type BranchMetadata = CommonGitMetadata<"branch">;
export type GitMetadata = CommitMetadata | TagMetadata | BranchMetadata;

export function isCommitMetadata(
  metadata: GitMetadata | null,
): metadata is CommitMetadata {
  return !!metadata && metadata.type === "commit";
}

export function isTagMetadata(
  metadata: GitMetadata | null,
): metadata is TagMetadata {
  return !!metadata && metadata.type === "tag";
}
export function isBranchMetadata(
  metadata: GitMetadata | null,
): metadata is BranchMetadata {
  return !!metadata && metadata.type === "branch";
}

export function getGitMetaDataSchema() {
  return z.object({
    rev: z.string(),
    summary: z.string(),
    type: z.enum(metaDataTypes),
  });
}

export async function fetchCurrentHeadCommit(): Promise<CommitMetadata> {
  return await fetchCommitForRevision("HEAD");
}

/**
 * Fetches the commit for a revision.
 *
 * @param revision Revision to get the commit for. This can be a long hash, a short hash, a branch name,
 * a tag name fixed revisions such as `HEAD`.
 * @returns Commit metadata
 */
export const fetchCommitForRevision = async (
  revision: string,
): Promise<CommitMetadata> => {
  const { data, error } = await client.GET("/api/v1/git/commit/{revision}", {
    params: { path: { revision } },
  });

  if (error) {
    const errorMessage = `Error getting current HEAD revision: ${error.message}`;
    throw new Error(errorMessage);
  }
  return { rev: data.id, summary: data.summary, type: "commit" };
};

export async function checkoutRevision(revision: string): Promise<void> {
  const { error } = await client.POST("/api/v1/git/commit/{revision}", {
    params: { path: { revision } },
  });
  if (error) {
    throw new Error(
      `Error checking out revision ${revision}: ${error.message}`,
    );
  }
}

/**
 * Get commits over a range and filter them by commit ID and summary
 * @param args Filter parameters for the commits to receive
 * @returns API response
 */
export const fetchCommits = async (args?: {
  filter?: string;
  baseRev?: string;
  headRev?: string;
}) => {
  const { data, error } = await client.GET("/api/v1/git/commits", {
    params: { query: args },
  });
  if (error) {
    const errorMessage = `Error fetching Git commits: ${error.message}`;
    throw new Error(errorMessage);
  }
  return data.commits;
};

/**
 * Get the diffs between two revisions
 * @param range Range of the revisions
 * @returns Array of diffs for the files
 */
export const fetchDiffs = async (range?: {
  baseRev?: string;
  headRev?: string;
}) => {
  const { data, error } = await client.GET("/api/v1/git/diffs", {
    params: { query: range },
  });
  if (error) {
    throw new Error(`Error fetching diffs: ${error.message}`);
  }
  return data.diffs;
};

export async function fetchCommitsMetadata(
  filter?: string,
): Promise<CommitMetadata[]> {
  const data = await fetchCommits({ filter });
  return data.map((commit) => ({
    rev: commit.id,
    summary: commit.summary,
    type: "commit",
  }));
}

export async function fetchTags(filter?: string): Promise<TagMetadata[]> {
  const { data, error } = await client.GET("/api/v1/git/tags", {
    params: { query: { filter } },
  });

  if (error) {
    const errorMessage = `Error fetching Git tags: ${error.message}`;
    throw new Error(errorMessage);
  }

  return data.tags.map((tag) => ({
    rev: tag.tag,
    summary: tag.commit.summary,
    type: "tag",
  }));
}

export async function fetchBranches(
  filter?: string,
): Promise<BranchMetadata[]> {
  const { data, error } = await client.GET("/api/v1/git/branches", {
    params: { query: { filter } },
  });

  if (error) {
    const errorMessage = `Error fetching Git branches: ${error.message}`;
    throw new Error(errorMessage);
  }

  return data.branches.map((branch) => ({
    rev: branch.name,
    summary: branch.head.summary,
    type: "branch",
  }));
}

export async function fetchBranch(name: string): Promise<BranchMetadata> {
  const head = await fetchCommitForRevision(name);
  return {
    rev: name,
    summary: head.summary,
    type: "branch",
  };
}

export async function createBranch(
  name: string,
  revision: GitMetadata,
): Promise<BranchMetadata> {
  const { data, error } = await client.POST("/api/v1/git/branches", {
    params: {
      query: { name, revision: revision.rev },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    rev: data.name,
    summary: data.head.summary,
    type: "branch",
  };
}

export async function createTag(
  name: string,
  revision: GitMetadata,
): Promise<TagMetadata> {
  const { data, error } = await client.POST("/api/v1/git/tags", {
    params: {
      query: { name, revision: revision.rev },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    rev: data.tag,
    summary: data.commit.summary,
    type: "tag",
  };
}

export interface GitStatus {
  /** current checked out branch/ commit (detached HEAD) */
  revision: BranchMetadata | CommitMetadata;
}
export async function fetchStatus(): Promise<GitStatus> {
  const { data, error } = await client.GET("/api/v1/git/repository/status", {});
  if (error) {
    throw new Error(`Error fetching Git status: ${error.message}`);
  }

  let revision;
  if (data.currentBranch) {
    revision = {
      rev: data.currentBranch,
      summary: data.head.summary,
      type: "branch",
    } as BranchMetadata;
  } else {
    revision = {
      rev: data.head.id,
      summary: data.head.summary,
      type: "commit",
    } as CommitMetadata;
  }

  return {
    revision,
  };
}
