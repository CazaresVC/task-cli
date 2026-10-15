# Tasks: Gestión de Tareas Personales en CLI (task-cli)

**Feature**: `001-task-cli-core` | **Branch**: `001-task-cli-core` | **Plan**: [plan.md](./plan.md)

Este plan de tareas organiza la implementación en fases secuenciales orientadas a historias de usuario, garantizando entregas incrementales y testeables de forma independiente.

---

## Phase 1: Setup (Infraestructura Compartida)

**Propósito**: Inicialización del proyecto, configuración del compilador TypeScript y entorno de testing.

- [X] T001 Inicializar dependencias principales (`commander`, `better-sqlite3`, `cli-table3`, `picocolors`) y devDependencies (`typescript`, `tsx`, `vitest`, `@types/better-sqlite3`, `@types/node`) en `package.json`
- [X] T002 [P] Configurar compilación con tipado estricto y soporte para Node.js ESM en `tsconfig.json`
- [X] T003 [P] Configurar el ejecutor de pruebas unitarias en `vitest.config.ts`

---

## Phase 2: Foundational (Prerrequisitos Bloqueantes)

**Propósito**: Infraestructura base de datos, tipos y utilidades que DEBEN estar completas antes de implementar las historias de usuario.

**⚠️ CRÍTICO**: Ninguna historia de usuario puede comenzar antes de concluir esta fase.

- [X] T004 [P] Definir tipos e interfaces de dominio (`Task`, `TaskStatus`, `TaskPriority`, `CreateTaskInput`, `UpdateTaskInput`, `TaskFilter`) en `src/types/index.ts`
- [X] T005 [P] Implementar resolución de ruta de base de datos en `~/.task-cli/tasks.db` y conexión síncrona con `better-sqlite3` en `src/db/connection.ts`
- [X] T006 Implementar inicialización de esquema DDL (tabla `tasks` con constraints `CHECK(length(trim(title)) > 0)`, `CHECK(status IN ('todo', 'in-progress', 'done'))`, `CHECK(priority IN ('high', 'medium', 'low'))` e índices) en `src/db/schema.ts`
- [X] T007 [P] Implementar formateo de tablas (`cli-table3`) y colores condicionales para estados y prioridades (`picocolors`) en `src/utils/format.ts`
- [X] T008 [P] Implementar validadores para títulos no vacíos, prioridades válidas y enteros positivos en `src/utils/validator.ts`
- [X] T009 Implementar manejador centralizado de errores para CLI (mensajes descriptivos en español por `stderr` sin stack traces y códigos de salida 0/1) en `src/utils/error-handler.ts`

**Checkpoint**: Base lista. Se puede iniciar la implementación de historias de usuario.

---

## Phase 3: User Story 1 - Creación y Listado de Tareas (Priority: P1) 🎯 MVP

**Objetivo**: Permitir crear tareas con título, prioridad y descripción, listarlas en tabla ordenada y consultar su ficha completa.

**Test Independiente**: Crear tareas vía comando `add`, listar con `list` verificando las columnas (ID, Título, Estado, Prioridad, Creado) y consultar detalle con `show <id>`.

### Tests para User Story 1

- [X] T010 [P] [US1] Escribir pruebas unitarias para creación, listado y consulta de tareas en `tests/unit/us1-create-list.test.ts`

### Implementación para User Story 1

- [X] T011 [US1] Implementar operaciones del repositorio (`createTask`, `listTasks` ordenadas por `created_at DESC`, `getTaskById`) en `src/db/repository.ts`
- [X] T012 [US1] Implementar subcomando `task-cli add <title>` con opciones `-p, --priority` (default: `medium`) y `-d, --description` en `src/commands/add.ts`
- [X] T013 [US1] Implementar subcomando `task-cli list` con tabla formateada y mensaje amigable si no hay tareas en `src/commands/list.ts`
- [X] T014 [US1] Implementar subcomando `task-cli show <id>` para ver la ficha detallada con descripción en `src/commands/show.ts`
- [X] T015 [US1] Configurar punto de entrada de Commander.js vinculando comandos `add`, `list` y `show` en `src/index.ts`

**Checkpoint**: User Story 1 funcional de forma autónoma. MVP listo para ejecución y pruebas.

---

## Phase 4: User Story 2 - Transiciones de Estado de Tareas (Priority: P2)

**Objetivo**: Controlar el ciclo de vida de las tareas validando estrictamente las transiciones permitidas y bloqueando saltos inválidos (`todo -> done`).

**Test Independiente**: Ejecutar `task-cli status <id> <nuevo-estado>` verificando transiciones válidas (`todo -> in-progress -> done`) y verificando el rechazo con código 1 al intentar `todo -> done`.

### Tests para User Story 2

- [X] T016 [P] [US2] Escribir pruebas unitarias de la máquina de estados validando transiciones permitidas y prohibidas en `tests/unit/state-machine.test.ts`

### Implementación para User Story 2

- [X] T017 [US2] Implementar función de validación de transiciones de estado `validateStatusTransition(currentStatus, nextStatus)` en `src/utils/validator.ts`
- [X] T018 [US2] Implementar método de persistencia `updateTaskStatus(id, newStatus)` en `src/db/repository.ts`
- [X] T019 [US2] Implementar subcomando `task-cli status <id> <new-status>` con validaciones y mensajes en `src/commands/status.ts`
- [X] T020 [US2] Registrar el subcomando `status` en `src/index.ts`

**Checkpoint**: User Stories 1 y 2 funcionando e integradas correctamente.

---

## Phase 5: User Story 3 - Filtrado y Búsqueda en el Listado (Priority: P3)

**Objetivo**: Filtrar tareas en el listado por estado (`--status`) y prioridad (`--priority`), aplicando conjunción lógica AND cuando se combinan.

