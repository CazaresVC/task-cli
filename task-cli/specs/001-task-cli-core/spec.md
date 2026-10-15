# Feature Specification: Gestión de Tareas Personales en CLI (task-cli)

**Feature Branch**: `001-task-cli-core`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Construir un CLI llamado task-cli para gestión de tareas personales desde la terminal."

## Clarifications

### Session 2026-10-01
- Q: ¿Cómo debe visualizar el usuario la descripción completa de una tarea, considerando que la tabla principal de listado la omite para mantener la legibilidad? → A: Agregar un comando dedicado `task-cli show <id>` para ver la ficha completa de la tarea incluyendo su descripción.
- Q: ¿Cómo deben estructurarse los comandos en el CLI para cambiar el estado de una tarea? → A: Un comando unificado `task-cli status <id> <nuevo-estado>` (ej: `task-cli status 1 in-progress`).
- Q: ¿Cómo debe comportarse el filtrado de tareas cuando se usan simultáneamente las opciones --status y --priority en el comando list? → A: Conjunción lógica AND: mostrar solo las tareas que cumplan ambos criterios simultáneamente (ej: status 'todo' Y prioridad 'high').
- Q: ¿Cómo debe solicitarse y validarse la confirmación interactiva al eliminar una tarea sin la opción --force? → A: Preguntar `¿Estás seguro de eliminar la tarea #ID? (s/N)` con No por defecto al presionar Enter, aceptando 's' o 'S' (y 'y'/'Y') para confirmar.
- Q: ¿Cómo debe indicar el usuario que desea eliminar o vaciar la descripción de una tarea existente al usar el comando update? → A: Permitir pasar una cadena vacía en `--description ""` para removerla (almacenando NULL en base de datos).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Creación y Listado de Tareas (Priority: P1)

Como usuario que trabaja en terminal, quiero crear tareas con título, prioridad opcional y descripción opcional, y poder listarlas en formato tabular para tener visibilidad de mis pendientes.

**Why this priority**: Es la funcionalidad esencial que permite tener un MVP funcional de gestión de tareas.

**Independent Test**: Ejecutar la creación de una tarea y listar las tareas creadas para verificar que aparecen con su identificador, título, estado inicial "todo", prioridad por defecto "medium" y fecha de creación.

**Acceptance Scenarios**:

1. **Given** no existen tareas previas, **When** el usuario ejecuta el comando para crear una tarea con el título "Comprar leche", **Then** el sistema asigna el ID `1`, estado `todo`, prioridad `medium`, guarda la fecha de creación y muestra un mensaje de confirmación con el ID generado.
2. **Given** una o más tareas registradas, **When** el usuario solicita el listado sin filtros, **Then** el sistema muestra una tabla con las columnas ID, título, estado, prioridad y fecha de creación, ordenadas con las más recientes primero.
3. **Given** el usuario intenta crear una tarea sin título o con un título en blanco, **When** se envía el comando, **Then** el sistema rechaza la operación, emite un mensaje de error claro y termina con código de error.
4. **Given** una tarea existente con descripción, **When** el usuario ejecuta `task-cli show <id>`, **Then** el sistema presenta una vista detallada con todos sus campos (ID, título, descripción, estado, prioridad, fecha de creación y actualización).

---

### User Story 2 - Transiciones de Estado de Tareas (Priority: P2)

Como usuario, quiero actualizar el estado de mis tareas siguiendo un ciclo de vida controlado para reflejar el progreso real de mi trabajo y evitar completar tareas por accidente.

**Why this priority**: Garantiza la integridad del flujo de trabajo de tareas entre backlog, ejecución activa y conclusión.

**Independent Test**: Crear una tarea en estado `todo`, moverla a `in-progress` y luego a `done`. Intentar saltar directamente de `todo` a `done` para verificar que la regla de validación lo impide.

**Acceptance Scenarios**:

1. **Given** una tarea en estado `todo`, **When** el usuario ejecuta `task-cli status <id> in-progress`, **Then** el estado se actualiza exitosamente a `in-progress` y se emite mensaje de confirmación.
2. **Given** una tarea en estado `in-progress`, **When** el usuario ejecuta `task-cli status <id> done`, **Then** la tarea queda marcada como completada.
3. **Given** una tarea en estado `todo`, **When** el usuario intenta ejecutar `task-cli status <id> done`, **Then** el sistema rechaza la transición indicando que debe pasar primero por `in-progress` y finaliza con código 1.
4. **Given** una tarea en estado `in-progress`, **When** el usuario ejecuta `task-cli status <id> todo`, **Then** el sistema actualiza el estado a `todo`.
5. **Given** una tarea en estado `done`, **When** el usuario ejecuta `task-cli status <id> todo`, **Then** el sistema permite la transición y reabre la tarea en estado `todo`.

---

