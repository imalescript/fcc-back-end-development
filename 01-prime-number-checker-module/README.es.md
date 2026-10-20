# Módulo Para Verificar Números Primos

[ English ](README.md) | [ Español ](README.es.md)

Un módulo ligero y optimizado en JavaScript diseñado para determinar si un número entero dado es primo. Desarrollado bajo el estándar CommonJS y probado exhaustivamente mediante pruebas unitarias con Jest.

---

## Características

* **Validación Estricta de Tipos:** Maneja datos de entrada no válidos de forma segura asegurando que el argumento sea un entero real.
* **Optimización Matemática:** Aplica el algoritmo de división por ensayo con complejidad $O(\sqrt{n})$, evaluando únicamente factores impares.

---

## Ejemplo de Uso

```javascript
const { isPrime } = require('./index');  
  
console.log(isPrime(2));  // true  
console.log(isPrime(7));  // true  
console.log(isPrime(4));  // false  
console.log(isPrime(1));  // false
```

## Pruebas Unitarias

Este proyecto incluye una suite completa de pruebas unitarias redactadas en Jest para verificar casos límite, validaciones de entrada y corrección matemática.

Para ejecutar la suite de pruebas, asegúrate de tener [Node.js](https://nodejs.org/) instalado en tu sistema, dirígete al directorio del proyecto e instala las dependencias de desarrollo:

```bash
npm install
```

Una vez Jest instalado, ejecuta:

```bash
npm test
```
