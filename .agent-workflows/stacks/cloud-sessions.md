# Stack: Cloud Agent Sessions

Tips for agents running in a sandboxed cloud container (such as Claude Code on the web) rather than on the maintainer's machine.

- **Commit and push before you stop.** The container is reclaimed after the session; anything not pushed is lost.
- **Docker may need starting.** If integration tests need Docker and it isn't running, start the daemon (`dockerd &`) first.
- **Tools may be missing.** Install pinned versions that match the repository (for example a code generator whose version appears in the generated file headers) rather than the latest.
- **Prefer environment variables to `.env` files** for local services in the sandbox, and never commit either.
- **Preinstalled browsers may not match the project's Playwright pin.** Point a temporary config at the preinstalled browser's `executablePath` instead of downloading another, and delete the temporary config before committing.
- **Corporate or sandbox proxies can break builds inside containers** (for example TLS errors in `docker build`). Work around them in the sandbox, never by changing the project's Dockerfiles or disabling TLS verification.
- **Say what you couldn't run.** If a check can't run in the sandbox, say so in the PR rather than claiming it passed.
- **PRs may open under the maintainer's account.** GitHub then rejects a review request to them; assign them instead.
