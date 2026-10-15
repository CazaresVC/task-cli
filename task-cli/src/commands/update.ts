import type Database from 'better-sqlite3';
import { createDatabase } from '../db/connection.js';
import { initSchema } from '../db/schema.js';
import { getTaskById, updateTask } from '../db/repository.js';
import { validateId, validatePriority, validateTitle } from '../utils/validator.js';
import { CliError } from '../utils/error-handler.js';
import type { UpdateTaskInput } from '../types/index.js';

export function executeUpdate(
  idInput: unknown,
  options: { title?: string; description?: string | boolean; priority?: string },
  customDb?: Database.Database
): void {
  const id = validateId(idInput);

  if (
    options.title === undefined &&
    options.description === undefined &&
    options.priority === undefined
  ) {
    throw new CliError('Debes proporcionar al menos un campo para actualizar (--title, --description o --priority).');
  }

  const updateInput: UpdateTaskInput = {};

  if (options.title !== undefined) {
    updateInput.title = validateTitle(options.title, true);
  }

  if (options.priority !== undefined) {
    updateInput.priority = validatePriority(options.priority);
  }

  if (options.description !== undefined) {
    if (options.description === true || options.description === '' || options.description === null) {
      updateInput.description = null;
    } else {
      updateInput.description = String(options.description);
    }
  }

  const db = customDb ?? createDatabase();
  initSchema(db);

  const existing = getTaskById(db, id);
  if (!existing) {
    throw new CliError(`No se encontró la tarea con ID ${id}.`);
  }

  updateTask(db, id, updateInput);

  console.log(`Tarea #${id} actualizada con éxito.`);
}
