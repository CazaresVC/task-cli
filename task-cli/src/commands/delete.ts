import type Database from 'better-sqlite3';
import { createDatabase } from '../db/connection.js';
import { initSchema } from '../db/schema.js';
import { getTaskById, deleteTask } from '../db/repository.js';
import { validateId } from '../utils/validator.js';
import { confirmAction } from '../utils/prompt.js';
import { CliError } from '../utils/error-handler.js';

export async function executeDelete(
  idInput: unknown,
  options: { force?: boolean },
  customDb?: Database.Database
): Promise<void> {
  const id = validateId(idInput);

  const db = customDb ?? createDatabase();
  initSchema(db);

  const task = getTaskById(db, id);
  if (!task) {
    throw new CliError(`No se encontró la tarea con ID ${id}.`);
  }

  if (!options.force) {
    const confirmed = await confirmAction(`¿Estás seguro de eliminar la tarea #${id}? (s/N) `);
    if (!confirmed) {
      console.log('Operación cancelada.');
      return;
    }
  }

  deleteTask(db, id);
  console.log(`Tarea #${id} eliminada con éxito.`);
}
