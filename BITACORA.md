# Bitácora — MCP del Director de Reels (CTR20233)

Max Deik · ChatGPT y Tecnologías de IAG para el trabajo académico · revisión viernes 13-nov-2026.
Cada paso con su comando y la salida real que se obtuvo. Hecho con Claude Code como asistente.
Las rutas `~/mcp-starter-kit` corresponden a la carpeta de trabajo; este repositorio es la versión publicada para el examen (sección 6).

## 1. Kit `main` instalado y verificado (30-oct y 10-nov-2026)
- Kit bajado de `github.com/Maurichilean3d/mcp-starter-kit` (rama `main`) a `~/mcp-starter-kit`.
- 10-nov: actualizado a la versión del 5-nov, porque el anuncio del 6-nov dice que la descarga anterior ya no sirve.
- `npm install && npm run build && npm test` → `Prueba de humo superada.`
- opencode 1.19.5 instalado; `opencode mcp list` → `✓ connected`.

## 2. Herramientas propias: el MCP `director-de-reels` (10-nov-2026)
**Decisión: conectar el MCP a la API HTTP local que ya tiene mi app (puerto 8895).** Es la vía más robusta según `docs/04` (API → CLI → archivos → AppleScript → interfaz). El MCP solo le habla a la API o lee carpetas, y nunca cambia el código de la app.
- Archivo nuevo: `src/tools/director_reels.ts`. Tiene 6 herramientas: `estado_director`, `listar_reels`, `ver_reel`, `abrir_storyboard`, `abrir_carpeta_reel` y `gasto_modal`.
- **Decisión: dejar fuera crear fotos y crear guiones**, porque gastan dinero (Modal y Gemini). Lo que cuesta plata no se le deja a un modelo.
- `src/tools/ejemplo.ts` pasó a llamarse `_ejemplo.ts`, porque el cargador ignora los archivos que empiezan con `_`. Se dejó `aplicaciones.ts` del profesor.
- `SERVER_NAME` = `director-de-reels`, y `opencode.json` registra el MCP con ese mismo nombre.
- `npm test` → `OK: 8 herramientas -> listar_aplicaciones, abrir_aplicacion, estado_director, listar_reels, ver_reel, abrir_storyboard, abrir_carpeta_reel, gasto_modal` · `Prueba de humo superada.`

### Problemas reales encontrados y cómo se resolvieron
1. **`listar_reels` se colgaba (más de 60 s).** La carpeta de reels está en el Escritorio sincronizado con iCloud, y leer los 372 `meta.json` tardó 2 min 35 s porque iCloud no los tenía descargados.
   **Solución:** buscar primero por el nombre de la carpeta, que ya trae la fecha y el título, y abrir solo los `meta.json` que se muestran. Ahora responde en menos de 1 s.
2. **`abrir_storyboard` respondía "ok", pero Chrome no abría nada.** La app llevaba prendida desde el 30-oct, y el `open` de ese proceso viejo fallaba (`No application knows how to open URL… (-10661)` en `_trabajo/servidor.log`).
   **Solución:** reiniciar la app. Con la app recién abierta, el storyboard sí se abre. Por eso el MCP ahora dice "le pedí al Director abrir…": el servidor no confirma que la ventana se abrió.

### Revisión independiente (otro agente, con pruebas reales)
Encontró 7 problemas. Todos quedaron corregidos en el código:
1. Un texto sin letras, como `???`, calzaba con todos los reels. Ahora da error.
2. `abrir_carpeta_reel` estaba marcada como "solo lectura", pero abre una ventana. Se cambió.
3. La búsqueda exigía el orden exacto de las palabras y no veía los títulos cortados a 40 letras. Ahora busca palabra por palabra y, si no encuentra nada, revisa el título completo.
4. La hora salía en UTC. Ahora sale en hora de Chile.
5. Si en ese puerto contestaba otro programa, se fingía éxito. Ahora da error.
6. El mensaje de "abrí" no estaba confirmado. Ahora dice "le pedí".
7. Las descripciones no decían *cuándo* usar cada herramienta. Ahora lo dicen.

