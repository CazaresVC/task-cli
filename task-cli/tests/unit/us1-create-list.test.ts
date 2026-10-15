import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import {
  createTask,
  getTaskById,
  listTasks,
} from '../../src/db/repository.js';

describe('User Story 1 - Repository Tests (Create, List, Show)', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    initSchema(db);
  });

  it('creates a task with default priority and status todo', () => {
    const task = createTask(db, {
      title: 'Comprar café',
    });

    expect(task.id).toBe(1);
    expect(task.title).toBe('Comprar café');
    expect(task.description).toBeNull();
    expect(task.priority).toBe('medium');
    expect(task.status).toBe('todo');
    expect(task.createdAt).toBeDefined();
    expect(task.updatedAt).toBeDefined();
  });

  it('creates a task with explicit priority and description', () => {
    const task = createTask(db, {
      title: 'Preparar informe',
      priority: 'high',
      description: 'Incluir métricas de Q3',
    });

    expect(task.id).toBe(1);
    expect(task.title).toBe('Preparar informe');
    expect(task.priority).toBe('high');
    expect(task.description).toBe('Incluir métricas de Q3');
    expect(task.status).toBe('todo');
  });

  it('gets a task by its ID', () => {
    const created = createTask(db, { title: 'Tarea de prueba' });
    const fetched = getTaskById(db, created.id);

    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(created.id);
    expect(fetched?.title).toBe('Tarea de prueba');
  });

  it('returns null when task ID does not exist', () => {
    const fetched = getTaskById(db, 999);
    expect(fetched).toBeNull();
  });

  it('lists tasks ordered by created_at DESC', () => {
    const t1 = createTask(db, { title: 'Primera tarea' });
    const t2 = createTask(db, { title: 'Segunda tarea' });

    const tasks = listTasks(db);
    expect(tasks).toHaveLength(2);
    // Ordered descending by created_at / id
    expect(tasks[0].id).toBe(t2.id);
    expect(tasks[1].id).toBe(t1.id);
  });

  it('returns empty array when no tasks exist', () => {
    const tasks = listTasks(db);
    expect(tasks).toEqual([]);
  });
});
