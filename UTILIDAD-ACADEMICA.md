# Utilidad académica

**En una frase:** este MCP convierte mi app de reels en un laboratorio para practicar **Marketing II (ECM321)**. La IA me deja revisar cada pieza de comunicación contra los conceptos del ramo, en vez de gastar el tiempo buscando archivos.

**Qué problema resuelve.** Director de Reels es la app que construí en el Certamen 2 de este ramo: arma el guion de un reel plano por plano y crea una foto por plano. Ya tiene **374 reels**, cada uno en su carpeta, y revisar uno significaba recorrer carpetas y abrir archivos a mano. Ese tiempo es operativo, no es aprendizaje.

**Para quién.** Para mí, estudiante de Ingeniería Comercial que cursa Marketing II, y para cualquier estudiante que produzca piezas de comunicación con una app propia y necesite revisarlas con criterio.

**En qué dimensión del aprendizaje aporta: aplicar la teoría de Marketing II sobre piezas reales.** Uso como marco el plan de marketing integrado (IMC, *Integrated Marketing Communications*) que entra en el Reading Test 4 del ramo:

| Concepto de Marketing II | Cómo lo practico con el MCP |
|---|---|
| **Core brand message** (paso 3 del plan IMC): voz, imagen y mensaje consistentes | `ver_reel` me trae el guion plano por plano y reviso si todos los planos cuentan lo mismo y si el producto se mantiene igual. Así, el 10-nov, mirando los storyboards, noté que el pez salía en la misma pose en todos los planos (bitácora, sección 6) |
| **Creative brief**: objetivo, público y mensaje clave | Cada reel guarda su objetivo (alcance, deseo o acción). Con `ver_reel`, la IA puede contrastar el guion con ese objetivo antes de producir el video |
| **Track and optimize** (paso 7): medir, A/B testing y costo por adquisición (CPA) | `listar_reels` muestra el costo de producción de cada pieza, y `gasto_modal` el gasto del mes. Ya tengo dos versiones del mismo producto (USD 1,47 y USD 1,18), que sirven como variantes A y B para probar cuál convierte mejor |

**Cómo lo voy a usar en Marketing II.** Esto es un plan, no algo ya hecho:

1. **En los trabajos de video del ramo:** armar el storyboard con el Director y revisarlo plano por plano con el MCP contra el creative brief, antes de grabar.
2. **Para estudiar:** seguir mi método de estudiar con mis propios proyectos como casos, usando reels reales para explicar IMC, posicionamiento y la P de promoción.
3. **Para el análisis:** comparar costo y objetivo entre versiones de un mismo reel antes de decidir cuál publicar.

En Marketing II el uso de IA requiere permiso del profesor, así que lo usaré solo en las actividades donde esté autorizado y lo declararé.

**Evidencia de que funciona (datos reales, no simulados).**

- `npm test` y `npm run probar-director` pasan: 6 herramientas y 9 llamadas OK contra la app encendida.
- En opencode, listar los reels y revisar el guion del pez óscar con su storyboard tomó 12 s cada uno, con datos reales. Está grabado en [docs/video/demo-opencode.mp4](docs/video/demo-opencode.mp4), y el detalle está en [DEMO.md](DEMO.md).
