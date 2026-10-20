# Prime Number Checker Module

[ English ](README.md) | [ Español ](README.es.md)

A lightweight and optimized JavaScript module designed to determine whether a given integer is a prime number. Built with CommonJS standards and fully tested using Jest.

---

## Features

* **Strict Type Safety:** Handles invalid data types safely by ensuring the input is a valid integer.
* **Mathematical Optimization:** Uses the $O(\sqrt{n})$ trial division algorithm, testing only odd factors.

---

## Usage Example

```javascript
const { isPrime } = require('./index');  
  
console.log(isPrime(2));  // true  
console.log(isPrime(7));  // true  
console.log(isPrime(4));  // false  
console.log(isPrime(1));  // false
```

## Unit Testing

This project includes a comprehensive suite of unit tests written in Jest to verify edge cases, input validation, and mathematical correctness.

To run the test suite, ensure you have [Node.js](https://nodejs.org/) installed on your system, then navigate to the project directory and install the development dependencies:

```bash
npm install
```
Once Jest is installed, run:

```bash
npm test
```
