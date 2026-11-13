# Utilidad académica

**Qué problema resuelve.** Director de Reels es la app que construí en el Certamen 2 de este ramo para producir reels de marketing: arma el guion plano por plano y crea una foto por plano. Al usarla de verdad, el material creció rápido: hoy hay **374 reels** guardados en carpetas, cada uno con su `meta.json`, sus fotos y su storyboard. Para revisar uno tenía que recorrer carpetas en el Finder, encontrar la correcta por su fecha y abrir el storyboard o leer el JSON. Ese tiempo es operativo, no es aprendizaje.

**Para quién.** Para mí, estudiante de Ingeniería Comercial que aplica lo que aprende en marketing a emprendimientos reales, y para cualquier persona que produzca contenido con una app propia y necesite revisar y comparar lo que ya generó.

**En qué dimensión del aprendizaje aporta.**

1. **Revisión crítica del propio trabajo.** Pregunto *"¿qué movimiento tiene cada plano del reel del pez oscar?"* y la IA me trae el guion plano por plano y me abre el storyboard. El esfuerzo pasa de buscar archivos a juzgar si el guion funciona: si cada plano tiene una acción clara, si hay planos repetidos, si la historia cambia de estado. Ese tipo de revisión es la que, el 10-nov, me hizo notar mirando los storyboards que el pez salía en la misma pose en todos los planos y que tres planos eran muy parecidos. Eso llevó a corregir la app (detalle en la bitácora, sección 6).
2. **Decisiones con datos.** `listar_reels` muestra el costo de cada reel y `gasto_modal` el gasto del mes. Eso permite comparar costo contra resultado antes de seguir generando: por ejemplo, el último reel costó USD 1,18 y el anterior USD 1,47, y la pregunta pasa a ser si la mejora justifica el gasto.
3. **Continuidad del proyecto del ramo.** El MCP no es un ejercicio aparte: es la evolución de la herramienta del Certamen 2. Ahí la app producía el material; ahora ese material se puede consultar y revisar en lenguaje natural, que es lo que el ramo busca: usar la IA como herramienta de trabajo, no solo para generar contenido.

**Evidencia de que funciona (datos reales, no simulados).**

- `npm test` → `Prueba de humo superada.` y `npm run probar-director` → `Prueba del Director superada.`: 9 llamadas a las 6 herramientas, todas OK contra la app encendida.
- Desde opencode, el pedido *"¿Qué reels tengo? Muéstrame los 3 más recientes"* respondió en 12 s con los títulos reales. El pedido *"Abre el storyboard del pez oscar…"* usó `abrir_storyboard` y `ver_reel` y abrió el storyboard en 12 s.
- Listar los reels pasó de **2 min 35 s** (primera versión, que leía los 372 archivos que había el 10-nov desde iCloud) a **menos de 1 s** (versión actual, que busca por el nombre de la carpeta).

El detalle de cada prueba está en [BITACORA.md](BITACORA.md) y el caso completo en [DEMO.md](DEMO.md).
