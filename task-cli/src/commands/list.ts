import type Database from 'better-sqlite3';
import { createDatabase } from '../db/connection.js';
import { initSchema } from '../db/schema.js';
import { listTasks } from '../db/repository.js';
import { formatTasksTable } from '../utils/format.js';
import { validatePriority, validateStatus } from '../utils/validator.js';
import type { TaskFilter } from '../types/index.js';

export function executeList(
  options: { status?: string; priority?: string },
  customDb?: Database.Database
): void {
  const filter: TaskFilter = {};

  if (options.status !== undefined) {
    filter.status = validateStatus(options.status);
  }

  if (options.priority !== undefined) {
    filter.priority = validatePriority(options.priority);
  }

  const db = customDb ?? createDatabase();
  initSchema(db);

  const tasks = listTasks(db, filter);

  if (tasks.length === 0) {
    console.log('No se encontraron tareas registradas.');
    return;
  }

  console.log(formatTasksTable(tasks));
}
