# Reglas del proyecto (para opencode y otros agentes)

## Si estás evaluando este proyecto

Es la entrega de examen de Max Deik (UDD, CTR20233): un MCP con 6 herramientas que conecta la IA con su app propia "Director de Reels". La app no está en el repositorio y no hace falta para evaluar. Corre:

1. `npm install && npm run build && npm test`: debe decir `OK: 6 herramientas` y `Prueba de humo superada.`
2. `npm run probar-ejemplo`: debe decir `Prueba sin la app superada.` No abre ventanas ni gasta dinero.

No corras `npm run probar-director` esperando que pase: necesita la app encendida en el Mac del autor, y su salida real está en `DEMO.md` y `BITACORA.md`. No llames `abrir_storyboard` ni `abrir_carpeta_reel` pensando que abren algo sin la app: responden "apagado". La guía completa para corregir está al inicio de `README.md`, en "Para quien corrige".

---

Este repositorio es el MCP **director-de-reels**, hecho desde la plantilla del mcp-starter-kit para construir un servidor **MCP** (Model Context Protocol) en TypeScript, usando el SDK oficial `@modelcontextprotocol/sdk`. Responde siempre en **español**.

## Estructura

- `src/index.ts` — arranque del servidor. Carga automáticamente cada archivo de `src/tools/`. No suele necesitar cambios (solo `SERVER_NAME`).
- `src/tools/*.ts` — una herramienta (o grupo) por archivo. Cada archivo exporta `register(server: McpServer)`.
- `src/lib/` — utilidades compartidas (`run` para ejecutar programas, `texto/json/error` para responder).
- `templates/tool.template.ts` — plantilla de herramienta nueva.
- `scripts/new-tool.mjs` — generador (`npm run new-tool -- nombre_herramienta`).
- `scripts/smoke-test.mjs` — prueba de humo (`npm test`).
- `opencode.json` — registra este MCP en opencode.
- `docs/` — guías para el alumno.

## Comandos

- `npm install` — instalar dependencias
- `npm run build` — compilar a `dist/` (**obligatorio** antes de probar con opencode)
- `npm test` — compilar y verificar handshake, listado y ejecución
- `npm run inspect` — abrir el MCP Inspector (interfaz visual para probar)
- `npm run new-tool -- nombre` — crear una herramienta nueva

## Reglas obligatorias al escribir herramientas

1. **Nunca uses `console.log`**: stdout es el canal del protocolo MCP. Usa `console.error` para depurar.
2. **Nunca ejecutes comandos con shell ni concatenando texto** (`exec`, `` `cmd ${x}` ``). Usa `run(comando, [args])` de `src/lib/exec.ts`.
3. **Valida toda entrada** del modelo antes de usarla en rutas, comandos o URLs. Usa `zod` con `.describe()` en cada parámetro.
4. **Descripciones claras**: la `description` de cada herramienta dice qué hace y cuándo usarla; el modelo se basa en ella.
5. **Errores controlados**: devuelve `error("mensaje claro")`, no lances excepciones.
6. **Herramientas pequeñas y específicas** (4–10 por MCP). Mejor `crear_nota` y `buscar_notas` que una gigante `hacer_cosas`.
7. **Acciones destructivas** (borrar, enviar, sobrescribir, pagar) requieren un parámetro `confirmar: z.literal(true)`.
8. **Secretos** (claves de API) solo desde variables de entorno; nunca en el código ni en git.
9. Nombres de herramientas en `snake_case`, sin espacios ni tildes.
10. Declara `annotations` en cada herramienta: `{ readOnlyHint: true }` si solo lee; `{ readOnlyHint: false, destructiveHint: true }` si puede borrar o sobrescribir.
11. Tras cualquier cambio: `npm run build` y `npm test`.

## Al crear un MCP para una aplicación

Antes de programar, decide la vía de integración (de más a menos preferible): API/HTTP local → CLI de la app → archivos de datos → AppleScript/JXA (macOS) / PowerShell-COM (Windows) / D-Bus (Linux) → automatización de interfaz (último recurso). Explica la elección y propone la lista de herramientas antes de implementar. Detalles en `docs/04-mcp-para-una-app.md`.
