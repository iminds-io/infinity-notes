# Public Release Safety Design

## Goal

Prepare Infinity Notes for open-source publication without exposing private or generated example content.

## Strategy

The repository should include one small, synthetic example under `examples/demo-basic/`. All private, generated, or book-derived examples remain local-only and are ignored by git.

Publishing safety uses three layers:

1. Git ignore rules keep private/generated examples, nested dependencies, build output, Wrangler state, and environment files out of the repository.
2. Package `files` allowlists keep npm tarballs constrained to intentional package payloads.
3. A release check validates git visibility, package allowlists, and `npm pack --dry-run` contents before publication.

## Public Example

The public example is intentionally small and synthetic. It demonstrates notes, concept links, and thread links without using generated book data or private content.

## Release Guard

The release guard is a local script invoked by `pnpm pack:check` and included in `pnpm verify`. It fails if:

- any git-visible file under `examples/` is outside the public allowlist;
- any publishable package lacks a `files` allowlist;
- any npm dry-run tarball includes `examples/`, local env files, nested dependencies, build caches, or Wrangler state.

## GitHub Remote

No GitHub remote is added by this change. The repository can be pushed to `git@github.com:iminds-io/infinity-notes.git` later, after manual approval.
