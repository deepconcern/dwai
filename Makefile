# Repo-wide checks. The git hooks (lefthook.yml) run the same tools on staged files only.

.PHONY: check fmt fmt-api fmt-app lint lint-api lint-app test test-api test-app test-e2e test-integration typecheck

# check also runs the API integration tests, which need Docker (see dwai-api/README.md).
check: lint typecheck test test-integration

fmt: fmt-api fmt-app

fmt-api:
	cd dwai-api && golangci-lint fmt

fmt-app:
	cd dwai-app && bun run format

lint: lint-api lint-app

lint-api:
	cd dwai-api && golangci-lint run ./...

lint-app:
	cd dwai-app && bun run format:check && bun run lint

typecheck:
	cd dwai-app && bun run typecheck

test: test-api test-app

test-api:
	cd dwai-api && go test ./...

# Needs Docker: starts a throwaway Postgres container.
test-integration:
	cd dwai-api && go test -tags integration ./internal/graph/

test-app:
	cd dwai-app && bun run test

# Not part of check: needs Docker and a Chromium download, and is slower. Starts
# its own Postgres container, API (port 5100), and app (port 3100).
test-e2e:
	cd dwai-app && bunx playwright install chromium && bun run test:e2e
