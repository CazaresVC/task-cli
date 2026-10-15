#!/usr/bin/env node
import { Command } from 'commander';
import { executeAdd } from './commands/add.js';
import { executeList } from './commands/list.js';
import { executeShow } from './commands/show.js';
import { executeStatus } from './commands/status.js';
import { executeUpdate } from './commands/update.js';
import { executeDelete } from './commands/delete.js';
import { handleError } from './utils/error-handler.js';

const program = new Command();

program
  .name('task-cli')
  .description('CLI local para la gestión de tareas personales')
  .version('1.0.0');

program
  .command('add <title>')
  .description('Crea una nueva tarea')
  .option('-p, --priority <priority>', 'Nivel de prioridad (high, medium, low)')
  .option('-d, --description <desc>', 'Descripción detallada de la tarea')
  .action((title: string, options: { priority?: string; description?: string }) => {
    try {
      executeAdd(title, options);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('list')
  .description('Lista las tareas registradas')
  .option('-s, --status <status>', 'Filtra por estado (todo, in-progress, done)')
  .option('-p, --priority <priority>', 'Filtra por prioridad (high, medium, low)')
  .action((options: { status?: string; priority?: string }) => {
    try {
      executeList(options);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('show <id>')
  .description('Muestra la ficha detallada de una tarea')
  .action((id: string) => {
    try {
      executeShow(id);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('status <id> <new-status>')
  .description('Modifica el estado de una tarea aplicando las reglas del ciclo de vida')
  .action((id: string, newStatus: string) => {
    try {
      executeStatus(id, newStatus);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('update <id>')
  .description('Modifica uno o más campos de una tarea existente')
  .option('-t, --title <title>', 'Nuevo título')
  .option('-d, --description [desc]', 'Nueva descripción')
  .option('-p, --priority <priority>', 'Nueva prioridad (high, medium, low)')
  .action((id: string, options: { title?: string; description?: string | boolean; priority?: string }) => {
    try {
      executeUpdate(id, options);
    } catch (error) {
      handleError(error);
    }
  });

program
  .command('delete <id>')
  .description('Elimina una tarea del sistema')
  .option('-f, --force', 'Salta la confirmación interactiva y elimina inmediatamente')
  .action(async (id: string, options: { force?: boolean }) => {
    try {
      await executeDelete(id, options);
    } catch (error) {
      handleError(error);
    }
  });

// Catch any unhandled errors globally
process.on('uncaughtException', (err) => {
  handleError(err);
});

program.parse(process.argv);
