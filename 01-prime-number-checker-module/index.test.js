const { isPrime } = require('./index');

describe('isPrime() - Prime Number Checker', () => {
    
    test('should return false for numbers <= 1 and non-integers', () => {
        expect(isPrime(1)).toBe(false);
        expect(isPrime(0)).toBe(false);
        expect(isPrime(-5)).toBe(false);
        expect(isPrime(4.5)).toBe(false);
    });

    test('should return true for 2 and other prime numbers', () => {
        expect(isPrime(2)).toBe(true);
        expect(isPrime(7)).toBe(true);
        expect(isPrime(23)).toBe(true);
    });

    test('should return false for even numbers greater than 2', () => {
        expect(isPrime(4)).toBe(false);
        expect(isPrime(60)).toBe(false);
        expect(isPrime(100)).toBe(false);
    });

    test('should return false for odd composite numbers', () => {
        expect(isPrime(9)).toBe(false);
        expect(isPrime(15)).toBe(false);
        expect(isPrime(21)).toBe(false);
    });

    test('should return false for non-number inputs', () => {
        expect(isPrime(true)).toBe(false);
        expect(isPrime("7")).toBe(false);
        expect(isPrime(null)).toBe(false);
        expect(isPrime(undefined)).toBe(false);
    });
});