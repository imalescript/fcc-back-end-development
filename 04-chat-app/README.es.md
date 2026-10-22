# Chat App

[ English ](README.md) | [ Español ](README.es.md)

Una aplicación de chat en tiempo real construida con Node.js y el paquete [`ws`](https://github.com/websockets/ws), estructurada con una arquitectura moderna basada en clases (`ChatService`). Diseñada específicamente para cumplir con los requerimientos de freeCodeCamp y completamente probada mediante Jest y Supertest.

---

## Características

- **Arquitectura Limpia:** Separa la lógica de negocio del dominio (`ChatService`) de la capa de transporte HTTP, del cableado WebSocket y de la configuración.
- **Robusto por diseño:** Un payload mal formado nunca tumba el servidor, los frames sobredimensionados se rechazan y las conexiones muertas se detectan con un heartbeat ping/pong.
- **Seguro por defecto:** El autor de un mensaje es el usuario del handshake, así que ningún cliente puede escribir como otro.
- **Configurable:** Todos los valores ajustables (puerto, tamaño de frame, intervalo del heartbeat, longitud de los mensajes) se pueden definir con variables de entorno o con un fichero `.env`.
- **Pruebas Automatizadas:** Pruebas unitarias del servicio y de la configuración, además de pruebas de integración de las rutas HTTP y del protocolo WebSocket.
- **Interfaz Moderna:** Interfaz oscura y adaptable construida con CSS puro, sin frameworks.

---

## Instalación

Para configurar el proyecto localmente, asegúrate de tener [Node.js](https://nodejs.org/) instalado, luego clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/imalescript/fcc-back-end-development.git
cd 04-chat-app
npm install
```

Para iniciar el servidor:

```bash
npm start
```

El servidor se ejecuta en el puerto `3001`. Abre `http://localhost:3001` en el navegador para usar el chat, y abre una segunda pestaña para chatear entre dos usuarios.

> **Nota:** freeCodeCamp ejecuta su propia suite de tests contra un servidor en marcha. Arranca el proyecto con `npm start` antes de pulsar **Run Tests**.

---

## Configuración

Todos los valores tienen un valor por defecto, así que el servidor funciona sin ningún fichero extra. Copia `.env.example` a `.env` para cambiarlos:

```bash
cp .env.example .env
```

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `3001` | Puerto en el que escucha el servidor. |
| `MAX_PAYLOAD_BYTES` | `16384` | Frame WebSocket más grande que se acepta, en bytes. |
| `HEARTBEAT_INTERVAL_MS` | `30000` | Cada cuánto hace ping el servidor a los clientes para detectar los muertos. |
| `MAX_MESSAGE_LENGTH` | `1000` | Longitud máxima de un mensaje de chat, en caracteres. |
| `USE_CONNECTION_IDENTITY` | `true` | `true` usa el usuario del handshake como autor de cada mensaje, `false` usa el nombre que viaja dentro de cada payload. |

Las variables de entorno reales siempre tienen prioridad sobre las definidas en el fichero `.env`:

```bash
PORT=4000 npm start
```

Un valor inválido se avisa por consola y se usa el valor por defecto, así que una errata nunca rompe el servidor.

---

## Protocolo WebSocket

Conéctate a `ws://localhost:3001?username=TuNombre`. El nombre de usuario es opcional y el servidor lo sanea.

**Del cliente al servidor:**

```json
{ "username": "Camper", "text": "Hello there" }
```

**Del servidor al cliente:**

```json
{ "type": "system", "text": "Camper joined" }
{ "type": "chat", "username": "Camper", "text": "Hello there" }
{ "type": "error", "text": "Invalid message format" }
```

---

## Estructura del proyecto

```
04-chat-app/
├── server.js              # Punto de entrada: servidor HTTP, servidor WebSocket y ciclo de vida
├── server.test.js         # Pruebas de integración de las rutas HTTP y del protocolo WebSocket
├── src/
│   ├── config.js          # Variables de entorno con valores por defecto validados
│   ├── config.test.js     # Pruebas unitarias de la configuración
│   ├── chat-service.js    # ChatService: las reglas del chat
│   ├── chat-service.test.js # Pruebas unitarias del servicio de chat
│   └── http.js            # Servidor de ficheros estáticos y helpers HTTP
├── public/
│   ├── index.html         # Interfaz del chat
│   ├── styles.css         # Tema oscuro
│   └── script.js          # Cliente WebSocket del navegador
├── .env.example           # Plantilla de configuración
└── package.json
```

---

## Pruebas

Este proyecto incluye pruebas unitarias escritas en Jest para el servicio de chat y la configuración, además de pruebas de integración escritas en Jest y Supertest para las rutas HTTP y el protocolo WebSocket.

Para ejecutar la suite de pruebas, ejecuta:

```bash
npm test
```

Para ejecutar la suite en modo watch:

```bash
npm run test:watch
```

Para ejecutar la suite con un reporte de cobertura:

```bash
npm run test:coverage
```

---

## Créditos

El emblema de la cabecera es el icono *bat* de [Font Awesome](https://fontawesome.com), bajo licencia [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
