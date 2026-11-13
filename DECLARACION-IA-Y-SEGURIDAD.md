# Declaración de uso de IA, límites y seguridad

## Uso de IA

- **Código y documentación:** los escribí con **Claude Code** (Anthropic) como asistente de programación. Las decisiones fueron mías:
  - qué app conectar;
  - qué herramientas crear;
  - dejar fuera todo lo que cuesta dinero;
  - qué demostrar.

  La IA escribió el código bajo esas reglas, y yo revisé el resultado y lo probé con la app real.
- **Revisión:** otros agentes de IA revisaron el trabajo por separado y con pruebas reales, en tres rondas: el código (7 problemas), el repositorio antes de publicarlo (9 problemas) y el repositorio publicado contra la pauta del profesor. Todo lo encontrado se corrigió, y el detalle está en [BITACORA.md](BITACORA.md).
- **Modelo de la demostración:** `opencode/big-pickle`, el modelo gratis de opencode. También probé NVIDIA (build.nvidia.com), pero con herramientas tardaba más de 6 minutos por pedido.
- **Base:** el [mcp-starter-kit](https://github.com/Maurichilean3d/mcp-starter-kit) del curso, con licencia MIT.
- Ningún resultado de este repositorio es simulado. Las salidas de [DEMO.md](DEMO.md) y de la bitácora se copiaron de la terminal.

## Límites conocidos

1. **Necesita la app Director de Reels encendida en el mismo Mac.** La app no está en este repositorio. Sin ella:
   - `listar_reels` igual funciona si existe la carpeta de reels;
   - las demás herramientas responden "el Director está apagado" en vez de colgarse.

   Para otra app con API HTTP local, se puede usar como plantilla cambiando `DIRECTOR_URL` y las rutas.
2. **Solo probado en macOS.** Las herramientas que abren ventanas usan el Finder y el navegador del Mac.
3. **Abrir no es lo mismo que confirmar.** `abrir_storyboard` y `abrir_carpeta_reel` le piden a la app que abra la ventana, pero la app no confirma que se abrió. Por eso responden "le pedí al Director abrir…". Si la app lleva días encendida, puede dejar de abrir el navegador, y se arregla reabriéndola.
4. **La búsqueda por palabras puede elegir otro reel.** Si varias carpetas calzan, toma la más reciente que tenga storyboard y avisa cuántas más calzaban. Para elegir una exacta, se usa el ID. Además, con un pedido corto como *"abre el storyboard del pez oscar"*, el modelo a veces pregunta cuál de los reels abrir en vez de elegir; pasó 1 vez en 4 pruebas del 13-nov. Decir *"el más reciente"* lo evita.
5. **La app se apaga si se cierra su ventana.** Hay que minimizarla, no cerrarla.
6. **El modelo gratis puede ser lento o fallar.** El MCP no depende del modelo: `npm run probar-director` prueba las herramientas sin IA.

## Seguridad

- **Sin claves en el repositorio.** `.gitignore` excluye `.env`, y antes de publicar se buscaron en los archivos patrones de claves (`sk-`, `nvapi-`, `ghp_`, `gho_`, `AIza`) y datos personales: 0 resultados. La clave de NVIDIA vive solo en la configuración local de opencode, fuera de esta carpeta.
- **Ninguna herramienta gasta dinero ni borra nada.** Crear guiones o fotos (Gemini y Modal) quedó fuera a propósito. Lo único que se escribe en disco: al abrir un storyboard, la app rehace `storyboard.html` y sus copias de fotos a partir de `meta.json`, sin tocar las fotos originales.
- **Permisos acotados.**
  - El `opencode.json` del repositorio le niega a la IA la terminal, la edición de archivos y la web (`"permission": {"bash": "deny", "edit": "deny", "webfetch": "deny"}`). Así solo puede usar las herramientas del MCP. Esto se agregó el 13-nov porque, en una prueba sin esa regla, el modelo usó comandos de terminal de opencode para leer archivos por su cuenta.
  - Cuatro herramientas solo leen (`readOnlyHint: true`).
  - Las dos que abren ventanas están marcadas como no destructivas (`destructiveHint: false`) y repetibles sin efecto extra (`idempotentHint: true`).
  - `gasto_modal` está marcada con `openWorldHint: true`, porque la app le consulta a Modal por internet.
  - Mis 6 herramientas no ejecutan comandos del sistema: solo le hablan a la API local de la app y leen carpetas.
  - Las 2 herramientas de ejemplo del kit (`listar_aplicaciones` y `abrir_aplicacion`), que podían abrir cualquier app del computador, quedaron desactivadas (`src/tools/_aplicaciones.ts`). El MCP expone solo las 6 propias.
- **Entradas revisadas.** zod valida cada parámetro antes de usarlo. El ID de un reel tiene que calzar con un formato fijo (`AAAA-MM-DD_HHMM_titulo`), así que no se puede pedir una ruta como `../../` para leer otros archivos. Un texto sin letras, como `???`, se rechaza.
- **El MCP solo se conecta a la app local.** Por defecto habla únicamente con `http://127.0.0.1:8895`. La única salida a internet es indirecta: para el gasto del mes, la app le pregunta a Modal.
- **App propia.** Director de Reels es mi propia aplicación y tengo su código. No se conectó ninguna app de terceros, ni se saltó ninguna licencia.
- **Sin datos personales.** Los reels son contenido de productos (peces, joyas). No hay datos de clientes. Los 2 reels de `ejemplo/` solo traen su `meta.json` y su storyboard; se dejaron fuera las fotos de referencia originales. El video y la captura muestran el nombre de usuario del Mac y una ruta local (el autor es el mismo de este repositorio), sin claves ni datos de terceros.
