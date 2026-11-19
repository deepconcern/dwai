# syntax=docker/dockerfile:1

# The API as a static binary on a distroless base. Game data and migrations are
# embedded in the binary, so nothing else is copied. Configure it with
# environment variables (see README.md).

FROM golang:1.25 AS build
WORKDIR /src

# Download modules first, so code changes don't invalidate this layer.
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/dwai-api ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot

# Reported by the apiVersion query; CI sets it to the version or commit.
ARG API_VERSION=dev
ENV API_VERSION=$API_VERSION

COPY --from=build /out/dwai-api /dwai-api

EXPOSE 5000
USER nonroot:nonroot
ENTRYPOINT ["/dwai-api"]
