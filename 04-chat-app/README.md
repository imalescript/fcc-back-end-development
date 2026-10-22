# Chat App

[ English ](README.md) | [ Español ](README.es.md)

A real-time chat application built with Node.js and the [`ws`](https://github.com/websockets/ws) package, structured with a clean, modern class-based architecture (`ChatService`). Designed specifically to meet the freeCodeCamp requirements and fully tested using Jest and Supertest.

---

## Features

- **Clean Architecture:** Separates the domain logic (`ChatService`) from the HTTP transport layer, the WebSocket wiring and the configuration.
- **Resilient by design:** A malformed payload never crashes the server, oversized frames are rejected and dead connections are detected with a ping/pong heartbeat.
- **Secure by default:** The author of a message is the user of the handshake, so no client can post as somebody else.
- **Configurable:** Every tunable value (port, frame size, heartbeat interval, message length) can be set with environment variables or a `.env` file.
- **Automated Testing:** Unit tests for the service and the configuration, plus integration tests for the HTTP routes and the WebSocket protocol.
- **Modern interface:** Responsive dark interface built with plain CSS, no frameworks.

---

## Installation

To set up the project locally, ensure you have [Node.js](https://nodejs.org/) installed, then clone the repository and install the dependencies:

```bash
git clone https://github.com/imalescript/fcc-back-end-development.git
cd 04-chat-app
npm install
```

To start the server:

```bash
npm start
```

The server runs on port `3001`. Open `http://localhost:3001` in a browser to use the chat, and open a second tab to chat between two users.

> **Note:** freeCodeCamp runs its own test suite against a live server. Start the project with `npm start` before clicking **Run Tests**.

---

## Configuration

Every value has a default, so the server works without any extra file. Copy `.env.example` to `.env` to change them:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Port the server listens on. |
| `MAX_PAYLOAD_BYTES` | `16384` | Largest WebSocket frame accepted, in bytes. |
| `HEARTBEAT_INTERVAL_MS` | `30000` | How often the server pings the clients to find the dead ones. |
| `MAX_MESSAGE_LENGTH` | `1000` | Longest chat message accepted, in characters. |
| `USE_CONNECTION_IDENTITY` | `true` | `true` uses the user of the handshake as the author of every message, `false` uses the username sent inside each payload. |

Real environment variables always take precedence over the ones defined in the `.env` file:

```bash
PORT=4000 npm start
```

An invalid value is reported on the console and the default is used instead, so a typo never breaks the server.

---

## WebSocket protocol

Connect to `ws://localhost:3001?username=YourName`. The username is optional and it is sanitized by the server.

**Client to server:**

```json
{ "username": "Camper", "text": "Hello there" }
```

**Server to client:**

```json
{ "type": "system", "text": "Camper joined" }
{ "type": "chat", "username": "Camper", "text": "Hello there" }
{ "type": "error", "text": "Invalid message format" }
```

---

## Project structure

```
04-chat-app/
├── server.js              # Entry point: HTTP server, WebSocket server and lifecycle
├── server.test.js         # Integration tests for the HTTP routes and the WebSocket protocol
├── src/
│   ├── config.js          # Environment variables with validated defaults
│   ├── config.test.js     # Unit tests for the configuration
│   ├── chat-service.js    # ChatService: the rules of the chat
│   ├── chat-service.test.js # Unit tests for the chat service
│   └── http.js            # Static file serving and the HTTP helpers
├── public/
│   ├── index.html         # Chat interface
│   ├── styles.css         # Dark theme
│   └── script.js          # Browser WebSocket client
├── .env.example           # Configuration template
└── package.json
```

---

## Testing

This project includes unit tests written in Jest for the chat service and the configuration, and integration tests written in Jest and Supertest for the HTTP routes and the WebSocket protocol.

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

---

## Credits

The emblem of the header is the *bat* icon by [Font Awesome](https://fontawesome.com), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
