/**
 * Prueba REAL de las herramientas del Director de Reels (no usa datos falsos).
 *
 *   npm run probar-director
 *
 * Arranca el MCP como lo haria opencode, llama las 6 herramientas y muestra lo que responden.
 * Con la app abierta deben salir datos reales; con la app cerrada, las que usan la API deben
 * decir "esta apagado" sin colgarse. Respeta DIRECTOR_URL y DIRECTOR_REELS_DIR.
 * abrir_storyboard y abrir_carpeta_reel se prueban con un ID que no existe, para que
 * respondan "no encontrado" sin abrir ninguna ventana.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "probar-director", version: "1.0.0" });
await client.connect(new StdioClientTransport({ command: "node", args: ["dist/index.js"], env: { ...process.env }, stderr: "ignore" }));

let fallas = 0;
async function llamar(nombre, args, esperoError = false) {
  const r = await client.callTool({ name: nombre, arguments: args });
  const ok = Boolean(r.isError) === esperoError;
  if (!ok) fallas++;
  console.log(`\n${ok ? "OK " : "MAL"} ${nombre} ${JSON.stringify(args)}${esperoError ? " (se espera error)" : ""}`);
  console.log(r.content[0].text.slice(0, 500));
}

await llamar("estado_director", {});
await llamar("listar_reels", { limite: 3 });
await llamar("listar_reels", { buscar: "oscar pez", limite: 2 });
await llamar("ver_reel", { reel: "pez oscar" });
await llamar("ver_reel", { reel: "unicornio volador" }, true);
await llamar("ver_reel", { reel: "???" }, true);
await llamar("gasto_modal", {});
const NO_EXISTE = "2000-01-01_0000_reel-que-no-existe";
await llamar("abrir_storyboard", { reel: NO_EXISTE }, true);
await llamar("abrir_carpeta_reel", { reel: NO_EXISTE }, true);
await client.close();

console.log(fallas === 0 ? "\nPrueba del Director superada." : `\n${fallas} prueba(s) fallaron (si dice "apagado", abre la app).`);
process.exit(fallas === 0 ? 0 : 1);