**Test Independiente**: Crear tareas con combinaciones de estados y prioridades, ejecutar `task-cli list --status in-progress`, `task-cli list --priority high` y `task-cli list --status todo --priority high`, validando los resultados.

### Tests para User Story 3

- [X] T021 [P] [US3] Escribir pruebas unitarias para filtros individuales y combinados con lógica AND en `tests/unit/us3-filters.test.ts`

### Implementación para User Story 3

- [X] T022 [US3] Extender `listTasks` en el repositorio para admitir parámetros de filtro `TaskFilter` con cláusulas SQL dinámicas `AND` en `src/db/repository.ts`
- [X] T023 [US3] Extender subcomando `list` para aceptar opciones `-s, --status` y `-p, --priority` con validación de valores válidos en `src/commands/list.ts`

**Checkpoint**: Filtrado operativo sin afectar el listado general existente.

---

## Phase 6: User Story 4 - Modificación de Detalles de Tarea (Priority: P4)

**Objetivo**: Permitir modificar título, prioridad y descripción de una tarea, soportando el vaciado de la descripción al enviar `--description ""`.

**Test Independiente**: Ejecutar `task-cli update <id> -t "Nuevo título" -p high`, verificar con `show <id>`, luego ejecutar `task-cli update <id> -d ""` y comprobar que la descripción pasa a ser nula.

### Tests para User Story 4

- [X] T024 [P] [US4] Escribir pruebas unitarias para actualización selectiva y vaciado de descripción a NULL en `tests/unit/us4-update.test.ts`

### Implementación para User Story 4

- [X] T025 [US4] Implementar método `updateTask(id, input)` en el repositorio soportando actualización parcial y vaciado de descripción a `NULL` en `src/db/repository.ts`
- [X] T026 [US4] Implementar subcomando `task-cli update <id> [options]` validando que al menos una opción sea provista en `src/commands/update.ts`
- [X] T027 [US4] Registrar el subcomando `update` en `src/index.ts`

**Checkpoint**: Modificación parcial y vaciado de campos opcionales funcionando de manera robusta.

---

## Phase 7: User Story 5 - Eliminación Segura y Forzada (Priority: P5)

**Objetivo**: Eliminar tareas por ID con confirmación interactiva por defecto (`s/N`, cancelando en Enter) u omisión con `--force`.

**Test Independiente**: Ejecutar `task-cli delete <id>` respondiendo Enter (verificar cancelación), responder 's' (verificar borrado) y ejecutar `task-cli delete <id> --force` (verificar borrado directo).

### Tests para User Story 5

- [X] T028 [P] [US5] Implementar función de prompt interactivo `confirmAction` con detección de TTY y default No en `src/utils/prompt.ts`
- [X] T029 [P] [US5] Escribir pruebas unitarias para la lógica de borrado y confirmación en `tests/unit/us5-delete.test.ts`

### Implementación para User Story 5

- [X] T030 [US5] Implementar método de borrado `deleteTask(id)` en `src/db/repository.ts`
- [X] T031 [US5] Implementar subcomando `task-cli delete <id> [options]` con confirmación interactiva y bandera `-f, --force` en `src/commands/delete.ts`
- [X] T032 [US5] Registrar el subcomando `delete` en `src/index.ts`

**Checkpoint**: Eliminación segura y forzada completamente operativa.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Propósito**: Empaquetado global, pruebas de integración de extremo a extremo y validación del quickstart.

- [X] T033 [P] Configurar el script de ejecución binaria con shebang `#!/usr/bin/env node` en `src/index.ts` y campo `"bin"` en `package.json` para soporte de `npm install -g .`
- [X] T034 [P] Implementar pruebas de integración de extremo a extremo de todos los comandos CLI en `tests/integration/cli.test.ts`
- [X] T035 Ejecutar y verificar todos los escenarios de validación descritos en `specs/001-task-cli-core/quickstart.md`

---

## Dependencias y Orden de Ejecución

### Dependencias entre Fases

1. **Setup (Fase 1)**: No tiene dependencias externas; inicia de inmediato.
2. **Foundational (Fase 2)**: Depende de Setup; **bloquea** todas las historias de usuario.
3. **User Stories (Fases 3 a 7)**: Dependen de la Fase 2 completa.
   - Flujo secuencial recomendado por prioridad: US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4) → US5 (P5).
4. **Polish (Fase 8)**: Depende de la finalización de todas las historias de usuario deseadas.

### Oportunidades de Paralelización

- Tareas de configuración inicial marcadas con `[P]` (`T002`, `T003`) pueden ejecutarse en paralelo.
- En la fase Foundational, los módulos independientes `src/types/index.ts` (`T004`), `src/db/connection.ts` (`T005`), `src/utils/format.ts` (`T007`) y `src/utils/validator.ts` (`T008`) pueden desarrollarse concurrentemente.
- Las suites de pruebas de cada historia de usuario (`T010`, `T016`, `T021`, `T024`, `T029`) pueden escribirse antes o en paralelo a la lógica del comando correspondiente.

---

## Estrategia de Implementación

### 1. Enfoque MVP Primero (User Story 1)
- Completar Fase 1 (Setup) y Fase 2 (Foundational).
- Implementar Fase 3 (User Story 1: `add`, `list`, `show`).
- **Validar MVP**: Crear y listar tareas localmente para tener un producto mínimo viable utilizable.

### 2. Entrega Incremental
- Incorporar Fase 4 (User Story 2: `status` y ciclo de vida).
- Incorporar Fase 5 (User Story 3: filtros `list --status` y `--priority`).
- Incorporar Fase 6 (User Story 4: `update`).
- Incorporar Fase 7 (User Story 5: `delete`).
- Cada historia agrega valor sin alterar el funcionamiento de las anteriores.
