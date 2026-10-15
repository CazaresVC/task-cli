<!--
Sync Impact Report:
- Version change: [CONSTITUTION_VERSION] -> 1.0.0
- List of modified principles:
  - Initialized principles from project rules in reglas.md
- Added sections:
  - Core Principles (I. Simplicidad y Arquitectura Plana, II. Enfoque Funcional y Tipado Estricto, III. Almacenamiento Local con SQLite, IV. Experiencia de Usuario CLI y Manejo de Errores, V. Pruebas Unitarias de Lógica de Negocio)
  - Distribución y Empaquetado
  - Governance
- Removed sections: N/A (initial constitution)
- Follow-up TODOs: None
-->

# Constitución de task-cli

## Core Principles

### I. Simplicidad y Arquitectura Plana
Mantener la estructura del proyecto simple, limpia y plana, organizada por funcionalidad: `commands/`, `db/` y `utils/`. Queda prohibido el uso de arquitectura limpia ("clean architecture") o capas de abstracción excesivas para un CLI de este alcance. No agregar dependencias innecesarias para funcionalidades que pueden implementarse en pocas líneas de código. Se prohíbe el uso de ORMs.

### II. Enfoque Funcional y Tipado Estricto
Priorizar la programación funcional sobre el uso de clases, implementando funciones puras siempre que sea posible. Convenciones de nomenclatura: `camelCase` para variables y funciones; `PascalCase` exclusivamente para tipos e interfaces en TypeScript. El entorno de ejecución es Node.js (versión LTS) con TypeScript, utilizando herramientas como `tsx` para ejecución y compilación directa.

### III. Almacenamiento Local con SQLite
La persistencia de datos se gestiona mediante SQLite usando la librería `better-sqlite3`. La base de datos debe almacenarse en un archivo local en el directorio del usuario final (`~/.task-cli/tasks.db`), asegurando aislamiento, portabilidad y ejecución síncrona eficiente sin servicios externos.

### IV. Experiencia de Usuario CLI y Manejo de Errores
El parseo de comandos, opciones y argumentos se realiza mediante `Commander.js`. Nunca se deben mostrar stack traces al usuario final bajo fallos controlados; en su lugar, se deben emitir mensajes concisos, legibles y accionables por `stderr`. Los códigos de salida deben ser estrictos: `0` para ejecución exitosa y `1` para cualquier error. Toda salida tabular debe ser limpia mediante herramientas como `cli-table3`, restringiendo el uso de colores exclusivamente a estados y niveles de prioridad.

### V. Pruebas Unitarias de Lógica de Negocio
Las pruebas se desarrollan con `Vitest`. Aunque no se impone un porcentaje de cobertura mínimo global, toda la lógica de negocio (transiciones de estado, validaciones y operaciones sobre tareas) debe contar obligatoriamente con pruebas unitarias automatizadas.

## Distribución y Empaquetado

El CLI debe estar configurado para ser distribuible e instalable globalmente mediante `npm install -g .` o desde el registro de paquetes npm, exponiendo el comando ejecutable `task-cli`.

## Governance

Esta constitución define las directrices arquitectónicas y estándares obligatorios para el desarrollo de `task-cli`. Toda especificación, plan de tareas e implementación de código debe adherirse estrictamente a estos principios. Las modificaciones a esta constitución requieren justificación documentada y actualización de versión semántica (SemVer).

**Version**: 1.0.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-01