### User Story 3 - Filtrado y Búsqueda en el Listado (Priority: P3)

Como usuario con múltiples tareas, quiero filtrar la lista de tareas por estado y por prioridad para concentrarme únicamente en lo que es relevante en un momento dado.

**Why this priority**: Facilita la navegación y priorización a medida que crece el volumen de tareas registradas.

**Independent Test**: Crear tareas con combinaciones de estados (`todo`, `in-progress`, `done`) y prioridades (`high`, `medium`, `low`), y aplicar filtros individuales o combinados verificando que los resultados coincidan exactamente.

**Acceptance Scenarios**:

1. **Given** tareas con diferentes estados, **When** el usuario solicita listar con filtro `--status in-progress`, **Then** la tabla solo muestra aquellas cuyo estado es `in-progress`.
2. **Given** tareas con diferentes prioridades, **When** el usuario solicita listar con filtro `--priority high`, **Then** la tabla solo muestra aquellas con prioridad `high`.
3. **Given** tareas con diversos estados y prioridades, **When** el usuario ejecuta `task-cli list --status todo --priority high`, **Then** el sistema muestra únicamente las tareas que coincidan con ambos filtros simultáneamente (conjunción lógica AND).

---

### User Story 4 - Modificación de Detalles de una Tarea (Priority: P4)

Como usuario, quiero actualizar el título, la descripción o la prioridad de una tarea existente cuando los requerimientos o el alcance cambian.

**Why this priority**: Permite corregir errores tipográficos y refinar la descripción de tareas existentes sin tener que recrearlas.

**Independent Test**: Modificar el título y prioridad de una tarea por su ID y verificar mediante el listado que los cambios persisten.

**Acceptance Scenarios**:

1. **Given** una tarea con ID `1`, **When** el usuario actualiza su título a "Comprar leche deslactosada" y prioridad a `high`, **Then** los campos se actualizan y el sistema confirma la modificación.
2. **Given** una tarea inexistente con ID `999`, **When** el usuario intenta actualizarla, **Then** el sistema devuelve un error informando que la tarea no existe.
3. **Given** una tarea con descripción existente, **When** el usuario ejecuta `task-cli update <id> --description ""`, **Then** el sistema actualiza la tarea limpiando la descripción (estableciéndola como NULL) y emite un mensaje de confirmación.

---

### User Story 5 - Eliminación Segura de Tareas (Priority: P5)

Como usuario, quiero eliminar tareas obsoletas o creadas por error, contando con una confirmación interactiva para prevenir eliminaciones accidentales salvo que use una bandera explícita.

**Why this priority**: Mantiene limpia la lista de tareas garantizando protección contra pérdidas involuntarias de información.

**Independent Test**: Solicitar la eliminación de una tarea respondiendo "no" a la confirmación y comprobar que sigue existiendo; luego ejecutar la eliminación con `--force` y comprobar que desaparece.

**Acceptance Scenarios**:

1. **Given** una tarea con ID `1`, **When** el usuario ejecuta el comando de eliminación sin `--force`, **Then** el sistema presenta el prompt `¿Estás seguro de eliminar la tarea #1? (s/N)`; si el usuario presiona Enter o responde negativamente, la operación se cancela sin eliminar la tarea; si responde 's', 'S', 'y' o 'Y', la tarea es eliminada permanentemente.
2. **Given** una tarea con ID `1`, **When** el usuario ejecuta el comando de eliminación con `--force`, **Then** el sistema elimina la tarea inmediatamente sin solicitar confirmación.
3. **Given** un ID inexistente, **When** se solicita la eliminación, **Then** el sistema informa que la tarea no fue encontrada.

---

### Edge Cases

