import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { createTask, getTaskById, updateTask } from '../../src/db/repository.js';

describe('User Story 4 - Task Update Unit Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    initSchema(db);
  });

  it('partially updates title and priority without changing description', () => {
    const task = createTask(db, {
      title: 'Título original',
      description: 'Descripción inicial',
      priority: 'low',
    });

    const updated = updateTask(db, task.id, {
      title: 'Título modificado',
      priority: 'high',
    });

    expect(updated.title).toBe('Título modificado');
    expect(updated.priority).toBe('high');
    expect(updated.description).toBe('Descripción inicial');
  });

  it('updates description to a new string value', () => {
    const task = createTask(db, {
      title: 'Tarea con descripción',
      description: 'Vieja descripción',
    });

    const updated = updateTask(db, task.id, {
      description: 'Nueva descripción detallada',
    });

    expect(updated.description).toBe('Nueva descripción detallada');
  });

  it('clears description to null when empty string is provided', () => {
    const task = createTask(db, {
      title: 'Tarea con descripción a vaciar',
      description: 'Descripción que será borrada',
    });

    const updated = updateTask(db, task.id, {
      description: '',
    });

    expect(updated.description).toBeNull();

    const reloaded = getTaskById(db, task.id);
    expect(reloaded?.description).toBeNull();
  });

  it('throws error when updating non-existent task', () => {
    expect(() =>
      updateTask(db, 999, {
        title: 'Nuevo título',
      })
    ).toThrow('No se encontró la tarea con ID 999.');
  });
});
