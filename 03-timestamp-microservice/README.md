# Timestamp Microservice

[ English ](README.md) | [ Español ](README.es.md)

An API built with Express.js and structured using a clean, modern class-based architecture (`TimestampService`). Designed specifically to meet freeCodeCamp requirements and fully tested using Jest and Supertest.

---

## Features

- **Clean Architecture:** Separates domain business logic (`TimestampService`) from the Express HTTP transport layer.
- **Modern JavaScript:** Implements class fields and ES module standards for a clean codebase.
- **Automated Testing:** Includes a comprehensive suite of unit tests written in Jest for the service logic, plus integration tests written in Supertest for the API routes.

---

## Installation

To set up the project locally, ensure you have [Node.js](https://nodejs.org/) installed, then clone the repository and install the dependencies:

```bash
git clone https://github.com/imalescript/fcc-back-end-development.git
cd 03-timestamp-microservice
npm install
```

To start the server:

```bash
npm start
```

The server runs on port `8000` and serves the API at `/api/:date`:

```bash
curl http://localhost:8000/api/2015-12-25
# {"unix":1451001600000,"utc":"Fri, 25 Dec 2015 00:00:00 GMT"}
```

---

## Testing

This project includes unit tests written in Jest for the timestamp service logic, and integration tests written in Supertest for the HTTP routes.

To run the test suite, execute:

```bash
npm test
```

To run the suite with a coverage report:

```bash
npm run test:coverage
```
