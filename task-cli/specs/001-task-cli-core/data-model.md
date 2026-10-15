# Modelo de Datos: task-cli

**Feature**: `001-task-cli-core` | **Fecha**: 2026-10-01

Este documento define las entidades, esquema de base de datos SQLite, validaciones de dominio y la máquina de estados que gobierna el ciclo de vida de las tareas.

---

## 1. Entidad Principal: `Task`

La entidad `Task` representa una tarea individual en la lista del usuario.

### Atributos

| Campo | Tipo TypeScript | Tipo SQLite | Nulable | Valor por Defecto | Descripción |
|---|---|---|---|---|---|
| `id` | `number` | `INTEGER` | No | Autoincremental | Identificador único numérico secuencial de la tarea. |
| `title` | `string` | `TEXT` | No | - | Título de la tarea. Cadena no vacía (tras recorte de espacios). |
| `description` | `string \| null` | `TEXT` | Sí | `NULL` | Contexto o detalle extendido de la tarea. |
| `status` | `TaskStatus` | `TEXT` | No | `'todo'` | Estado actual en el ciclo de vida de la tarea. |
| `priority` | `TaskPriority` | `TEXT` | No | `'medium'` | Nivel de urgencia / importancia. |
| `created_at` | `string` | `TEXT` | No | `datetime('now')` | Fecha y hora de creación en formato ISO 8601 UTC. |
| `updated_at` | `string` | `TEXT` | No | `datetime('now')` | Fecha y hora de última modificación en formato ISO 8601 UTC. |

---

## 2. Tipos de Dominio

```typescript
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
}
```

---

## 3. Esquema SQLite (DDL)

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL CHECK(length(trim(title)) > 0),
  description TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in-progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
```

---

## 4. Máquina de Estados y Ciclo de Vida

El ciclo de vida de una tarea está estrictamente regulado. Las transiciones no autorizadas son rechazadas con error antes de interactuar con la base de datos.

### Diagrama de Transición de Estados

```text
       ┌───────────┐
       │   todo    │◄─────────────────┐
       └─────┬─────┘                  │
             │                        │
             │ (start: todo -> in-progress)
             ▼                        │
       ┌───────────┐                  │
       │in-progress│──(backlog)───────┘
       └─────┬─────┘                  ▲
             │                        │
             │ (complete)             │ (reopen)
             ▼                        │
       ┌───────────┐                  │
       │   done    │──────────────────┘
       └───────────┘
```

### Tabla de Transiciones Válidas

| Estado Origen | Estado Destino | Permitido | Regla / Razón |
|---|---|---|---|
| `todo` | `in-progress` | **Sí** | Inicio de ejecución de una tarea del backlog. |
| `in-progress` | `done` | **Sí** | Conclusión normal de una tarea activa. |
| `in-progress` | `todo` | **Sí** | Retorno de la tarea al backlog si se detiene la ejecución. |
| `done` | `todo` | **Sí** | Reapertura de una tarea finalizada si requiere trabajo adicional. |
| `todo` | `done` | **No** | Prohibido completar sin haber pasado por `in-progress`. |
| `done` | `in-progress` | **No** | Debe reabrirse primero a `todo` antes de volver a iniciarse. |
| `X` | `X` | **No** | Transición redundante sin cambio de estado. |

---

## 5. Reglas de Validación de Negocio

1. **Título Obligatorio**:
   - `title` no puede ser nulo ni vacío. Tras aplicar `trim()`, debe contener al menos 1 caracter.
2. **Prioridades Permitidas**:
   - Únicamente `'high'`, `'medium'`, `'low'`. Cualquier otro valor es rechazado con código de salida `1`.
   - Valor por defecto al crear: `'medium'`.
3. **Estados Permitidos**:
   - Únicamente `'todo'`, `'in-progress'`, `'done'`.
   - Valor inicial obligatorio: `'todo'`.
4. **Vaciado de Descripción**:
   - Al invocar actualización con `--description ""`, el campo `description` pasa a ser `NULL` en la base de datos.
5. **Identificador Numérico**:
   - Todo ID en comandos (`status`, `show`, `update`, `delete`) debe ser un entero positivo (> 0).
