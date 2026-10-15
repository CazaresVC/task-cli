import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { createTask, getTaskById, updateTaskStatus } from '../../src/db/repository.js';
import { validateStatusTransition } from '../../src/utils/validator.js';

describe('User Story 2 - State Machine & Status Updates', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    initSchema(db);
  });

  describe('State Machine Rules', () => {
    it('allows valid lifecycle progression: todo -> in-progress -> done', () => {
      expect(() => validateStatusTransition('todo', 'in-progress')).not.toThrow();
      expect(() => validateStatusTransition('in-progress', 'done')).not.toThrow();
    });

    it('allows in-progress -> todo (backlog)', () => {
      expect(() => validateStatusTransition('in-progress', 'todo')).not.toThrow();
    });

    it('allows done -> todo (reopen)', () => {
      expect(() => validateStatusTransition('done', 'todo')).not.toThrow();
    });

    it('blocks direct jump from todo to done', () => {
      expect(() => validateStatusTransition('todo', 'done')).toThrow(
        'Transición no permitida. Una tarea en estado "todo" debe pasar a "in-progress" antes de completarse.'
      );
    });

    it('blocks jump from done to in-progress directly', () => {
      expect(() => validateStatusTransition('done', 'in-progress')).toThrow(
        'Transición no permitida. Debe reabrirse primero a "todo" antes de volver a iniciarse.'
      );
    });

    it('rejects redundant transition to the same status', () => {
      expect(() => validateStatusTransition('todo', 'todo')).toThrow('Transición redundante');
      expect(() => validateStatusTransition('in-progress', 'in-progress')).toThrow('Transición redundante');
      expect(() => validateStatusTransition('done', 'done')).toThrow('Transición redundante');
    });
  });

  describe('updateTaskStatus in Repository', () => {
    it('updates status in DB and updates updated_at', () => {
      const task = createTask(db, { title: 'Tarea estado' });
      expect(task.status).toBe('todo');

      const updated = updateTaskStatus(db, task.id, 'in-progress');
      expect(updated.status).toBe('in-progress');

      const reloaded = getTaskById(db, task.id);
      expect(reloaded?.status).toBe('in-progress');
    });

    it('throws when task does not exist', () => {
      expect(() => updateTaskStatus(db, 999, 'in-progress')).toThrow(
        'No se encontró la tarea con ID 999.'
      );
    });
  });
});
