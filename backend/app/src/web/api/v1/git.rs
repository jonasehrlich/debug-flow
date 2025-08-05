use crate::{actors, web, web::api};

use axum::extract::{Path, Query, State};
use axum::{Json, routing};
use git2_ox::commit;
use serde::{Deserialize, Serialize};
use utoipa::{IntoParams, ToSchema};

pub fn router() -> routing::Router<web::AppState> {
    routing::Router::new()
        .route(
            "/commit/{revision}",
            routing::get(get_revision).post(checkout_revision),
        )
        .route("/commits", routing::get(list_commits))
        .route("/diffs", routing::get(list_diffs))
        .route("/tags", routing::get(list_tags).post(create_tag))
        .route("/branches", routing::get(list_branches).post(create_branch))
        .route("/repository/status", routing::get(get_repository_status))
}

#[derive(utoipa::OpenApi)]
#[openapi(paths(get_revision, checkout_revision, list_commits,  list_tags, create_tag, list_branches, create_branch, get_repository_status, list_diffs), tags((name = "Git Repository", description="Git Repository related endpoints")) )]
pub(super) struct ApiDoc;

#[utoipa::path(
    get,
    path = "/commit/{revision}",
    params(
        ("revision",
        description = "The revision of the commit to retrieve.\n\n\
            This can be the short hash, full hash, a tag, or any other \
            reference such as `HEAD`, a branch name or a tag name", example = "HEAD"),
    ),
    summary="Get commit for a revision",
    description = "Get a single commit by its revision.
    The revision can be anything accepted by `git rev-parse`. For a branch it will return the HEAD of the branch.",
    responses(
        (status = http::StatusCode::OK, description = "Commit exists", body = commit::Commit),
        (status = http::StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error", body = api::ApiStatusDetailResponse),
        (status = http::StatusCode::NOT_FOUND, description = "Commit not found", body = api::ApiStatusDetailResponse),
    )
)]
async fn get_revision(
    State(state): State<web::AppState>,
    Path(commit_id): Path<String>,
) -> Result<Json<commit::Commit>, api::AppError> {
    let actor = state.git_actor();
    let msg = actors::git::GetRevision {
        revision: commit_id,
    };
    let commit = actor.call(msg).await??;

    // .map_err(api::AppError::from)?;
    Ok(Json(commit))
}

#[utoipa::path(
    post,
    path = "/commit/{revision}",
    params(
        ("revision",
        description = "The revision of the commit to checkout.\n\n\
            This can be the short hash, full hash, a tag, or any other \
            reference such as `HEAD`, a branch name or a tag name", example = "HEAD"),
    ),
    summary="Checkout commit for a revision",
    description = "Checkout a commit by its revision.
    The revision can be anything accepted by `git rev-parse`. For a branch it will checkout the HEAD of the branch.",
    responses(
        (status = http::StatusCode::OK, description = "Revision checked out successfully", body = commit::Commit),
        (status = http::StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error", body = api::ApiStatusDetailResponse),
        (status = http::StatusCode::NOT_FOUND, description = "Revision not found", body = api::ApiStatusDetailResponse),
    )
)]
async fn checkout_revision(
    State(state): State<web::AppState>,
    Path(commit_id): Path<String>,
) -> Result<Json<commit::Commit>, api::AppError> {
    let actor = state.git_actor();
    let msg = actors::git::CheckoutRevision {
        revision: commit_id,
    };
    let commit = actor.call(msg).await??;
    Ok(Json(commit))
}

#[derive(Serialize, ToSchema, Deserialize, IntoParams)]
#[serde(rename_all = "camelCase")]
struct ListCommitsQuery {
    /// string filter for the commits. Filters commits by their ID or summary.
    filter: Option<String>,

