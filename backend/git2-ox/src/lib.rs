pub mod branch;
pub mod commit;
pub mod diff;
pub mod error;
pub mod repository;
pub mod tag;
pub mod utils;

pub use branch::Branch;
pub use commit::Commit;
pub use diff::Diff;
pub use repository::Repository;
pub use tag::TaggedCommit;

type Result<T> = std::result::Result<T, error::Error>;
