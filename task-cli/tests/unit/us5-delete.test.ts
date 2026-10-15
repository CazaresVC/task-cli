import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { createTask, getTaskById, deleteTask } from '../../src/db/repository.js';
import { confirmAction } from '../../src/utils/prompt.js';
import { CliError } from '../../src/utils/error-handler.js';

describe('User Story 5 - Task Deletion & Confirmation Unit Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    initSchema(db);
  });

  describe('Repository deleteTask', () => {
    it('deletes an existing task and returns true', () => {
      const task = createTask(db, { title: 'Tarea para borrar' });
      expect(getTaskById(db, task.id)).not.toBeNull();

      const deleted = deleteTask(db, task.id);
      expect(deleted).toBe(true);
      expect(getTaskById(db, task.id)).toBeNull();
    });

    it('returns false when task to delete does not exist', () => {
      const deleted = deleteTask(db, 999);
      expect(deleted).toBe(false);
    });
  });

  describe('confirmAction Prompt', () => {
    it('throws error when terminal is not interactive and isTty is false', async () => {
      await expect(confirmAction('¿Eliminar?', false)).rejects.toThrow(
        'Terminal no interactiva detectada. Usa la opción --force para confirmar la eliminación.'
      );
    });
  });
});
