import type Database from 'better-sqlite3';
import { createDatabase } from '../db/connection.js';
import { initSchema } from '../db/schema.js';
import { createTask } from '../db/repository.js';
import { validateTitle, validatePriority } from '../utils/validator.js';
import type { TaskPriority } from '../types/index.js';

export function executeAdd(
  title: string,
  options: { priority?: string; description?: string },
  customDb?: Database.Database
): void {
  const validTitle = validateTitle(title, false);
  const priority: TaskPriority = options.priority
    ? validatePriority(options.priority)
    : 'medium';

  const db = customDb ?? createDatabase();
  initSchema(db);

  const task = createTask(db, {
    title: validTitle,
    priority,
    description: options.description,
  });

  console.log(`Tarea creada con éxito. ID: ${task.id}`);
}
