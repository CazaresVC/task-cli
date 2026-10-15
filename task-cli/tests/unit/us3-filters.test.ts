import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema } from '../../src/db/schema.js';
import { createTask, listTasks, updateTaskStatus } from '../../src/db/repository.js';

describe('User Story 3 - Task Filtering Unit Tests', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    initSchema(db);

    // Seed test data
    const t1 = createTask(db, { title: 'Tarea 1', priority: 'high' }); // todo, high
    const t2 = createTask(db, { title: 'Tarea 2', priority: 'medium' });
    updateTaskStatus(db, t2.id, 'in-progress'); // in-progress, medium
    const t3 = createTask(db, { title: 'Tarea 3', priority: 'low' });
    updateTaskStatus(db, t3.id, 'in-progress');
    updateTaskStatus(db, t3.id, 'done'); // done, low
    const t4 = createTask(db, { title: 'Tarea 4', priority: 'high' });
    updateTaskStatus(db, t4.id, 'in-progress'); // in-progress, high
  });

  it('filters tasks by status alone', () => {
    const todoTasks = listTasks(db, { status: 'todo' });
    expect(todoTasks).toHaveLength(1);
    expect(todoTasks[0].title).toBe('Tarea 1');

    const inProgressTasks = listTasks(db, { status: 'in-progress' });
    expect(inProgressTasks).toHaveLength(2);
    expect(inProgressTasks.map((t) => t.title)).toContain('Tarea 2');
    expect(inProgressTasks.map((t) => t.title)).toContain('Tarea 4');

    const doneTasks = listTasks(db, { status: 'done' });
    expect(doneTasks).toHaveLength(1);
    expect(doneTasks[0].title).toBe('Tarea 3');
  });

  it('filters tasks by priority alone', () => {
    const highTasks = listTasks(db, { priority: 'high' });
    expect(highTasks).toHaveLength(2);
    expect(highTasks.map((t) => t.title)).toContain('Tarea 1');
    expect(highTasks.map((t) => t.title)).toContain('Tarea 4');

    const mediumTasks = listTasks(db, { priority: 'medium' });
    expect(mediumTasks).toHaveLength(1);
    expect(mediumTasks[0].title).toBe('Tarea 2');

    const lowTasks = listTasks(db, { priority: 'low' });
    expect(lowTasks).toHaveLength(1);
    expect(lowTasks[0].title).toBe('Tarea 3');
  });

  it('filters tasks by combining status AND priority', () => {
    const inProgressHigh = listTasks(db, { status: 'in-progress', priority: 'high' });
    expect(inProgressHigh).toHaveLength(1);
    expect(inProgressHigh[0].title).toBe('Tarea 4');

    const todoHigh = listTasks(db, { status: 'todo', priority: 'high' });
    expect(todoHigh).toHaveLength(1);
    expect(todoHigh[0].title).toBe('Tarea 1');
  });

  it('returns empty array when filter combination matches nothing', () => {
    const none = listTasks(db, { status: 'done', priority: 'high' });
    expect(none).toEqual([]);
  });
});
