import type Database from 'better-sqlite3';
import { createDatabase } from '../db/connection.js';
import { initSchema } from '../db/schema.js';
import { getTaskById, updateTaskStatus } from '../db/repository.js';
import { validateId, validateStatus, validateStatusTransition } from '../utils/validator.js';
import { CliError } from '../utils/error-handler.js';

export function executeStatus(
  idInput: unknown,
  statusInput: unknown,
  customDb?: Database.Database
): void {
  const id = validateId(idInput);
  const nextStatus = validateStatus(statusInput);

  const db = customDb ?? createDatabase();
  initSchema(db);

  const task = getTaskById(db, id);
  if (!task) {
    throw new CliError(`No se encontró la tarea con ID ${id}.`);
  }

  validateStatusTransition(task.status, nextStatus);

  updateTaskStatus(db, id, nextStatus);

  console.log(`Estado de la tarea #${id} actualizado a "${nextStatus}".`);
}
