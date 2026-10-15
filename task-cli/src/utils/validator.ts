import type { TaskPriority, TaskStatus } from '../types/index.js';
import { CliError } from './error-handler.js';

export const VALID_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];
export const VALID_PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];

export function validateId(value: unknown): number {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0 || typeof value === 'boolean' || value === null || value === '') {
    throw new CliError('El ID debe ser un número entero positivo.');
  }
  return num;
}

export function validateTitle(title: unknown, isUpdate = false): string {
  if (typeof title !== 'string' || title.trim().length === 0) {
    if (isUpdate) {
      throw new CliError('El título no puede estar vacío.');
    }
    throw new CliError('El título de la tarea no puede estar vacío.');
  }
  return title.trim();
}

export function validatePriority(priority: unknown): TaskPriority {
  if (typeof priority !== 'string' || !VALID_PRIORITIES.includes(priority as TaskPriority)) {
    throw new CliError('Prioridad no válida. Debe ser "high", "medium" o "low".');
  }
  return priority as TaskPriority;
}

export function validateStatus(status: unknown): TaskStatus {
  if (typeof status !== 'string' || !VALID_STATUSES.includes(status as TaskStatus)) {
    throw new CliError(`Estado inválido "${status}". Los estados válidos son: todo, in-progress, done.`);
  }
  return status as TaskStatus;
}

export function validateStatusTransition(currentStatus: TaskStatus, nextStatus: TaskStatus): void {
  if (currentStatus === nextStatus) {
    throw new CliError(`Transición redundante. La tarea ya se encuentra en estado "${currentStatus}".`);
  }

  if (currentStatus === 'todo' && nextStatus === 'done') {
    throw new CliError('Transición no permitida. Una tarea en estado "todo" debe pasar a "in-progress" antes de completarse.');
  }

  if (currentStatus === 'done' && nextStatus === 'in-progress') {
    throw new CliError('Transición no permitida. Debe reabrirse primero a "todo" antes de volver a iniciarse.');
  }

  const allowedTransitions: Record<TaskStatus, TaskStatus[]> = {
    'todo': ['in-progress'],
    'in-progress': ['done', 'todo'],
    'done': ['todo'],
  };

  if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
    throw new CliError(`Transición no permitida de "${currentStatus}" a "${nextStatus}".`);
  }
}