### Pruebas reales (con la app abierta)
- `npm run probar-director` (prueba propia, `scripts/probar-director.mjs`) → 6/6 llamadas OK · `Prueba del Director superada.` (Ese día la prueba llamaba a 3 herramientas; desde el 13-nov llama a las 6, ver sección 6.)
- Con la app cerrada (`DIRECTOR_URL=…:8899`): las herramientas responden "está apagado" en unos 15 ms, sin colgarse. `listar_reels` sigue funcionando porque lee el disco.
- **Desde opencode, en lenguaje natural** (modelo gratis `big-pickle`):
  - Pedido: *"¿Qué reels tengo? Muéstrame los 3 más recientes"*. Llamó a `director-de-reels_listar_reels {"limite":3}` y respondió en 12 s con los títulos reales.
  - Pedido: *"Abre el storyboard del pez oscar albino…"*. Llamó a `ver_reel` y después a `abrir_storyboard`; se abrió en Chrome y contestó el movimiento de cada plano.

## 3. Rama `pro-rea` y REA (10-nov-2026)
- Instalada aparte en `~/mcp-starter-kit-rea` (versión `2.3.0-rea.1`) para no pisar el MCP de la rama `main`. `npm test` → `Prueba de humo superada.`
- **REA 6.8.0 exige Node ≥ 22.23.4** (`npm view rea-agents@6.8.0 engines`), y el equipo tenía Node 20. Se instaló Node 22.23.4 con nvm solo para pro-rea. Node 20 sigue siendo el predeterminado.
- **Bug encontrado en el kit (Mac/Linux):** el Constructor lanza opencode con `cwd` = la carpeta `analisis/`, pero hereda la variable `PWD` de la terminal. opencode toma su carpeta de trabajo desde `PWD`, así que trabajaba en `~/mcp-starter-kit-rea`: no encontraba `ENCARGO.md` y no cargaba el `opencode.json` con REA ni con `external_directory: deny`.
  - **Prueba:** carpeta con `MARCA.md`. Con `PWD` viejo → "NO ENCONTRADO"; con `env -u PWD` → leyó la palabra.
  - **Solución sin tocar el código del kit:** abrir el Constructor con `env -u PWD node constructor/servidor.mjs`.
  - **Arreglo sugerido para el kit:** en `trabajo.mjs`, `ejecutar()`, pasar `env: { ...process.env, PWD: cwd }`.
- Tarjeta "Estudiar y portar una app" sobre `~/Desktop/Proyectos/Reels/director-de-reels/servidor` (código propio). Base declarada: **"Es mi propia aplicación / tengo su código fuente"**. Destino: "una función dentro de mi propio proyecto".
- El resultado está en la sección 4.

### Herramientas propias también en la rama `pro-rea`
El profesor pide "probar ahora el branch pro-rea y crear herramientas personalizadas en su propio MCP". Se copiaron `director_reels.ts` y `probar-director.mjs` a `~/mcp-starter-kit-rea`, con el mismo `SERVER_NAME` y `opencode.json`.
- `npm test` → 8 herramientas · `Prueba de humo superada.`
- `npm run probar-director` → `Prueba del Director superada.`
- opencode (pro-rea), pedido *"¿Qué reels tengo del pez oscar?"* → llamó a `director-de-reels_listar_reels {"buscar":"pez oscar"}` y respondió en 12 s.
- Gotcha: la app está programada para apagarse cuando se cierra su última ventana (`applicationShouldTerminateAfterLastWindowClosed` → YES). Si se cierra la ventana, el MCP responde "está apagado". Hay que minimizarla, no cerrarla.

## 4. Resultado de REA (10-nov-2026)
El Constructor terminó todas sus etapas (`preparar → analizar → revisar → implementar → resumen`: todas `ok`). Carpeta: `~/mcp-creados/porte-director-de-reels/`.
- `AUTORIZACION.md` e `INFORME-LEGAL.md`: base declarada y procedimiento de sala limpia.
- `analisis/ESPECIFICACION.md` (31 KB): describe en prosa propia la carpeta `reels-creados`, el esquema de `meta.json` y las rutas `/api/fotos/*`, citando archivo y línea.
  - La revisión mecánica la rechazó una vez porque tenía 3 bloques de código de más de 12 líneas. El agente la reescribió y la segunda vez pasó.
- **Lo que no funcionó, dicho tal cual:** REA identificó el objetivo (servidor TypeScript/Deno), pero su analizador profundo (`rea_analyze_javascript_application`) no arrancó en este Mac.
  - Error: `redefinition of module 'SwiftBridging'`, un problema de las herramientas de línea de comandos de macOS, no de la app.
  - Por eso el agente terminó la especificación leyendo el código fuente en modo solo lectura, y lo dejó escrito en la sección "Cómo se obtuvo".
