import { describe, it, expect } from 'vitest';
import {
  validateId,
  validateTitle,
  validatePriority,
  validateStatus,
  validateStatusTransition,
} from '../../src/utils/validator.js';
import { CliError } from '../../src/utils/error-handler.js';

describe('Validator Unit Tests', () => {
  describe('validateId', () => {
    it('accepts positive integers', () => {
      expect(validateId('1')).toBe(1);
      expect(validateId(42)).toBe(42);
    });

    it('rejects non-positive integers, negative numbers, decimals, non-numbers', () => {
      expect(() => validateId('0')).toThrow(CliError);
      expect(() => validateId('-5')).toThrow(CliError);
      expect(() => validateId('1.5')).toThrow(CliError);
      expect(() => validateId('abc')).toThrow(CliError);
      expect(() => validateId('')).toThrow(CliError);
      expect(() => validateId(null)).toThrow(CliError);
    });
  });

  describe('validateTitle', () => {
    it('accepts non-empty strings and trims them', () => {
      expect(validateTitle(' Comprar leche ')).toBe('Comprar leche');
    });

    it('rejects empty or whitespace-only strings', () => {
      expect(() => validateTitle('')).toThrow('El título de la tarea no puede estar vacío.');
      expect(() => validateTitle('   ')).toThrow('El título de la tarea no puede estar vacío.');
      expect(() => validateTitle('', true)).toThrow('El título no puede estar vacío.');
    });
  });

  describe('validatePriority', () => {
    it('accepts valid priorities', () => {
      expect(validatePriority('high')).toBe('high');
      expect(validatePriority('medium')).toBe('medium');
      expect(validatePriority('low')).toBe('low');
    });

    it('rejects invalid priorities', () => {
      expect(() => validatePriority('urgent')).toThrow(CliError);
      expect(() => validatePriority('')).toThrow(CliError);
    });
  });

  describe('validateStatus', () => {
    it('accepts valid statuses', () => {
      expect(validateStatus('todo')).toBe('todo');
      expect(validateStatus('in-progress')).toBe('in-progress');
      expect(validateStatus('done')).toBe('done');
    });

    it('rejects invalid statuses', () => {
      expect(() => validateStatus('archived')).toThrow(CliError);
    });
  });

  describe('validateStatusTransition', () => {
    it('allows valid transitions', () => {
      expect(() => validateStatusTransition('todo', 'in-progress')).not.toThrow();
      expect(() => validateStatusTransition('in-progress', 'done')).not.toThrow();
      expect(() => validateStatusTransition('in-progress', 'todo')).not.toThrow();
      expect(() => validateStatusTransition('done', 'todo')).not.toThrow();
    });

    it('rejects forbidden transitions', () => {
      expect(() => validateStatusTransition('todo', 'done')).toThrow('Una tarea en estado "todo" debe pasar a "in-progress" antes de completarse.');
      expect(() => validateStatusTransition('done', 'in-progress')).toThrow('Debe reabrirse primero a "todo" antes de volver a iniciarse.');
      expect(() => validateStatusTransition('todo', 'todo')).toThrow('Transición redundante');
      expect(() => validateStatusTransition('in-progress', 'in-progress')).toThrow('Transición redundante');
      expect(() => validateStatusTransition('done', 'done')).toThrow('Transición redundante');
    });
  });
});