    // serde(flatten) does not work here, see https://github.com/juhaku/utoipa/issues/841
    /// The base revision of the range, this can be short hash, full hash, a tag,
    /// or any other reference such a branch name. If empty, the first commit is used.
    base_rev: Option<String>,
    /// The head revision of the range, this can be short hash, full hash, a tag,
    /// or any other reference such a branch name. If empty, the current HEAD is used.
    head_rev: Option<String>,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
struct ListCommitsResponse {
    /// Array of commits between the base and head commit IDs
    /// in reverse chronological order.
    commits: Vec<git2_ox::Commit>,
}

#[utoipa::path(
    get,
    path = "/commits",
    summary = "List commits",
    description = "List the commits in a range similar to `git log`, \
    the commits are always ordered from newest to oldest in the tree.",
    params(ListCommitsQuery),
    responses(
        (status = http::StatusCode::OK, description = "List of commits", body = ListCommitsResponse),
        (status = http::StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error", body = api::ApiStatusDetailResponse),
    )
)]
async fn list_commits(
    State(state): State<web::AppState>,
    Query(query): Query<ListCommitsQuery>,
) -> Result<Json<ListCommitsResponse>, api::AppError> {
    let actor = state.git_actor();
    let msg = actors::git::ListCommits {
        base_rev: query.base_rev,
        head_rev: query.head_rev,
        filter: query.filter,
    };
    let commits = actor.call(msg).await??;
    Ok(Json(ListCommitsResponse { commits }))
}

#[derive(Serialize, ToSchema, Deserialize, IntoParams)]
#[serde(rename_all = "camelCase")]
struct CommitRangeQuery {
    /// The base revision of the range, this can be short hash, full hash, a tag,
    /// or any other reference such a branch name. If empty, the first commit is used.
    base_rev: Option<String>,
    /// The head revision of the range, this can be short hash, full hash, a tag,
    /// or any other reference such a branch name. If empty, the current HEAD is used.
    head_rev: Option<String>,
}

#[derive(Serialize, ToSchema, IntoParams)]
#[serde(rename_all = "camelCase")]
struct ListDiffsResponse {
    /// Array of diffs in this commit range
    diffs: Vec<git2_ox::Diff>,
}

#[utoipa::path(
    get,
    path = "/diffs",
    summary = "List diffs",
    description = "List the diffs in a commit range",
    params(CommitRangeQuery),
    responses(
        (status = http::StatusCode::OK, description = "List of diffs", body = ListDiffsResponse),
        (status = http::StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error", body = api::ApiStatusDetailResponse),
    )
)]
async fn list_diffs(
    State(state): State<web::AppState>,
    Query(query): Query<CommitRangeQuery>,
) -> Result<Json<ListDiffsResponse>, api::AppError> {
    let actor = state.git_actor();
    let msg = actors::git::ListDiffs {
        base_rev: query.base_rev,
        head_rev: query.head_rev,
    };
    let diffs = actor.call(msg).await??;
    Ok(Json(ListDiffsResponse { diffs }))
}

#[derive(ToSchema, Serialize, Deserialize, IntoParams)]
#[serde(rename_all = "camelCase")]
struct ListTagsQuery {
    /// String filter against which the tag name is matched.
    filter: Option<String>,
}

#[derive(ToSchema, Serialize)]
struct ListTagsResponse {
    tags: Vec<git2_ox::TaggedCommit>,
}

#[utoipa::path(
    get,
    path = "/tags",
    summary = "List tags",
    description = "List the tags in the repository",
    params(ListTagsQuery),
    responses(
        (status = http::StatusCode::OK, description = "List of tags", body = ListTagsResponse),
        (status = http::StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error", body = api::ApiStatusDetailResponse),
    )
)]
async fn list_tags(
    State(state): State<web::AppState>,
    Query(query): Query<ListTagsQuery>,
) -> Result<Json<ListTagsResponse>, api::AppError> {
    let actor = state.git_actor();
    let msg = actors::git::ListTags {
        filter: query.filter,
    };
    let tags = actor.call(msg).await??;
    Ok(Json(ListTagsResponse { tags }))
}

#[derive(ToSchema, Serialize, Deserialize, IntoParams)]
#[serde(rename_all = "camelCase")]
struct CreateTagQuery {
    /// Name of the tag to create
    name: String,
    /// Revision to tag, this can be a short hash, full hash or a tag
    revision: String,
}