- `implementacion/`: el segundo agente, que solo vio la especificación, escribió **"Vitrina"**, una versión propia en Node/TypeScript sin dependencias de ejecución. Incluye una función `listarReels()`, una línea de comandos y una página web local.
  - `npm run probar` → **51 pruebas, 51 pasan**.
  - Probado con mis reels reales: `node dist/src/cli.js listar --dir …/reels-creados` lista los 372 reels en 0,1 s, y `ver <id>` muestra planos y elementos.
  - Arreglo hecho a mano: su `package.json` pedía `@types/node@^25.10.1`, una versión que no existe, y por eso `npm install` fallaba en limpio. Se cambió a `^26.6.6` y ahora instala y pasa las 51 pruebas.

## 5. Conectar la IA: NVIDIA (paso 3 del profesor, 10-nov-2026)
- `npm run configurar-ia -- --proveedor=nvidia` (doble clic en `Conectar IA.command`): Max pegó su clave → `✔ Clave valida`; `opencode auth list` → `Nvidia api · 1 credentials`.
- El modelo sugerido `moonshotai/kimi-k2.6` respondió `UnknownError` (no está en el catálogo actual de NVIDIA). `openai/gpt-oss-20b` sí responde.
- **Problema real: el plan gratis de NVIDIA estuvo muy lento hoy con el MCP**: `deepseek-v4.1-flash` tardó **467 s** en listar 3 reels, y `glm-5.3-flash` y `gpt-oss-20b` pasaron los 400 s. NVIDIA no publica su límite; en sus foros explican que depende del tráfico del momento.
- **Decisión: NVIDIA queda conectado y elegible con `/models`, pero la demo usa `opencode/big-pickle`** (gratis): listó 3 reels en **5 s**. `Abrir demo.command` abre `opencode -m opencode/big-pickle`.
  - Se verificó la interfaz: `Build · Big Pickle` · `1 MCP`.

## 6. Publicación para el examen (13-nov-2026)
- El anuncio del examen (13-nov) pide un repositorio público con README, demostración de antes y después, utilidad académica y declaración de uso de IA.
- Repositorio nuevo, armado desde el kit del profesor (rama `main`), con su historial original y mis cambios en commits aparte.
- `npm install && npm run build && npm test` → `OK: 8 herramientas …` · `Prueba de humo superada.`
- Con la app encendida, `npm run probar-director` → `Prueba del Director superada.`
- opencode (`big-pickle`), en la carpeta del repositorio:
  - *"¿Qué reels tengo? Muéstrame los 3 más recientes"* → `listar_reels {"limite":3}`, 12 s, 374 reels;
  - *"Abre el storyboard del pez oscar y dime qué movimiento tiene cada plano"* → `abrir_storyboard` y `ver_reel`, 12 s.
  - Salidas completas en `DEMO.md`.
- Búsqueda de claves y datos personales en los archivos del repositorio antes de publicar: 0 resultados.
- Revisión independiente del repositorio (otro agente, con pruebas reales). Encontró 9 problemas, todos corregidos:
  1. `probar-director` no le pasaba `DIRECTOR_URL` ni `DIRECTOR_REELS_DIR` al MCP, así que la prueba "con la app cerrada" no se podía repetir. Ahora pasa el entorno: con `DIRECTOR_URL=http://127.0.0.1:8899` las herramientas responden "esta apagado" y `listar_reels` sigue leyendo el disco.
  2. La prueba llamaba solo a 3 herramientas. Ahora hace 9 llamadas a las 6 (las dos de abrir, con un ID que no existe, para no abrir ventanas).
  3. Los tiempos no coincidían entre documentos: quedaron los de esta sección.
  4. El README no explicaba qué hacer sin la app. Se agregó una sección para ese caso y cómo instalar opencode.
  5. No se declaraba que `abrir_storyboard` hace que la app rehaga `storyboard.html`. Quedó en el README y en la declaración.
  6. `gasto_modal` decía no salir a internet, pero la app le consulta a Modal. Ahora tiene `openWorldHint: true`.
  7. La versión de Node no coincidía entre el README y `package.json`.
  8. `package.json` tenía datos del kit; ahora es `mcp-director-de-reels` 1.0.0.
  9. A la utilidad académica le faltaba respaldo para un ejemplo; está abajo.
