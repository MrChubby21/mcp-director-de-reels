# Declaración de uso de IA, límites y seguridad

## Uso de IA

- **Código y documentación:** los escribí con **Claude Code** (Anthropic) como asistente de programación. Las decisiones fueron mías:
  - qué app conectar;
  - qué herramientas crear;
  - dejar fuera todo lo que cuesta dinero;
  - qué demostrar.

  La IA escribió el código bajo esas reglas, y yo revisé el resultado y lo probé con la app real.
- **Revisión:** un segundo agente de IA revisó el código por separado y con pruebas reales. Encontró 7 problemas y todos se corrigieron. El detalle está en [BITACORA.md](BITACORA.md).
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
4. **La búsqueda por palabras puede elegir otro reel.** Si varias carpetas calzan, toma la más reciente que tenga storyboard y avisa cuántas más calzaban. Para elegir una exacta, se usa el ID.
5. **La app se apaga si se cierra su ventana.** Hay que minimizarla, no cerrarla.
6. **El modelo gratis puede ser lento o fallar.** El MCP no depende del modelo: `npm run probar-director` prueba las herramientas sin IA.

## Seguridad

- **Sin claves en el repositorio.** `.gitignore` excluye `.env`, y antes de publicar se buscaron en los archivos patrones de claves (`sk-`, `nvapi-`, `ghp_`, `gho_`, `AIza`) y datos personales: 0 resultados. La clave de NVIDIA vive solo en la configuración local de opencode, fuera de esta carpeta.
- **Ninguna herramienta gasta dinero ni borra nada.** Crear guiones o fotos (Gemini y Modal) quedó fuera a propósito.
- **Permisos acotados.**
  - Cuatro herramientas solo leen (`readOnlyHint: true`).
  - Las dos que abren ventanas están marcadas como no destructivas (`destructiveHint: false`).
  - Mis 6 herramientas no ejecutan comandos del sistema: solo le hablan a la API local de la app y leen carpetas.
  - Las 2 herramientas de ejemplo del kit (`listar_aplicaciones` y `abrir_aplicacion`) sí abren apps, con `execFile` y sin shell, tal como vienen del profesor.
- **Entradas revisadas.** zod valida cada parámetro antes de usarlo. El ID de un reel tiene que calzar con un formato fijo (`AAAA-MM-DD_HHMM_titulo`), así que no se puede pedir una ruta como `../../` para leer otros archivos. Un texto sin letras, como `???`, se rechaza.
- **Solo conexiones locales.** Por defecto, el MCP se conecta únicamente a `http://127.0.0.1:8895`.
- **App propia.** Director de Reels es mi propia aplicación y tengo su código. No se conectó ninguna app de terceros, ni se saltó ninguna licencia.
- **Sin datos personales.** Los reels son contenido de productos (peces, joyas). No hay datos de clientes.
