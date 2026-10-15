# Contratos de Interfaz CLI: task-cli

**Feature**: `001-task-cli-core` | **Fecha**: 2026-10-01

Este documento especifica la interfaz de línea de comandos pública para `task-cli`, detallando argumentos, opciones, códigos de salida y formatos esperados de salida en `stdout` y `stderr`.

---

## 1. Convenciones Globales

- **Binario ejecutable**: `task-cli`
- **Código de salida `0`**: Éxito en la operación o cancelación segura solicitada por el usuario.
- **Código de salida `1`**: Error de validación, argumento incorrecto, recurso no encontrado o regla de negocio infringida.
- **Canal de errores (`stderr`)**: Los mensajes de error se emiten por `stderr` en español, sin stack traces.
- **Canal estándar (`stdout`)**: Los resultados, tablas y confirmaciones se emiten por `stdout`.

---

## 2. Comandos

### 2.1 `task-cli add`

Crea una nueva tarea.

- **Sintaxis**: `task-cli add <title> [options]`
- **Argumentos**:
  - `title` *(obligatorio)*: Cadena no vacía que describe la tarea.
- **Opciones**:
  - `-p, --priority <priority>`: Nivel de prioridad (`high` | `medium` | `low`). Por defecto: `medium`.
  - `-d, --description <desc>`: Descripción detallada opcional.
- **Salida Exitosa (`stdout`)**:
  ```text
  Tarea creada con éxito. ID: 1
  ```
- **Errores (`stderr`, exit code 1)**:
  - Título vacío: `Error: El título de la tarea no puede estar vacío.`
  - Prioridad inválida: `Error: Prioridad no válida. Debe ser "high", "medium" o "low".`

---

### 2.2 `task-cli list`

Lista las tareas registradas en formato de tabla.

- **Sintaxis**: `task-cli list [options]`
- **Opciones**:
  - `-s, --status <status>`: Filtra por estado (`todo` | `in-progress` | `done`).
  - `-p, --priority <priority>`: Filtra por prioridad (`high` | `medium` | `low`).
  *(Si se combinan ambas opciones, se aplica la condición lógica AND).*
- **Salida Exitosa (`stdout`)**:
  ```text
  ┌────┬──────────────────────┬─────────────┬──────────┬──────────────────┐
  │ ID │ Título               │ Estado      │ Prioridad│ Creado           │
  ├────┼──────────────────────┼─────────────┼──────────┼──────────────────┤
  │ 2  │ Comprar café         │ todo        │ high     │ 2026-10-01 18:30 │
  │ 1  │ Configurar entorno   │ in-progress │ medium   │ 2026-10-01 18:15 │
  └────┴──────────────────────┴─────────────┴──────────┴──────────────────┘
  ```
- **Caso sin tareas**:
  ```text
  No se encontraron tareas registradas.
  ```

---

### 2.3 `task-cli show`

Muestra la ficha técnica completa de una tarea específica, incluyendo su descripción.

- **Sintaxis**: `task-cli show <id>`
- **Argumentos**:
  - `id` *(obligatorio)*: Identificador numérico entero positivo.
- **Salida Exitosa (`stdout`)**:
  ```text
  Tarea #1
  ──────────────
  Título:        Configurar entorno
  Descripción:   Instalar dependencias y configurar TypeScript
  Estado:        in-progress
  Prioridad:     medium
  Creado:        2026-10-01 18:15:00
  Actualizado:   2026-10-01 18:25:00
  ```
- **Errores (`stderr`, exit code 1)**:
  - ID no numérico: `Error: El ID debe ser un número entero positivo.`
  - Tarea no encontrada: `Error: No se encontró la tarea con ID 1.`

---

### 2.4 `task-cli status`

Modifica el estado de una tarea aplicando las reglas del ciclo de vida.

- **Sintaxis**: `task-cli status <id> <new-status>`
- **Argumentos**:
  - `id` *(obligatorio)*: Identificador numérico de la tarea.
  - `new-status` *(obligatorio)*: Nuevo estado (`todo` | `in-progress` | `done`).
- **Salida Exitosa (`stdout`)**:
  ```text
  Estado de la tarea #1 actualizado a "in-progress".
  ```
- **Errores (`stderr`, exit code 1)**:
  - Transición inválida (`todo` a `done`):
    `Error: Transición no permitida. Una tarea en estado "todo" debe pasar a "in-progress" antes de completarse.`
  - Estado inválido:
    `Error: Estado inválido "archived". Los estados válidos son: todo, in-progress, done.`
  - Tarea no encontrada:
    `Error: No se encontró la tarea con ID 999.`

---

### 2.5 `task-cli update`

Modifica uno o más campos de una tarea existente.

- **Sintaxis**: `task-cli update <id> [options]`
- **Argumentos**:
  - `id` *(obligatorio)*: Identificador numérico de la tarea.
- **Opciones**:
  - `-t, --title <title>`: Nuevo título (no vacío).
  - `-d, --description <desc>`: Nueva descripción. Si se envía cadena vacía (`""`), se elimina la descripción.
  - `-p, --priority <priority>`: Nueva prioridad (`high` | `medium` | `low`).
- **Salida Exitosa (`stdout`)**:
  ```text
  Tarea #1 actualizada con éxito.
  ```
- **Errores (`stderr`, exit code 1)**:
  - Sin opciones: `Error: Debes proporcionar al menos un campo para actualizar (--title, --description o --priority).`
  - Título vacío: `Error: El título no puede estar vacío.`
  - Tarea no encontrada: `Error: No se encontró la tarea con ID 999.`

---

### 2.6 `task-cli delete`

Elimina una tarea del sistema.

- **Sintaxis**: `task-cli delete <id> [options]`
- **Argumentos**:
  - `id` *(obligatorio)*: Identificador numérico de la tarea.
- **Opciones**:
  - `-f, --force`: Salta la confirmación interactiva y elimina inmediatamente.
- **Flujo Interactivo (sin `--force`)**:
  - Pregunta: `¿Estás seguro de eliminar la tarea #1? (s/N) `
  - Si el usuario presiona Enter o responde `n` / `no`:
    `Operación cancelada.` (exit code 0)
  - Si el usuario responde `s`, `S`, `y` o `Y`:
    `Tarea #1 eliminada con éxito.` (exit code 0)
- **Errores (`stderr`, exit code 1)**:
  - TTY no disponible sin `--force`: `Error: Terminal no interactiva detectada. Usa la opción --force para confirmar la eliminación.`
  - Tarea no encontrada: `Error: No se encontró la tarea con ID 999.`