- ¿Qué ocurre si el usuario intenta interactuar con un ID que no es numérico (ej. `task-cli delete abc`)? El sistema debe validar el formato numérico del argumento y reportar un mensaje amigable indicando que el ID debe ser un entero positivo.
- ¿Qué ocurre si la base de datos o el directorio de almacenamiento del usuario no existe al primer inicio? El sistema debe crear automáticamente el directorio y archivo requeridos de forma transparente sin fallar.
- ¿Qué ocurre si la terminal no es interactiva (TTY no disponible / piped input) al intentar eliminar sin `--force`? El sistema debe cancelar la eliminación de forma segura y advertir que se requiere `--force` en entornos no interactivos.
- ¿Qué ocurre si se solicita ordenar o filtrar cuando no existen tareas registradas? El sistema debe presentar una tabla vacía o un mensaje informativo claro indicando que no hay tareas para mostrar, retornando código `0`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir crear una tarea requiriendo obligatoriamente un título no vacío.
- **FR-002**: El sistema DEBE permitir asignar una prioridad opcional (`high`, `medium`, `low`), utilizando `medium` como valor predeterminado si no se especifica.
- **FR-003**: El sistema DEBE permitir asignar una descripción opcional en texto a la tarea.
- **FR-004**: El sistema DEBE asignar a cada nueva tarea un identificador numérico autoincremental positivo e irrepetible en la secuencia.
- **FR-005**: El sistema DEBE inicializar toda nueva tarea con el estado `todo` y la fecha/hora actual de creación.
- **FR-006**: El sistema DEBE listar las tareas en formato tabular mostrando: ID, título, estado, prioridad y fecha de creación.
- **FR-007**: El sistema DEBE permitir filtrar el listado por estado mediante la opción `--status <todo|in-progress|done>`.
- **FR-008**: El sistema DEBE permitir filtrar el listado por prioridad mediante la opción `--priority <high|medium|low>`, aplicando una conjunción lógica AND estricta cuando se combinan filtros de estado y prioridad (mostrar solo las tareas que satisfacen ambos criterios a la vez).
- **FR-009**: El sistema DEBE ordenar las tareas por fecha de creación de forma descendente (más recientes primero) de manera predeterminada.
- **FR-010**: El sistema DEBE proveer el comando `task-cli status <id> <nuevo-estado>` para modificar el estado de una tarea existente identificada por su ID a uno de los tres estados válidos: `todo`, `in-progress`, `done`.
- **FR-011**: El sistema DEBE permitir únicamente las siguientes transiciones de estado: `todo` → `in-progress`, `in-progress` → `done`, `in-progress` → `todo`, y `done` → `todo`.
- **FR-012**: El sistema DEBE rechazar la transición directa de `todo` a `done`, indicando al usuario que la tarea debe pasar primero por `in-progress`.
- **FR-013**: El sistema DEBE permitir actualizar el título, la descripción y/o la prioridad de una tarea existente especificando su ID; si se pasa una cadena vacía en `--description ""`, se debe remover la descripción previa estableciéndola en NULL en la base de datos.
- **FR-014**: El sistema DEBE solicitar confirmación interactiva previa al eliminar mediante el mensaje `¿Estás seguro de eliminar la tarea #<ID>? (s/N)`, asumiendo 'No' (cancelación segura) al presionar Enter o cualquier respuesta distinta de 's', 'S', 'y' o 'Y'.
- **FR-015**: El sistema DEBE proveer la opción `--force` en el comando de eliminación para omitir la confirmación interactiva.
- **FR-016**: El sistema DEBE terminar con código de salida `0` en operaciones exitosas y con código `1` en errores de validación, inexistencia de recursos o comandos incorrectos.
- **FR-017**: El sistema DEBE emitir mensajes legibles y accionables en español por `stderr` ante errores, sin exponer trazas de error técnicas (stack traces).
- **FR-018**: El sistema DEBE proveer el comando `task-cli show <id>` para visualizar en detalle todos los atributos de una tarea específica, incluyendo su descripción completa, retornando código `1` con mensaje descriptivo si el ID no existe.

### Key Entities

- **Task (Tarea)**:
  - `id`: Identificador numérico único autoincremental (entero positivo).
  - `title`: Título o resumen descriptivo de la tarea (cadena de texto no vacía).
  - `description`: Detalle o contexto extendido (cadena de texto opcional).
  - `status`: Estado actual del ciclo de vida (`todo`, `in-progress`, `done`).
  - `priority`: Nivel de urgencia e importancia (`high`, `medium`, `low`).
  - `created_at`: Marca temporal de creación (formato estándar ISO o legible local).
  - `updated_at`: Marca temporal de última modificación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La ejecución de cualquier comando de consulta o manipulación en una base de datos local con hasta 10,000 tareas debe completarse en menos de 200 milisegundos.
- **SC-002**: El 100% de los intentos de transición de estado no permitidos (ej. `todo` → `done`) son interceptados y rechazados mostrando una explicación clara de la regla de negocio.
- **SC-003**: El comando de eliminación sin bandera `--force` nunca elimina un registro a menos que exista una confirmación afirmativa explícita del usuario.
- **SC-004**: Los mensajes de error nunca contienen trazas internas (`stack trace`), garantizando mensajes amigables y accionables en el 100% de los casos de falla esperados.
- **SC-005**: Todas las salidas en formato tabla se ajustan legiblemente al ancho estándar de terminal conservando las cabeceras requeridas.

## Assumptions

- El usuario ejecuta el comando en una terminal de línea de comandos en un entorno local (Windows, macOS o Linux).
- El almacenamiento de datos es local y exclusivo del usuario que ejecuta el CLI en su estación de trabajo.
- Se descarta autenticación, control de accesos multiusuario y sincronización remota en este alcance inicial.
- No se contemplan fechas límite (due dates), subtareas, dependencias entre tareas ni etiquetado/categorización en esta versión.
- No se expone ninguna interfaz gráfica ni servidor HTTP/REST.
