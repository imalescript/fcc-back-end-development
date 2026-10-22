# Family Movie Watchlist API

[ English ](README.md) | [ Español ](README.es.md)

A family movie watchlist HTTP API built with Node.js, Express, JWT and bcryptjs, organized with a small class-based architecture (`AuthService` and `MovieInput`). Designed specifically to meet the freeCodeCamp requirements and fully tested using Jest and Supertest.

---

## Features

- **Clean Architecture:** Separates configuration, authentication, validation, HTTP routes and error handling into focused modules.
- **JWT Authentication:** Login issues a signed token; protected routes verify its signature, expiration and algorithm.
- **Role-Based Authorization:** `parent` users can modify any watchlist, while `child` users can only modify their own. Any authenticated user can read any watchlist, as required by the lab.
- **Secure Password Handling:** Passwords are compared with bcrypt; there is no plaintext password fallback.
- **Input Sanitization:** Movie titles and genres are trimmed, stripped of control characters and length-limited. Only whitelisted fields are accepted.
- **Consistent JSON Errors:** Invalid JSON, invalid IDs, validation failures and unexpected errors return JSON responses.
- **Configurable:** Port, JWT secret and token lifetime can be set with environment variables or a `.env` file.
- **Automated Testing:** Unit tests for middleware, services and validation, plus integration tests for the HTTP API.
- **JSON File Persistence:** Uses the freeCodeCamp-provided `utils/db.js` and `data/` files; no database is required.

---

## Installation

To set up the project locally, ensure you have [Node.js](https://nodejs.org/) installed (Node.js 20.11+ recommended), then clone the repository and install the dependencies:

```bash
git clone https://github.com/imalescript/fcc-back-end-development.git
cd 05-family-movie-watchlist-api
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

To start the server:

```bash
npm start
```

The API runs on `http://localhost:3000`.

> **Note:** freeCodeCamp runs its own test suite against a live server. Start the project with `npm start` before clicking **Run Tests**.

---

## Configuration

Copy `.env.example` to `.env` and adjust the values:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server listens on. |
| `JWT_SECRET` | `your_jwt_secret` | Secret used to sign and verify JWTs. Use a long random value in production. |
| `TOKEN_TTL` | `1h` | Lifetime of issued tokens (for example `15m`, `1h`, `7d`). |

Real environment variables always take precedence over the ones defined in the `.env` file:

```bash
PORT=4000 JWT_SECRET=my-secret npm start
```

If `JWT_SECRET` is missing, the server uses a development fallback and prints a warning. Always set a strong secret outside local development.

---

## Authentication

All watchlist routes require a Bearer token:

```http
Authorization: Bearer <token>
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "dad_miller",
  "password": "parent456"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

The seeded data includes these test accounts:

| Username | Password | Role |
|---|---|---|
| `dad_miller` | `parent456` | `parent` |
| `mom_miller` | `parent123` | `parent` |
| `jake_miller` | `child123` | `child` |
| `sophie_miller` | `child456` | `child` |

---

## API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Returns the API name. |
| `POST` | `/api/auth/login` | Public | Returns a JWT for valid credentials. |
| `GET` | `/api/watchlist/:userId` | Any authenticated user | Returns that user's watchlist. |
| `POST` | `/api/watchlist/:userId/movies` | Parent, or child for their own list | Adds a movie. |
| `PUT` | `/api/watchlist/:userId/movies/:movieId` | Parent, or child for their own list | Updates a movie. |
| `DELETE` | `/api/watchlist/:userId/movies/:movieId` | Parent, or child for their own list | Removes a movie. |

### Read a watchlist

```bash
curl http://localhost:3000/api/watchlist/1 \
  -H "Authorization: Bearer <token>"
```

```json
[
  {
    "id": 1,
    "title": "The Dark Knight",
    "genre": "Action",
    "watched": true
  }
]
```

### Add a movie

```bash
curl -X POST http://localhost:3000/api/watchlist/3/movies \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Inception","genre":"Sci-Fi"}'
```

`title` is required. `genre` is optional. New movies are created with `watched: false`.

### Update a movie

```bash
curl -X PUT http://localhost:3000/api/watchlist/3/movies/2 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"watched":true}'
```

Accepted fields: `title`, `genre` and `watched`. Unknown fields are ignored.

### Delete a movie

```bash
curl -X DELETE http://localhost:3000/api/watchlist/3/movies/2 \
  -H "Authorization: Bearer <token>"
```

---

## Validation and errors

- `title` must be a non-empty string of at most 200 characters.
- `genre`, when provided, must be a non-empty string of at most 80 characters.
- `watched`, when provided on update, must be a boolean.
- IDs must be positive integers.
- Request bodies are limited to 10kb.
- Unknown fields are ignored, so clients cannot mass-assign arbitrary properties.

| Status | Meaning |
|---|---|
| `400` | Missing credentials, invalid body, invalid ID or malformed JSON. |
| `401` | Missing, malformed, invalid or expired token; invalid login. |
| `403` | The authenticated user cannot modify that watchlist. |
| `404` | User, movie or route not found. |
| `413` | Request body exceeds the 10kb limit. |

Common error responses:

```json
{ "error": "No token provided." }
{ "error": "Invalid or expired token." }
{ "error": "Access denied" }
{ "error": "Invalid credentials." }
```

---

## Project structure

```
05-family-movie-watchlist-api/
├── app.js                  # Express app: middleware, routes and error handlers
├── index.js                # Entry point: starts the HTTP server
├── config.js               # Environment configuration
├── jest.config.cjs         # Jest configuration
├── middleware/
│   ├── authenticate.js     # Verifies the Bearer token and sets req.user
│   ├── authorize.js        # Parent/child authorization rules
│   └── error-handler.js    # JSON 404 and central error handler
├── routes/
│   ├── auth.js             # POST /api/auth/login
│   └── watchlist.js        # Watchlist CRUD routes
├── services/
│   └── auth-service.js     # AuthService: bcrypt comparison and JWT signing
├── utils/
│   ├── db.js               # freeCodeCamp-provided JSON persistence helpers
│   └── movie-input.js      # MovieInput: validation, sanitization and parseId
├── tests/
│   ├── setup.js            # Test environment variables
│   ├── unit/
│   │   ├── authenticate.test.js
│   │   ├── authorize.test.js
│   │   ├── auth-service.test.js
│   │   ├── error-handler.test.js
│   │   └── movie-input.test.js
│   └── integration/
│       └── api.test.js
├── data/
│   ├── users.json          # Seeded users
│   └── watchlists.json     # Seeded watchlists
├── .env.example            # Configuration template
├── .gitignore
└── package.json
```

---

## Testing

This project includes unit tests written in Jest for the middleware, the authentication service, the movie validation and the error handler, plus integration tests written in Jest and Supertest for the HTTP API.

To run the test suite, execute:

```bash
npm test
```

To run the suite in watch mode:

```bash
npm run test:watch
```

To run the suite with a coverage report:

```bash
npm run test:coverage
```

The integration tests use the exported Express app directly, so they do not require a running server. They snapshot `data/watchlists.json` before the suite and restore it after each test, keeping the seeded data intact.

The current suite contains 90 tests across 6 suites.

---

## Credits

Built as part of the freeCodeCamp Back End Development and APIs certification. The seed data and `utils/db.js` are provided by freeCodeCamp.
