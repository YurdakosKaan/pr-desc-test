# PR Description Test Service

Small Bun + Express TypeScript service with non‑trivial structure so you can open Pull Requests and observe automatic PR description generation and summarization.

## Stack

- Bun runtime
- Express HTTP server
- TypeScript
- zod for validation
- JSON file-based persistence
- Bun test

## Endpoints

- `GET /health` – liveness
- `GET /api/authors` – list authors
- `POST /api/authors` – create author `{ name, country? }`
- `GET /api/authors/:id` – get author
- `GET /api/books` – list books
  - Supports search and pagination: `q`, `genre`, `limit`, `offset`, `sort` (title|year|rating), `order` (asc|desc)
- `POST /api/books` – create book `{ title, authorId, year?, genres[], rating? }`
- `PATCH /api/books/:id` – update book
- `DELETE /api/books/:id` – remove book
- `GET /api/books/stats/library` – aggregate library stats (includes review count)
- `GET /api/books/stats/author/:id` – author specific stats
- `GET /api/reviews/book/:bookId` – get all reviews for a book (sorted by newest first)
- `POST /api/reviews` – create review `{ bookId, reviewerName, rating (1-5), comment }`
- `DELETE /api/reviews/:id` – delete a review

### Middleware
- Request ID: every response includes `x-request-id` (respects incoming header)
- CORS: allows requests from provided Origin and supports preflight
- Rate Limiting: sliding window rate limiter (default: 100 req/min per IP). Returns 429 with `Retry-After` and `X-RateLimit-*` headers when exceeded

## Develop

1) Install Bun if not already installed.

```bash
curl -fsSL https://bun.sh/install | bash
```

2) Install deps and run dev server:

```bash
bun install
bun run dev
# -> http://localhost:3000/health
```

Data is persisted to `data/library.json` by default. Set `STORAGE_PATH` env var to customize:

```bash
STORAGE_PATH=/path/to/custom.json bun run dev
```

Rate limiting is configurable via env vars (default: 100 requests per 60 seconds):

```bash
RATE_LIMIT_MAX=200 RATE_LIMIT_WINDOW_MS=30000 bun run dev
```

3) Run tests:

```bash
bun run test
```

## Docker

Build and run with Docker:

```bash
docker build -t pr-desc-test-service .
docker run -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e PORT=3000 \
  -e STORAGE_PATH=/app/data/library.json \
  pr-desc-test-service
```

Or using Docker Compose:

```bash
docker-compose up
```

See `docker-compose.yml` for configuration.

## CI/CD

GitHub Actions workflow runs tests on push and pull requests to `main` and `develop` branches.

See `.github/workflows/ci.yml` for configuration.

## Good PR ideas (to trigger summarization)

- Introduce `reviews` with text sentiment analysis utility.
- Add OpenAPI spec and generated client.

Each idea is sizable enough to produce meaningful diffs for PR description summarization.

