import Table from 'cli-table3';
import pc from 'picocolors';
import type { Task, TaskPriority, TaskStatus } from '../types/index.js';

export function formatStatus(status: TaskStatus): string {
  switch (status) {
    case 'todo':
      return pc.cyan(status);
    case 'in-progress':
      return pc.yellow(status);
    case 'done':
      return pc.green(status);
    default:
      return status;
  }
}

export function formatPriority(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return pc.red(priority);
    case 'medium':
      return pc.yellow(priority);
    case 'low':
      return pc.green(priority);
    default:
      return priority;
  }
}

export function formatDate(dateStr: string, includeSeconds = false): string {
  if (!dateStr) return '';
  // Handles standard SQLite datetime 'YYYY-MM-DD HH:MM:SS' or ISO string
  const clean = dateStr.replace('T', ' ').replace(/\.\d+Z?$/, '').replace('Z', '');
  if (!includeSeconds && clean.length >= 16) {
    return clean.slice(0, 16);
  }
  return clean;
}

export function formatTasksTable(tasks: Task[]): string {
  const table = new Table({
    head: ['ID', 'Título', 'Estado', 'Prioridad', 'Creado'],
    style: {
      head: [],
      border: [],
    },
  });

  for (const task of tasks) {
    table.push([
      task.id.toString(),
      task.title,
      formatStatus(task.status),
      formatPriority(task.priority),
      formatDate(task.createdAt, false),
    ]);
  }

  return table.toString();
}

export function formatTaskDetail(task: Task): string {
  const lines = [
    `Tarea #${task.id}`,
    '──────────────',
    `Título:        ${task.title}`,
    `Descripción:   ${task.description !== null && task.description !== undefined ? task.description : '(sin descripción)'}`,
    `Estado:        ${formatStatus(task.status)}`,
    `Prioridad:     ${formatPriority(task.priority)}`,
    `Creado:        ${formatDate(task.createdAt, true)}`,
    `Actualizado:   ${formatDate(task.updatedAt, true)}`,
  ];
  return lines.join('\n');
}
