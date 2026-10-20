# Personal Profile App

[ English ](README.md) | [ Español ](README.es.md)

A backend API built with Express.js and structured using a clean, modern class-based architecture (`ProfileService`). Designed specifically to meet freeCodeCamp requirements and fully tested using Jest.

---

## Features

- **Clean Architecture:** Separates domain business logic (`ProfileService`) from the Express HTTP transport layer.
- **Modern JavaScript:** Implements class fields and ES module standards for a clean codebase.
- **Automated Unit Testing:** Includes a comprehensive suite of unit tests written in Jest to verify data integrity and service behavior.

---

## Installation

To set up the project locally, ensure you have [Node.js](https://nodejs.org/) installed, then clone the repository and install the dependencies:

```bash
git clone https://github.com/imalescript/fcc-back-end-development.git
cd 02-personal-profile-app
npm install
```

To start the server:

```bash
npm start
```

---

## Unit Testing

This project includes unit tests written in Jest to ensure the reliability of the profile service logic.

To run the test suite, execute:

```bash
npm test
```