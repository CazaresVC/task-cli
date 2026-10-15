import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

describe('CLI End-to-End Integration Tests', () => {
  let tempHome: string;
  const tsxCli = path.resolve(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const entryPoint = path.resolve(process.cwd(), 'src', 'index.ts');

  beforeAll(() => {
    tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'task-cli-e2e-'));
  });

  afterAll(() => {
    if (tempHome && fs.existsSync(tempHome)) {
      fs.rmSync(tempHome, { recursive: true, force: true });
    }
  });

  function runCli(args: string[]): { status: number | null; stdout: string; stderr: string } {
    const result = spawnSync(process.execPath, [tsxCli, entryPoint, ...args], {
      env: {
        ...process.env,
        HOME: tempHome,
        USERPROFILE: tempHome,
      },
      encoding: 'utf-8',
    });

    return {
      status: result.status,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
    };
  }

  it('Scenario 1: Creates tasks with default and custom values', () => {
    const res1 = runCli(['add', 'Comprar leche']);
    expect(res1.status).toBe(0);
    expect(res1.stdout).toContain('Tarea creada con éxito. ID: 1');

    const res2 = runCli([
      'add',
      'Preparar reporte mensual',
      '-p',
      'high',
      '-d',
      'Incluir gráficos de ventas y costos',
    ]);
    expect(res2.status).toBe(0);
    expect(res2.stdout).toContain('Tarea creada con éxito. ID: 2');
  });

  it('Scenario 2: Lists tasks in tabular format', () => {
    const res = runCli(['list']);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('Comprar leche');
    expect(res.stdout).toContain('Preparar reporte mensual');
  });

  it('Scenario 3: Shows detailed view of a task', () => {
    const res = runCli(['show', '2']);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('Tarea #2');
    expect(res.stdout).toContain('Título:        Preparar reporte mensual');
    expect(res.stdout).toContain('Descripción:   Incluir gráficos de ventas y costos');
    expect(res.stdout).toContain('Prioridad:');
    expect(res.stdout).toContain('high');
  });

  it('Scenario 4: Handles valid and invalid status transitions', () => {
    // Invalid transition: todo -> done
    const invalidRes = runCli(['status', '1', 'done']);
    expect(invalidRes.status).toBe(1);
    expect(invalidRes.stderr).toContain(
      'Transición no permitida. Una tarea en estado "todo" debe pasar a "in-progress" antes de completarse.'
    );

    // Valid: todo -> in-progress
    const validRes1 = runCli(['status', '1', 'in-progress']);
    expect(validRes1.status).toBe(0);
    expect(validRes1.stdout).toContain('Estado de la tarea #1 actualizado a "in-progress".');

    // Valid: in-progress -> done
    const validRes2 = runCli(['status', '1', 'done']);
    expect(validRes2.status).toBe(0);
    expect(validRes2.stdout).toContain('Estado de la tarea #1 actualizado a "done".');
  });

  it('Scenario 5: Filters tasks by status and priority with AND logic', () => {
    const res = runCli(['list', '--status', 'todo', '--priority', 'high']);
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('Preparar reporte mensual');
    expect(res.stdout).not.toContain('Comprar leche');
  });

  it('Scenario 6: Updates task fields and empties description', () => {
    const updateRes = runCli(['update', '1', '-t', 'Comprar leche deslactosada', '-p', 'low']);
    expect(updateRes.status).toBe(0);
    expect(updateRes.stdout).toContain('Tarea #1 actualizada con éxito.');

    const emptyDescRes = runCli(['update', '2', '-d', '']);
    expect(emptyDescRes.status).toBe(0);
    expect(emptyDescRes.stdout).toContain('Tarea #2 actualizada con éxito.');

    const showRes = runCli(['show', '2']);
    expect(showRes.status).toBe(0);
    expect(showRes.stdout).toContain('(sin descripción)');
  });

  it('Scenario 7: Deletes task with --force', () => {
    const delRes = runCli(['delete', '1', '--force']);
    expect(delRes.status).toBe(0);
    expect(delRes.stdout).toContain('Tarea #1 eliminada con éxito.');

    const showRes = runCli(['show', '1']);
    expect(showRes.status).toBe(1);
    expect(showRes.stderr).toContain('No se encontró la tarea con ID 1.');
  });
});
