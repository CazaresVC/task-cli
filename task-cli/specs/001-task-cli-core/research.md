# Investigación Técnica: CLI de Gestión de Tareas (task-cli)

**Feature**: `001-task-cli-core` | **Fecha**: 2026-10-01

Este documento consolida las decisiones de arquitectura técnica, librerías y patrones de diseño para la implementación de `task-cli`, en estricto cumplimiento con la constitución del proyecto.

---

## 1. Runtime y Entorno de Ejecución

- **Decisión**: Node.js (v20+ LTS) con TypeScript (v5.x), ejecutado y compilado con `tsx` para desarrollo rápido y empaquetado para distribución vía `npm`.
- **Razón**: 
  - Proporciona un entorno tipado robusto con soporte nativo para ES Modules.
  - `tsx` elimina la necesidad de pasos intermedios de compilación durante el desarrollo y pruebas locales.
  - Facilita la distribución como binario CLI instalable globalmente mediante el campo `"bin"` en `package.json`.
- **Alternativas consideradas**:
  - *ts-node*: Descartado por tiempos de inicio más lentos comparados con `tsx` y configuraciones complejas de ESM.
  - *JavaScript puro sin tipos*: Descartado porque TypeScript garantiza la integridad de modelos de datos y transiciones de estado en tiempo de compilación.

---

## 2. Base de Datos y Persistencia Local

- **Decisión**: SQLite utilizando la librería nativa `better-sqlite3`, almacenando el archivo en `~/.task-cli/tasks.db`.
- **Razón**:
  - `better-sqlite3` es la biblioteca SQLite más rápida y fiable para Node.js, ofreciendo una API completamente síncrona.
  - La sincronía es ideal para herramientas CLI de ciclo de vida corto (inicio → comando → persistencia → salida), evitando sobrecarga de promesas y event loop.
  - Almacenar la base de datos en el directorio home del usuario (`os.homedir()`) garantiza que las tareas persistan independientemente del directorio de trabajo actual desde el que se invoque el comando.
  - No requiere un servidor de base de datos externo ni dependencias complejas.
- **Alternativas consideradas**:
  - *sqlite3 (npm)*: Descartado por su API asíncrona basada en callbacks/promesas, que agrega complejidad innecesaria para un CLI simple.
  - *Archivos JSON planos*: Descartado por falta de atomicidad transaccional, riesgo de corrupción por escritura concurrente e ineficiencia con miles de registros.
  - *ORMs (Prisma, TypeORM, Drizzle)*: Expresamente prohibidos por la Constitución (Principio I y Principio III).

---

## 3. Framework CLI y Parseo de Argumentos

- **Decisión**: `Commander.js` (versión 12+).
- **Razón**:
  - Estándar de la industria para Node.js, ligero, sin dependencias innecesarias.
  - Permite definir subcomandos (`add`, `list`, `status`, `update`, `delete`, `show`) con tipado, opciones y argumentos posicionales de forma declarativa.
  - Soporta manejo de opciones booleanas, valores por defecto, opciones opcionales (`--priority`, `--description`, `--force`, `--status`) y generación automática del menú de ayuda (`--help`).
- **Alternativas consideradas**:
  - *Yargs*: Descartado por ser más pesado y tener una API con mayor sobrecarga para un CLI plano.
  - *Parseo manual de `process.argv`*: Descartado porque `Commander.js` resuelve casos extremos de banderas, valores combinados y formateo de ayuda de manera estándar y mantenible.

---

## 4. Entrada Interactiva de Confirmación

- **Decisión**: Módulo nativo `node:readline/promises` de Node.js para confirmaciones interactivas por stdin/stdout.
- **Razón**:
  - Cero dependencias externas adicionales, alineado con el Principio I (sin dependencias innecesarias).
  - Detecta si la terminal es interactiva usando `process.stdin.isTTY`.
  - Permite solicitar `¿Estás seguro de eliminar la tarea #<ID>? (s/N)` y evaluar fácilmente si el usuario presionó Enter (default 'n') o ingresó 's'/'S'/'y'/'Y'.
- **Alternativas consideradas**:
  - *Inquirer / @inquirer/prompts*: Descartado por introducir múltiples dependencias pesadas solo para una pregunta de confirmación sí/no.

---

## 5. Salida Tabular y Formateo Visual

- **Decisión**: `cli-table3` para tablas en terminal y `picocolors` (o secuencias ANSI directas) para colorear estados y prioridades.
- **Razón**:
  - `cli-table3` permite crear tablas ASCII/Unicode limpias, autoajustables y con cabeceras claras, cumpliendo con el Principio IV.
  - `picocolors` es extremadamente ligero (~3 KB, sin dependencias) y mucho más liviano que `chalk`.
  - Los colores se aplicarán únicamente para estados (`todo`: gris/azul, `in-progress`: amarillo, `done`: verde) y prioridades (`high`: rojo, `medium`: amarillo, `low`: verde), respetando la Constitución.
- **Alternativas consideradas**:
  - *console.table nativo*: Descartado por formato rígido que no permite colorear celdas ni controlar bordes de manera estética en CLI.
  - *Chalk*: Funciona bien, pero `picocolors` ofrece idéntica funcionalidad con una fracción del tamaño.

---

## 6. Framework de Testing

- **Decisión**: `Vitest`.
- **Razón**:
  - Rápido, con soporte nativo para TypeScript y ESM sin configuración compleja.
  - Compatibilidad total con la API de Jest (`describe`, `it`, `expect`).
  - Permite instanciar bases de datos SQLite en memoria (`:memory:`) en cada suite de pruebas para aislamiento total e instantáneo de la lógica de negocio.
- **Alternativas consideradas**:
  - *Jest*: Descartado por requerir transformadores y configuraciones complejas para ESM y TypeScript nativo.
  - *Node test runner nativo (`node:test`)*: Descartado en favor de `Vitest` por mejor DX, mejor reporte de fallos y soporte directo de mocks y configuración de TypeScript.
