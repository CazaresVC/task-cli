# Implementation Plan: Gestión de Tareas Personales en CLI (task-cli)

**Branch**: `001-task-cli-core` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-task-cli-core/spec.md`

## Summary

Implementar un CLI local y ligero para la gestión de tareas personales (`task-cli`), construido con TypeScript, Node.js y persistencia síncrona en SQLite mediante `better-sqlite3`. La interfaz CLI se estructurará con `Commander.js`, con salida tabular limpia usando `cli-table3`, validación rigurosa del ciclo de vida de tareas y pruebas unitarias exhaustivas con `Vitest`.

## Technical Context

**Language/Version**: TypeScript 5.x sobre Node.js 20+ (LTS). Compilación y ejecución directa mediante `tsx`.

**Primary Dependencies**: `commander` (v12+), `better-sqlite3` (v11+), `cli-table3` (v0.6+), `picocolors` (v1.1+).

**Storage**: SQLite síncrono alojado localmente en el directorio de usuario (`~/.task-cli/tasks.db`). Sin ORMs.

**Testing**: `Vitest` con bases de datos SQLite en memoria (`:memory:`) para pruebas unitarias de aislamiento completo.

**Target Platform**: CLI multiplataforma (Windows PowerShell/CMD, macOS Terminal, Linux shell).

**Project Type**: CLI tool (aplicación de línea de comandos ejecutable globalmente).

**Performance Goals**: Tiempo de respuesta inferior a 200 ms en consultas y operaciones sobre colecciones de hasta 10,000 tareas.

**Constraints**: Sin stack traces expuestos al usuario; códigos de salida estrictos (0 para éxito, 1 para error); mensajes en español; ejecución local offline.

**Scale/Scope**: Herramienta mono-usuario para gestión personal sin dependencias de red ni autenticación.

## Constitution Check

*GATE: Evaluado antes de Fase 0 y re-verificado tras el diseño de Fase 1.*

| Principio Constitucional | Estado | Justificación de Cumplimiento |
|---|---|---|
| **I. Simplicidad y Arquitectura Plana** | **PASS** | Estructura sin capas abstractas ni Clean Architecture: carpetas `commands/`, `db/`, `utils/`, `types/`. Cero ORMs. |
| **II. Enfoque Funcional y Tipado Estricto** | **PASS** | Lógica de negocio basada en funciones puras; camelCase para identificadores, PascalCase para tipos/interfaces. TypeScript estricto. |
| **III. Almacenamiento Local con SQLite** | **PASS** | SQLite con `better-sqlite3`, base de datos síncrona en `~/.task-cli/tasks.db` con creación automática de carpeta. |
| **IV. Experiencia CLI y Manejo de Errores** | **PASS** | `Commander.js`, tablas con `cli-table3`, colores restringidos a estados/prioridades, captura global de errores sin stack traces, códigos 0/1. |
| **V. Pruebas Unitarias de Negocio** | **PASS** | `Vitest` cubriendo validaciones de entrada, máquina de estados, operaciones CRUD y casos límite. |
| **Distribución Global** | **PASS** | Configuración de `package.json` con campo `"bin": { "task-cli": "./dist/index.js" }` e instalación con `npm install -g .`. |

## Project Structure

### Documentation (this feature)

```text
specs/001-task-cli-core/
├── spec.md              # Especificación funcional y de requisitos
├── plan.md              # Plan técnico de implementación (este archivo)
├── research.md          # Fase 0: Decisiones técnicas y justificaciones
├── data-model.md        # Fase 1: Entidades, DDL SQLite y máquina de estados
├── quickstart.md        # Fase 1: Guía ejecutable de validación de extremo a extremo
├── checklists/
│   └── requirements.md  # Lista de verificación de calidad de la especificación
└── contracts/
    └── cli-commands.md  # Fase 1: Contrato público de comandos y argumentos del CLI
```

### Source Code (repository root)

```text
task-cli/
├── src/
│   ├── commands/
│   │   ├── add.ts          # Comando task-cli add <title> [options]
│   │   ├── list.ts         # Comando task-cli list [options]
│   │   ├── show.ts         # Comando task-cli show <id>
│   │   ├── status.ts       # Comando task-cli status <id> <new-status>
│   │   ├── update.ts       # Comando task-cli update <id> [options]
│   │   └── delete.ts       # Comando task-cli delete <id> [options]
│   ├── db/
│   │   ├── connection.ts   # Conexión SQLite y resolución de ruta ~/.task-cli/tasks.db
│   │   ├── schema.ts       # Migración inicial / creación de tabla e índices DDL
│   │   └── repository.ts   # Operaciones de consulta y persistencia en SQLite
│   ├── utils/
│   │   ├── format.ts       # Formateo de tablas (cli-table3) y colores (picocolors)
│   │   ├── prompt.ts       # Confirmación interactiva con readline
│   │   └── validator.ts    # Validaciones de títulos, prioridades, IDs y estados
│   ├── types/
│   │   └── index.ts        # Interfaces (Task, TaskStatus, TaskPriority, inputs)
│   └── index.ts            # Configuración de Commander.js y punto de entrada binario
├── tests/
│   ├── unit/
│   │   ├── state-machine.test.ts  # Pruebas de transiciones válidas e inválidas
│   │   ├── validator.test.ts      # Pruebas de validación de inputs
│   │   └── repository.test.ts     # Pruebas de operaciones CRUD con SQLite en memoria
│   └── integration/
│       └── cli.test.ts            # Pruebas de extremo a extremo de comandos CLI
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**Structure Decision**: Se adopta el modelo de proyecto único con arquitectura plana y modular por funcionalidad (`commands/`, `db/`, `utils/`, `types/`), cumpliendo estrictamente con el Principio I de la constitución.

## Complexity Tracking

> *Sin violaciones constitucionales. Todas las decisiones se apegan a los principios de simplicidad y arquitectura plana.*

| Violación | Por qué se necesita | Alternativa más simple rechazada porque |
|---|---|---|
| Ninguna | N/A | N/A |