- Respaldo del ejemplo de la utilidad académica: el 10-nov, revisando los storyboards del pez óscar, noté que el pez salía en la misma pose en todos los planos y que tres planos eran muy parecidos. Se corrigió en la app: cada plano con pose y ángulo distintos. El reel `2026-11-10_1706_pez-oscar-cobre-angulos-distintos` es el resultado, y es el que aparece en `DEMO.md`.

- Corrección contra la pauta del profesor (otro agente, Fable, con el repositorio ya publicado): nota estimada 4,3 de 5. Cambios hechos:
  - Carpeta `ejemplo/reels-creados/` con 2 reels reales (`meta.json` y storyboard, fotos achicadas a 640 px, sin las fotos de referencia), para que otra persona vea datos sin tener la app. Prueba: `DIRECTOR_URL=http://127.0.0.1:8899 DIRECTOR_REELS_DIR=./ejemplo/reels-creados` → `listar_reels` devuelve los 2 reels con título, planos, fotos y costo.
  - Herramientas de ejemplo del kit desactivadas (`src/tools/_aplicaciones.ts`), porque podían abrir cualquier app. `npm test` → `OK: 6 herramientas -> estado_director, listar_reels, ver_reel, abrir_storyboard, abrir_carpeta_reel, gasto_modal` · `Prueba de humo superada.`
  - README con la sección de archivos heredados del kit; aclaraciones en la demo, la utilidad académica y la declaración.
- Video de la demostración (`docs/video/demo-opencode.mp4`, 35 s) y captura (`docs/img/demo-opencode.png`), grabados con `screencapture -v` de la ventana de Terminal y recortados con ffmpeg. Hubo tres tomas:
  - En la primera, la ventana del navegador tapó la respuesta; se agregó traer la Terminal al frente al terminar.
  - En la segunda, con el pedido corto, el modelo preguntó cuál de los 4 reels del pez abrir. Quedó declarado como límite.
  - La tercera, con *"el reel más reciente del pez oscar"*, llamó a `listar_reels`, `ver_reel` y `abrir_storyboard` y respondió los 5 movimientos.
- Utilidad académica reescrita y amarrada a **Marketing II (ECM321)**, por decisión del estudiante: el MCP se va a usar en ese ramo. Usa conceptos del Reading Test 4 del ramo: plan IMC (pasos 3 y 7), creative brief, A/B testing y CPA. El uso futuro quedó marcado como plan y no como algo ya hecho, con la regla del ramo de que la IA requiere permiso del profesor. Se comprobó imprimiéndola a PDF: cabe en 1 página.
- Segunda corrección de Fable: 4,75 de 5. Cambios hechos:
  - **Revisión real con el MCP para Marketing II.** Pedido: revisar el reel más reciente del pez óscar como en el paso 3 del plan IMC (objetivo, coherencia, plano más débil).
    - Primera vez, sin restricciones: la IA llamó a `listar_reels` y `ver_reel`, pero además usó comandos de terminal de opencode (`ls`, `find`, `python3`) para leer archivos por su cuenta (145 s).
    - Se agregó `"permission": {"edit": "deny", "bash": "deny", "webfetch": "deny"}` a `opencode.json`.
    - Segunda vez: solo `listar_reels`, `estado_director` y `ver_reel`, en 19 s.
    - Las dos veces concluyó lo mismo: objetivo "deseo", los 5 planos son coherentes y el plano 5 es el más débil (el pez está quieto y el foco pasa a las burbujas).
  - Tiempos y llamadas del video calzados con DEMO y la utilidad académica. El README aclara qué responde opencode con la carpeta de ejemplo. La declaración menciona el nombre de usuario visible en el video.
- Preparado para que lo corrija un agente: `npm run probar-ejemplo` (`scripts/probar-ejemplo.mjs`) prueba el MCP sin la app, con los 2 reels de `ejemplo/` y la API apuntando a un puerto vacío. Resultado: 9 líneas OK, `Prueba sin la app superada.`. El README tiene arriba "Para quien corrige" (3 comandos y en qué archivo está cada criterio), y `AGENTS.md` tiene al inicio las instrucciones para un agente evaluador.
