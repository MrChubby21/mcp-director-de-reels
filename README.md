# MCP Director de Reels

Un servidor **MCP** (Model Context Protocol) que conecta una IA (opencode, Claude Desktop, Cursor…) con **Director de Reels**, la app que construí en el Certamen 2 del ramo *ChatGPT y Tecnologías de IAG para el Trabajo Académico* (UDD, CTR20233).

Director de Reels arma el guion de un reel plano por plano y crea una foto por plano. Con este MCP, en vez de buscar carpetas a mano, le pido a la IA en lenguaje natural: *"¿qué reels tengo?"*, *"ábreme el storyboard del pez oscar"* o *"¿cuánto llevo gastado este mes?"*.

Autor: Max Deik. Hecho a partir del [mcp-starter-kit](https://github.com/Maurichilean3d/mcp-starter-kit) del curso (rama `main`, licencia MIT).

| Documento | Qué tiene |
|---|---|
| [UTILIDAD-ACADEMICA.md](UTILIDAD-ACADEMICA.md) | Qué problema resuelve, para quién y en qué dimensión del aprendizaje aporta (1 página) |
| [DEMO.md](DEMO.md) | Caso real, antes y después, con lo que se pidió y lo que respondió |
| [DECLARACION-IA-Y-SEGURIDAD.md](DECLARACION-IA-Y-SEGURIDAD.md) | Uso de IA, límites conocidos y seguridad |
| [BITACORA.md](BITACORA.md) | Trazabilidad: cada paso con su comando, la salida real y los errores resueltos |

## Herramientas

| Herramienta | Qué hace | ¿Cambia algo? |
|---|---|---|
| `estado_director` | Revisa si la app está abierta, si tiene clave para guiones y si el motor de fotos está disponible | No, solo lee |
| `listar_reels` | Lista los reels del más nuevo al más viejo (título, fecha, planos, fotos, costo). Filtra por palabras del título | No, solo lee |
| `ver_reel` | Muestra el guion de un reel plano por plano: tiempo, tipo de plano, movimiento y foto actual | No, solo lee |
| `abrir_storyboard` | Abre en el navegador el storyboard del reel (una foto por plano) | Abre una ventana |
| `abrir_carpeta_reel` | Abre en el Finder la carpeta del reel | Abre una ventana |
| `gasto_modal` | Dice cuánto se ha gastado este mes en Modal, el servicio que genera las fotos | No, solo lee |

El kit trae además dos herramientas de ejemplo del profesor (`listar_aplicaciones` y `abrir_aplicacion`), que se dejaron tal cual.

**Lo que este MCP no hace a propósito:** crear guiones ni fotos. Esas acciones cuestan dinero (Gemini y Modal), y lo que cuesta dinero no se le deja decidir a un modelo.

## Cómo funciona

```
Tú  →  opencode (IA)  →  este MCP (stdio)  →  API local del Director (http://127.0.0.1:8895)
                                           →  carpeta reels-creados/ (solo lectura)
```

El MCP no hace clics ni toca el código de la app. Le habla a la API HTTP que la app ya tenía. Es la vía más robusta según la guía del kit: API, luego línea de comandos, luego archivos, luego AppleScript, y la interfaz al final.

## Requisitos

- **macOS** (las herramientas que abren ventanas usan el Finder y el navegador del Mac).
- **Node.js 20 o superior** y **npm**.
- **La app Director de Reels encendida** en el mismo computador (servidor en el puerto 8895). Sin la app, `listar_reels` igual funciona si existe la carpeta de reels, y las demás herramientas responden "el Director está apagado" sin colgarse.
- Un cliente MCP: [opencode](https://opencode.ai) (es el que se usó), Claude Desktop, Cursor u otro.

## Instalación paso a paso

1. Descarga el repositorio:
   ```bash
   git clone https://github.com/MrChubby21/mcp-director-de-reels.git
   cd mcp-director-de-reels
   ```
2. Instala y compila:
   ```bash
   npm install
   npm run build
   ```
3. Corre la prueba de humo del kit. Debe terminar con `Prueba de humo superada.`:
   ```bash
   npm test
   ```
4. Abre la app Director de Reels y corre la prueba real. Llama a las 6 herramientas contra la app encendida y debe terminar con `Prueba del Director superada.`:
   ```bash
   npm run probar-director
   ```
5. Abre opencode en esta carpeta. El archivo `opencode.json` ya registra el MCP con el nombre `director-de-reels`:
   ```bash
   opencode
   ```
   Si quieres usar el modelo gratis con el que se probó: `opencode -m opencode/big-pickle`.

### Configuración opcional

| Variable | Para qué | Valor por defecto |
|---|---|---|
| `DIRECTOR_URL` | Dirección del servidor del Director | `http://127.0.0.1:8895` |
| `DIRECTOR_REELS_DIR` | Carpeta donde el Director guarda los reels | `~/Desktop/Proyectos/Reels/director-de-reels/reels-creados` |

### Usarlo desde Claude Desktop u otro cliente

Agrega esto a la configuración MCP del cliente, con la ruta absoluta a tu carpeta:

```json
{
  "mcpServers": {
    "director-de-reels": {
      "command": "node",
      "args": ["/ruta/a/mcp-director-de-reels/dist/index.js"]
    }
  }
}
```

## Ejemplos de uso

| Le escribes a la IA | Herramientas que usa |
|---|---|
| ¿Qué reels tengo? Muéstrame los 3 más recientes | `listar_reels` |
| Abre el storyboard del pez oscar y dime qué movimiento tiene cada plano | `ver_reel` y `abrir_storyboard` |
| ¿Tengo algún reel de aros dorados? | `listar_reels` con `buscar` |
| ¿Cuánto llevo gastado este mes en fotos? | `gasto_modal` |
| ¿Está lista la app? | `estado_director` |

## Agregar una herramienta

```bash
npm run new-tool -- nombre_herramienta
```

Edita el archivo nuevo en `src/tools/`, corre `npm run build` y reinicia el cliente. El kit carga solo todos los archivos de `src/tools/`, menos los que empiezan con `_`.

## Créditos y licencia

- Base: [mcp-starter-kit](https://github.com/Maurichilean3d/mcp-starter-kit) del profesor Mauricio Reyes, licencia MIT. Su README original está en [docs/KIT-ORIGINAL-README.md](docs/KIT-ORIGINAL-README.md), y su documentación en `docs/`.
- Herramientas del Director, prueba real y documentación: Max Deik, con ayuda de IA (detalle en [DECLARACION-IA-Y-SEGURIDAD.md](DECLARACION-IA-Y-SEGURIDAD.md)).
- Licencia: MIT (ver [LICENSE](LICENSE)).
