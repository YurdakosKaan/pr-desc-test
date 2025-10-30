# PR Description Test Service

Small Bun + Express TypeScript service with non‑trivial structure so you can open Pull Requests and observe automatic PR description generation and summarization.

## Stack

- Bun runtime
- Express HTTP server
- TypeScript
- zod for validation
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
- `GET /api/books/stats/library` – aggregate library stats
- `GET /api/books/stats/author/:id` – author specific stats

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

3) Run tests:

```bash
bun run test
```

## Good PR ideas (to trigger summarization)

- Add persistence layer (file or SQLite) instead of in‑memory store.
- Implement pagination and sorting for `GET /api/books`.
- Add search by `title` and `genre` with query params.
- Introduce `reviews` with text sentiment analysis utility.
- Add OpenAPI spec and generated client.
- Create a Dockerfile and GitHub Actions workflow.
- Improve validation and error format, add middleware.
- Add rate limiting or request logging middleware.

Each idea is sizable enough to produce meaningful diffs for PR description summarization.

