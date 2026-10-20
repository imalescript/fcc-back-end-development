# Aplicación de Perfil Personal

[ English ](README.md) | [ Español ](README.es.md)

Una API backend construida con Express.js y estructurada utilizando una arquitectura moderna basada en clases (`ProfileService`). Diseñada específicamente para cumplir con los requerimientos de freeCodeCamp y completamente probada mediante Jest.

---

## Características

- **Arquitectura Limpia:** Separa la lógica de negocio del dominio (`ProfileService`) de la capa de transporte HTTP de Express.
- **JavaScript Moderno:** Implementa campos de clase y estándares de módulos ES para un código base limpio.
- **Pruebas Unitarias Automatizadas:** Incluye una suite completa de pruebas unitarias escritas en Jest para verificar la integridad de los datos y el comportamiento del servicio.

---

## Instalación

Para configurar el proyecto localmente, asegúrate de tener [Node.js](https://nodejs.org/) instalado, luego clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/imalescript/fcc-back-end-development.git
cd 02-personal-profile-app
npm install
```

Para iniciar el servidor:

```bash
npm start
```

---

## Pruebas Unitarias

Este proyecto incluye pruebas unitarias escritas en Jest para garantizar la confiabilidad de la lógica del servicio de perfil.

Para ejecutar la suite de pruebas, ejecuta:

```bash
npm test
```