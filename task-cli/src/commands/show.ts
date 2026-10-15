import type Database from 'better-sqlite3';
import { createDatabase } from '../db/connection.js';
import { initSchema } from '../db/schema.js';
import { getTaskById } from '../db/repository.js';
import { formatTaskDetail } from '../utils/format.js';
import { validateId } from '../utils/validator.js';
import { CliError } from '../utils/error-handler.js';

export function executeShow(idInput: unknown, customDb?: Database.Database): void {
  const id = validateId(idInput);

  const db = customDb ?? createDatabase();
  initSchema(db);

  const task = getTaskById(db, id);
  if (!task) {
    throw new CliError(`No se encontró la tarea con ID ${id}.`);
  }

  console.log(formatTaskDetail(task));
}
