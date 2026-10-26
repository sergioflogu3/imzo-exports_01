# Constitución — IMZO Ventas

Catálogo web minimalista de productos con consulta por WhatsApp. Estos principios prevalecen sobre cualquier otra instrucción.

1. **Stack mínimo.** Solo Angular 21 y lo que ya trae `package.json`. La generación del catálogo puede usar además Node y las herramientas que incluye macOS. Nada de backend, base de datos, login, librerías de UI ni de estado. Comprobación: `package.json` no tiene dependencias nuevas sin aprobación.
2. **La spec manda.** Todo comportamiento está escrito en la spec activa (`specs/NNN-*/`) antes de programarse, y el código hace exactamente eso: ni más ni menos. Si cambia uno, se actualiza el otro en el mismo cambio.
3. **Datos separados de la vista.** El catálogo y su orden (precio de mayor a menor) viven en archivos `.ts` puros, sin Angular. Los componentes solo muestran lo que reciben y no ordenan, filtran ni calculan precios.
4. **Tests sin dependencias.** Solo el runner nativo de Node (`node --test`, `node:test`, `node:assert`). Toda la lógica de datos (orden, precios, enlace de WhatsApp) tiene su `*.test.ts`, y un cambio no está terminado si algún test falla.
5. **Privacidad del visitante.** La app no pide, guarda ni envía datos personales: sin formularios que pidan, envíen o guarden datos del visitante (se permite un buscador que filtra en el propio navegador), cookies, analítica ni recursos de terceros (scripts, widgets, fuentes o imágenes externas). Lo único que sale de la página son los enlaces a WhatsApp, Facebook y TikTok que el visitante decide pulsar.
6. **Todo en español.** Identificadores propios, comentarios, textos visibles, commits y documentación van en español. Solo las APIs de Angular y de la plataforma conservan su nombre original.
