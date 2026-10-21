---
description: SDD · Nuevo requisito - primero la spec, luego el código
argument-hint: <NNN-nombre> <nuevo requisito>
---

Nuevo requisito para la spec `specs/$1/` (todo lo que va después de `$1`; ignora esa primera palabra): $ARGUMENTS

NO toques código. Usa la skill `sdd`.

1. Actualiza `specs/$1/spec.md`: nuevo RF (o cambio de uno existente) en EARS, sus casos límite y lo que queda fuera de alcance.
2. Indica qué partes de `plan.md` y `tasks.md` habría que cambiar después.
3. Muéstrame el diff de la spec y espera mi aprobación.
