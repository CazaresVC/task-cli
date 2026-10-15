# Guía Rápida de Validación (Quickstart): task-cli

**Feature**: `001-task-cli-core` | **Fecha**: 2026-10-01

Esta guía permite verificar y validar el funcionamiento de `task-cli` de extremo a extremo mediante escenarios ejecutables una vez implementado el código.

---

## 1. Requisitos Previos

- Node.js versión 20 LTS o superior instalado (`node -v`).
- Administrador de paquetes `npm` (`npm -v`).
- Terminal interactiva (PowerShell, Bash o zsh).

---

## 2. Preparación del Entorno Local

Instalar dependencias y vincular el binario localmente:

```bash
# Instalar dependencias del proyecto
npm install

# Compilar / ejecutar pruebas unitarias para asegurar estado verde
npm test
```

---

## 3. Escenarios de Validación de Extremo a Extremo

### Escenario 1: Creación de Tareas y Valores por Defecto

```bash
# 1. Crear tarea con valores por defecto (prioridad medium, estado todo)
npx tsx src/index.ts add "Comprar leche"

# Resultado esperado:
# Tarea creada con éxito. ID: 1

# 2. Crear tarea con prioridad alta y descripción
npx tsx src/index.ts add "Preparar reporte mensual" -p high -d "Incluir gráficos de ventas y costos"

# Resultado esperado:
# Tarea creada con éxito. ID: 2
```

---

### Escenario 2: Listado y Formato Tabular

```bash
# Listar todas las tareas ordenadas por fecha más reciente
npx tsx src/index.ts list

# Resultado esperado:
# Tabla con IDs 2 y 1, mostrando títulos, estados, prioridades y fechas de creación.
```

---

### Escenario 3: Consulta Detallada de Tarea (`show`)

```bash
# Consultar la ficha detallada de la tarea con descripción
npx tsx src/index.ts show 2

# Resultado esperado:
# Vista detallada mostrando ID 2, título, descripción completa, estado y prioridad.
```

---

### Escenario 4: Ciclo de Vida y Transiciones de Estado

```bash
# 1. Intentar transición inválida directa de todo a done
npx tsx src/index.ts status 1 done

# Resultado esperado (stderr, exit code 1):
# Error: Transición no permitida. Una tarea en estado "todo" debe pasar a "in-progress" antes de completarse.

# 2. Mover tarea a in-progress (válido)
npx tsx src/index.ts status 1 in-progress

# Resultado esperado:
# Estado de la tarea #1 actualizado a "in-progress".

# 3. Completar tarea a done (válido)
npx tsx src/index.ts status 1 done

# Resultado esperado:
# Estado de la tarea #1 actualizado a "done".
```

---

### Escenario 5: Filtrado Combinado (Lógica AND)

```bash
# Filtrar tareas por estado y prioridad simultáneamente
npx tsx src/index.ts list --status todo --priority high

# Resultado esperado:
# Solo la tarea #2 (todo + high). La tarea #1 (done) no debe figurar.
```

---

### Escenario 6: Actualización y Vaciado de Descripción

```bash
# 1. Modificar título y prioridad
npx tsx src/index.ts update 1 -t "Comprar leche deslactosada" -p low

# 2. Vaciar descripción de la tarea #2
npx tsx src/index.ts update 2 -d ""

# 3. Verificar mediante show que la descripción quedó vacía
npx tsx src/index.ts show 2
```

---

### Escenario 7: Eliminación Segura y Forzada

```bash
# 1. Eliminación interactiva con cancelación
npx tsx src/index.ts delete 1
# Prompt: ¿Estás seguro de eliminar la tarea #1? (s/N) [Presionar Enter]
# Resultado esperado: Operación cancelada.

# 2. Eliminación forzada con --force
npx tsx src/index.ts delete 1 --force
# Resultado esperado: Tarea #1 eliminada con éxito.
```

---

## 4. Ejecución del Conjunto de Pruebas Automatizadas

```bash
# Ejecutar todas las pruebas unitarias y de integración de la lógica de negocio
npm run test:run
```
