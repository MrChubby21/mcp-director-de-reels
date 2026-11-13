/**
 * Prueba REAL del MCP SIN la app Director de Reels (para quien corrige el proyecto).
 *
 *   npm run probar-ejemplo
 *
 * Usa los 2 reels reales de ejemplo/reels-creados y apunta la API a un puerto vacio,
 * como si la app estuviera cerrada. Comprueba que:
 *   - las 6 herramientas existen;
 *   - listar_reels lee los reels reales de la carpeta de ejemplo;
 *   - las herramientas que necesitan la app responden "esta apagado" rapido, sin colgarse;
 *   - las entradas malas se rechazan.
 * Funciona en cualquier computador con Node 18+ (Mac, Windows o Linux) y no abre ventanas.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = {
  ...process.env,
  DIRECTOR_REELS_DIR: path.join(raiz, "ejemplo", "reels-creados"),
  DIRECTOR_URL: "http://127.0.0.1:9", // puerto sin nada: simula la app cerrada
};

const client = new Client({ name: "probar-ejemplo", version: "1.0.0" });
await client.connect(
  new StdioClientTransport({ command: process.execPath, args: [path.join(raiz, "dist", "index.js")], env, stderr: "ignore" }),
);

let fallas = 0;
function revisar(ok, texto) {
  if (!ok) fallas++;
  console.log(`${ok ? "OK " : "MAL"} ${texto}`);
}

const { tools } = await client.listTools();
const nombres = tools.map((t) => t.name).sort();
const esperadas = ["abrir_carpeta_reel", "abrir_storyboard", "estado_director", "gasto_modal", "listar_reels", "ver_reel"];
revisar(JSON.stringify(nombres) === JSON.stringify(esperadas), `6 herramientas: ${nombres.join(", ")}`);

async function llamar(nombre, args) {
  const t0 = Date.now();
  const r = await client.callTool({ name: nombre, arguments: args });
  return { error: Boolean(r.isError), texto: r.content?.[0]?.text ?? "", ms: Date.now() - t0 };
}

const lista = await llamar("listar_reels", { limite: 5 });
let reels = [];
try { reels = JSON.parse(lista.texto).reels ?? []; } catch { /* queda vacio */ }
revisar(!lista.error && reels.length === 2, `listar_reels lee los 2 reels de ejemplo: ${reels.map((r) => `${r.titulo} (USD ${r.costoUsd})`).join(" | ")}`);

const filtro = await llamar("listar_reels", { buscar: "se mueve" });
let filtrados = [];
try { filtrados = JSON.parse(filtro.texto).reels ?? []; } catch { /* queda vacio */ }
revisar(filtrados.length === 1, `listar_reels filtra por palabras ("se mueve" -> ${filtrados.length} reel)`);

for (const [nombre, args] of [
  ["estado_director", {}],
  ["ver_reel", { reel: "pez oscar" }],
  ["gasto_modal", {}],
  ["abrir_storyboard", { reel: "pez oscar" }],
  ["abrir_carpeta_reel", { reel: "pez oscar" }],
]) {
  const r = await llamar(nombre, args);
  revisar(r.error && /apagado/i.test(r.texto) && r.ms < 20000, `${nombre}: sin la app responde "apagado" en ${r.ms} ms, sin colgarse`);
}

const malo = await llamar("ver_reel", { reel: "???" });
revisar(malo.error, `ver_reel rechaza una entrada sin letras ("???")`);

await client.close();
console.log(fallas === 0 ? "\nPrueba sin la app superada." : `\n${fallas} prueba(s) fallaron.`);
process.exit(fallas === 0 ? 0 : 1);
