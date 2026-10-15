import type Database from 'better-sqlite3';
import {
  type Task,
  type TaskRow,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskFilter,
  type TaskStatus,
  toTask,
} from '../types/index.js';

export function createTask(db: Database.Database, input: CreateTaskInput): Task {
  const stmt = db.prepare(`
    INSERT INTO tasks (title, description, priority)
    VALUES (?, ?, ?)
  `);

  const priority = input.priority ?? 'medium';
  const description = input.description !== undefined && input.description !== '' ? input.description : null;

  const result = stmt.run(input.title, description, priority);
  const id = Number(result.lastInsertRowid);

  const task = getTaskById(db, id);
  if (!task) {
    throw new Error('Error al recuperar la tarea recién creada.');
  }
  return task;
}

export function getTaskById(db: Database.Database, id: number): Task | null {
  const stmt = db.prepare(`
    SELECT id, title, description, status, priority, created_at, updated_at
    FROM tasks
    WHERE id = ?
  `);

  const row = stmt.get(id) as TaskRow | undefined;
  if (!row) {
    return null;
  }
  return toTask(row);
}

export function listTasks(db: Database.Database, filter?: TaskFilter): Task[] {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter?.status) {
    conditions.push('status = ?');
    params.push(filter.status);
  }

  if (filter?.priority) {
    conditions.push('priority = ?');
    params.push(filter.priority);
  }

  let query = `
    SELECT id, title, description, status, priority, created_at, updated_at
    FROM tasks
  `;

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  query += ' ORDER BY created_at DESC, id DESC';

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as TaskRow[];
  return rows.map(toTask);
}

export function updateTaskStatus(db: Database.Database, id: number, newStatus: TaskStatus): Task {
  const stmt = db.prepare(`
    UPDATE tasks
    SET status = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  const result = stmt.run(newStatus, id);
  if (result.changes === 0) {
    throw new Error(`No se encontró la tarea con ID ${id}.`);
  }

  const updated = getTaskById(db, id);
  if (!updated) {
    throw new Error(`Error al recuperar la tarea con ID ${id} tras actualizar estado.`);
  }
  return updated;
}

export function updateTask(db: Database.Database, id: number, input: UpdateTaskInput): Task {
  const updates: string[] = [];
  const params: unknown[] = [];

  if (input.title !== undefined) {
    updates.push('title = ?');
    params.push(input.title);
  }

  if (input.description !== undefined) {
    if (input.description === null || input.description === '') {
      updates.push('description = NULL');
    } else {
      updates.push('description = ?');
      params.push(input.description);
    }
  }

  if (input.priority !== undefined) {
    updates.push('priority = ?');
    params.push(input.priority);
  }

  updates.push("updated_at = datetime('now')");
  params.push(id);

  const query = `
    UPDATE tasks
    SET ${updates.join(', ')}
    WHERE id = ?
  `;

  const stmt = db.prepare(query);
  const result = stmt.run(...params);
  if (result.changes === 0) {
    throw new Error(`No se encontró la tarea con ID ${id}.`);
  }

  const updated = getTaskById(db, id);
  if (!updated) {
    throw new Error(`Error al recuperar la tarea con ID ${id} tras la actualización.`);
  }
  return updated;
}

export function deleteTask(db: Database.Database, id: number): boolean {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
}
