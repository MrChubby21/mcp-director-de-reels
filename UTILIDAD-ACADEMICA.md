# Utilidad académica

**En una frase:** este MCP convierte mi app de reels en un laboratorio para practicar **Marketing II (ECM321)**: reviso cada pieza contra los conceptos del ramo en vez de buscar archivos.

**Qué problema resuelve y para quién.** Director de Reels es la app que construí en el Certamen 2 de este ramo: arma el guion de un reel plano por plano y crea una foto por plano. Ya tiene **374 reels**, y revisar uno significaba recorrer carpetas y abrir archivos a mano: tiempo operativo, no aprendizaje. Sirve para mí, estudiante de Ingeniería Comercial que cursa Marketing II, y para cualquier estudiante que produzca piezas de comunicación con una app propia.

**Dimensión del aprendizaje: aplicar la teoría de Marketing II sobre piezas reales.** Marco: el plan IMC (*Integrated Marketing Communications*) del Reading Test 4 del ramo.

| Concepto de Marketing II | Cómo lo practico con el MCP |
|---|---|
| **Core brand message** (paso 3 del plan IMC) | `ver_reel` trae el guion plano por plano para revisar si todos cuentan lo mismo y el producto se mantiene. Ejemplo real abajo |
| **Creative brief**: objetivo y mensaje clave | Cada reel guarda su objetivo (alcance, deseo o acción) y la IA contrasta el guion con él antes de producir el video |
| **Track and optimize** (paso 7): A/B testing y CPA | `listar_reels` da el costo de cada pieza y `gasto_modal` el del mes. Dos versiones del mismo pez (USD 1,47 y 1,18) sirven como variantes A y B |

**Revisión real hecha con el MCP (13-nov).** Le pedí a la IA revisar mi reel más reciente del pez óscar como en el paso 3 del plan IMC. Llamó a `listar_reels` y `ver_reel` (19 s) y respondió:
- **Objetivo:** "deseo", que el espectador quiera tener ese pez.
- **Coherencia:** los 5 planos mantienen el mismo producto y mensaje.
- **Plano más débil:** el 5, porque el pez queda quieto y el protagonismo pasa a las burbujas justo en el cierre, donde el deseo debería quedar más alto.

**Cómo lo voy a usar en Marketing II (plan, no algo ya hecho).**
1. En los trabajos de video del ramo (como el Classwork 4 de IMC, que fue un video grupal): revisar el storyboard plano por plano contra el creative brief antes de grabar.
2. Para estudiar: usar mis reels como casos de IMC, posicionamiento y la P de promoción.
3. Para analizar: comparar costo y objetivo entre versiones antes de publicar.

En Marketing II el uso de IA requiere permiso del profesor: lo usaré solo donde esté autorizado y lo declararé.

**Evidencia (datos reales, no simulados).** `npm test` y `npm run probar-director` pasan (6 herramientas, 9 llamadas OK). En el [video](docs/video/demo-opencode.mp4), listar los reels toma unos 5 s, y abrir el storyboard y revisar el guion unos 20 s. Detalle en [DEMO.md](DEMO.md).
