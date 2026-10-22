# freeCodeCamp Back End Development and APIs Certification

A collection of my solutions to the projects required for the **freeCodeCamp Back End Development and APIs** certification. Each project lives in its own folder and includes its own documentation, source code, and automated tests.

The purpose of this repository is to present the solutions in an organized way, so each project can be reviewed, run, and tested independently.

---

## Projects

| # | Project | Description |
|---|---|---|
| 01 | [Prime Number Checker Module](./01-prime-number-checker-module) | A JavaScript (CommonJS) module that determines whether an integer is a prime number. |
| 02 | [Personal Profile App](./02-personal-profile-app) | An Express API that manages personal profiles using a class-based service layer. |
| 03 | [Timestamp Microservice](./03-timestamp-microservice) | An Express API that converts dates to Unix timestamps and UTC strings. |
| 04 | [Chat App](./04-chat-app) | A real-time chat built with Node.js and WebSockets, with a simple browser interface. |
| 05 | [Family Movie Watchlist API](./05-family-movie-watchlist-api) | An Express API with JWT authentication and role-based access to manage family movie watchlists. |

---

## Tech Stack

- **Node.js** and **Express.js**
- **WebSockets** (`ws`)
- **JWT** and **bcryptjs**
- **Jest** and **Supertest** for testing

---

## Running a Project

Each project is independent. To run any of them:

```bash
cd <project-folder>
npm install
npm start
```

To run its test suite:

```bash
npm test
```

Some projects need a live server while running the freeCodeCamp test suite, so start them with `npm start` first. Check each project's README for its port, environment variables, and specific instructions.

---

## Structure

```
fcc-back-end-development/
├── 01-prime-number-checker-module/
├── 02-personal-profile-app/
├── 03-timestamp-microservice/
├── 04-chat-app/
└── 05-family-movie-watchlist-api/
```

Each folder contains an English (`README.md`) and Spanish (`README.es.md`) version of its documentation.

---

## License

This repository is licensed under the [MIT License](./LICENSE).

The freeCodeCamp project requirements and any seed data provided by freeCodeCamp belong to freeCodeCamp.
