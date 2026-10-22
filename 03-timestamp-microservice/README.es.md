# Microservicio de Timestamp

[ English ](README.md) | [ Español ](README.es.md)

Una API backend construida con Express.js y estructurada utilizando una arquitectura moderna basada en clases (`TimestampService`). Diseñada específicamente para cumplir con los requerimientos de freeCodeCamp y completamente probada mediante Jest y Supertest.

---

## Características

- **Arquitectura Limpia:** Separa la lógica de negocio del dominio (`TimestampService`) de la capa de transporte HTTP de Express.
- **JavaScript Moderno:** Implementa campos de clase y estándares de módulos ES para un código base limpio.
- **Pruebas Automatizadas:** Incluye una suite completa de pruebas unitarias escritas en Jest para la lógica del servicio, además de pruebas de integración escritas en Supertest para las rutas de la API.

---

## Instalación

Para configurar el proyecto localmente, asegúrate de tener [Node.js](https://nodejs.org/) instalado, luego clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/imalescript/fcc-back-end-development.git
cd 03-timestamp-microservice
npm install
```

Para iniciar el servidor:

```bash
npm start
```

El servidor se ejecuta en el puerto `8000` y expone la API en `/api/:date`:

```bash
curl http://localhost:8000/api/2015-12-25
# {"unix":1451001600000,"utc":"Fri, 25 Dec 2015 00:00:00 GMT"}
```

---

## Pruebas

Este proyecto incluye pruebas unitarias escritas en Jest para la lógica del servicio de timestamp, y pruebas de integración escritas en Supertest para las rutas HTTP.

Para ejecutar la suite de pruebas, ejecuta:

```bash
npm test
```

Para ejecutar la suite con un reporte de cobertura:

```bash
npm run test:coverage
```