#[utoipa::path(
    post,
    path = "/tags",
    summary = "Create new tag",
    description = "Creates a new lightweight git tag with the specified name on the provided revision.",
    params(CreateTagQuery),
    responses(
        (status = http::StatusCode::CREATED, description = "Tag created successfully", body = git2_ox::TaggedCommit),
        (status = http::StatusCode::BAD_REQUEST, description = "Bad request", body = api::ApiStatusDetailResponse),
        (status = http::StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error", body = api::ApiStatusDetailResponse),
    )
)]
async fn create_tag(
    State(state): State<web::AppState>,
    Query(query): Query<CreateTagQuery>,
) -> Result<Json<git2_ox::TaggedCommit>, api::AppError> {
    let actor = state.git_actor();
    let msg = actors::git::CreateTag {
        name: query.name,
        revision: query.revision,
        force: false,
    };
    let tag = actor.call(msg).await??;
    Ok(Json(tag))
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
struct ListBranchesResponse {
    /// Found branches
    branches: Vec<git2_ox::Branch>,
}

#[derive(ToSchema, Serialize, Deserialize, IntoParams)]
#[serde(rename_all = "camelCase")]
struct ListBranchesQuery {
    /// string filter against with the branch name is matched
    filter: Option<String>,
}

/// List branches in the repository
#[utoipa::path(
    get,
    path = "/branches",
    summary = "List branches",
    description = "List all local branches in the repository, optionally filtered by a glob pattern.",
    params(ListBranchesQuery),
    responses(
        (status = http::StatusCode::OK, description = "List of branches", body = ListBranchesResponse),
        (status = http::StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error", body = api::ApiStatusDetailResponse),
    )
)]
async fn list_branches(
    State(state): State<web::AppState>,
    Query(query): Query<ListBranchesQuery>,
) -> Result<Json<ListBranchesResponse>, api::AppError> {
    let actor = state.git_actor();
    let msg = actors::git::ListBranches {
        filter: query.filter,
    };
    let branches = actor.call(msg).await??;
    Ok(Json(ListBranchesResponse { branches }))
}

#[derive(ToSchema, Serialize, Deserialize, IntoParams)]
#[serde(rename_all = "camelCase")]
struct CreateBranchQuery {
    /// Name of the branch to create
    name: String,
    /// Revision to create the branch on, this can be a short hash, full hash or a tag
    revision: String,
}

#[utoipa::path(
    post,
    path = "/branches",
    summary = "Create new branch",
    description = "Creates a new branch at the specified revision.",
    params(CreateBranchQuery),
    responses(
        (status = http::StatusCode::CREATED, description = "Branch created successfully", body = git2_ox::Branch),
        (status = http::StatusCode::BAD_REQUEST, description = "Bad request", body = api::ApiStatusDetailResponse),
        (status = http::StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error", body = api::ApiStatusDetailResponse),
    )
)]
async fn create_branch(
    State(state): State<web::AppState>,
    Query(query): Query<CreateBranchQuery>,
) -> Result<Json<git2_ox::Branch>, api::AppError> {
    let actor = state.git_actor();
    let msg = actors::git::CreateBranch {
        name: query.name,
        revision: query.revision,
        force: false,
    };
    let branch = actor.call(msg).await??;
    Ok(Json(branch))
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
struct RepositoryStatusResponse {
    /// The current HEAD commit
    head: git2_ox::Commit,
    /// The current branch name, not set if in a detached HEAD state
    current_branch: Option<String>,
}

#[utoipa::path(
    get,
    path = "/repository/status",
    summary = "Get repository status",
    description = "Get the current status of the repository, including the current HEAD commit and branch.",
    responses(
        (status = http::StatusCode::OK, description = "Repository status", body = RepositoryStatusResponse),
        (status = http::StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error", body = api::ApiStatusDetailResponse),
    ))
]
async fn get_repository_status(
    State(state): State<web::AppState>,
) -> Result<Json<RepositoryStatusResponse>, api::AppError> {
    let actor = state.git_actor();
    let msg = actors::git::GetRepositoryStatus;
    let status = actor.call(msg).await??;
    Ok(Json(RepositoryStatusResponse {
        head: status.head,
        current_branch: status.current_branch,
    }))
}
