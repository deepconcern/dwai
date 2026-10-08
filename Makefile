# Repo-wide checks. The git hooks (lefthook.yml) run the same tools on staged files only.

.PHONY: check fmt fmt-api fmt-app lint lint-api lint-app test test-api test-app typecheck

check: lint typecheck test

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

test-app:
	cd dwai-app && bun run test
