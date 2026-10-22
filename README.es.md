# Certificación de Desarrollo Back End y APIs de freeCodeCamp

[ English ](README.md) | [ Español ](README.es.md)

Una colección de mis soluciones a los proyectos requeridos para la certificación **Back End Development and APIs** de **freeCodeCamp**. Cada proyecto vive en su propia carpeta e incluye su propia documentación, código fuente y pruebas automatizadas.

El propósito de este repositorio es presentar las soluciones de manera organizada, para que cada proyecto pueda revisarse, ejecutarse y probarse de forma independiente.

---

## Proyectos

| # | Proyecto | Descripción |
|---|---|---|
| 01 | [Prime Number Checker Module](./01-prime-number-checker-module) | Un módulo de JavaScript (CommonJS) que determina si un número entero es primo. |
| 02 | [Personal Profile App](./02-personal-profile-app) | Una API de Express que gestiona perfiles personales mediante una capa de servicios basada en clases. |
| 03 | [Timestamp Microservice](./03-timestamp-microservice) | Una API de Express que convierte fechas en timestamps Unix y cadenas UTC. |
| 04 | [Chat App](./04-chat-app) | Un chat en tiempo real construido con Node.js y WebSockets, con una interfaz sencilla en el navegador. |
| 05 | [Family Movie Watchlist API](./05-family-movie-watchlist-api) | Una API de Express con autenticación JWT y acceso basado en roles para gestionar listas familiares de películas. |

---

## Tecnologías

- **Node.js** y **Express.js**
- **WebSockets** (`ws`)
- **JWT** y **bcryptjs**
- **Jest** y **Supertest** para las pruebas

---

## Ejecutar un Proyecto

Cada proyecto es independiente. Para ejecutar cualquiera de ellos:

```bash
cd <carpeta-del-proyecto>
npm install
npm start
```

Para ejecutar su suite de pruebas:

```bash
npm test
```

Algunos proyectos necesitan un servidor en ejecución mientras se ejecuta la suite de pruebas de freeCodeCamp, así que inícialos con `npm start` primero. Consulta el README de cada proyecto para conocer su puerto, variables de entorno e instrucciones específicas.

---

## Estructura

```
fcc-back-end-development/
├── 01-prime-number-checker-module/
├── 02-personal-profile-app/
├── 03-timestamp-microservice/
├── 04-chat-app/
└── 05-family-movie-watchlist-api/
```

Cada carpeta contiene una versión en inglés (`README.md`) y en español (`README.es.md`) de su documentación.

---

## Licencia

Este repositorio está bajo la [Licencia MIT](./LICENSE).

Los requisitos de los proyectos de freeCodeCamp y cualquier dato semilla proporcionado por freeCodeCamp pertenecen a freeCodeCamp.
