/**
 * HERRAMIENTAS PROPIAS: controlar el Director de Reels (la app del Certamen 2).
 *
 * El Director corre un servidor local en http://127.0.0.1:8895 con una API HTTP.
 * Esta es la via mas robusta para darle un MCP a una app (ver docs/04-mcp-para-una-app.md):
 * el MCP solo le habla a esa API o lee sus carpetas, y nunca cambia el codigo de la app.
 *
 * Ninguna herramienta gasta creditos. Crear fotos (Modal, ~USD 0,70 por reel) y crear
 * guiones (Gemini) quedan fuera a proposito: lo que cuesta plata no se le deja a un modelo.
 *
 * Variables opcionales:
 *   DIRECTOR_URL         -> otra direccion del servidor (por defecto http://127.0.0.1:8895)
 *   DIRECTOR_REELS_DIR   -> otra carpeta de reels (por defecto la del proyecto)
 */
import { readdir, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { error, json, texto } from "../lib/respuestas.js";

const URL_DIRECTOR = process.env.DIRECTOR_URL ?? "http://127.0.0.1:8895";
const DIR_REELS =
  process.env.DIRECTOR_REELS_DIR ??
  path.join(os.homedir(), "Desktop", "Proyectos", "Reels", "director-de-reels", "reels-creados");

// Mismo formato que valida el servidor del Director antes de tocar una carpeta.
const ID_VALIDO = /^[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{4}_[a-z0-9-]{1,40}$/;
const APAGADO = "El Director de Reels esta apagado: abre 'Director de Reels.app' y vuelve a intentarlo.";

type Respuesta = { ok: true; datos: any } | { ok: false; mensaje: string };

/** Llama a la API del Director y devuelve los datos o un mensaje claro (nunca lanza). */
async function pedir(ruta: string, cuerpo?: unknown, segundos = 15): Promise<Respuesta> {
  let res: Response;
  try {
    res = await fetch(`${URL_DIRECTOR}${ruta}`, {
      method: cuerpo === undefined ? "GET" : "POST",
      headers: cuerpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: AbortSignal.timeout(segundos * 1000),
    });
  } catch (e) {
    if ((e as Error)?.name === "TimeoutError") return { ok: false, mensaje: `El Director no respondio en ${segundos} s.` };
    return { ok: false, mensaje: APAGADO };
  }
  let datos: any = null;
  try {
    datos = await res.json();
  } catch {
    // respuesta sin JSON: se revisa abajo
  }
  // Si en esa direccion contesta otro programa (sin el JSON del Director), no se finge exito.
  if (typeof datos !== "object" || datos === null) {
    return { ok: false, mensaje: `En ${URL_DIRECTOR} no responde el Director (respuesta ${res.status} sin datos).` };
  }
  if (!res.ok) return { ok: false, mensaje: datos.error ?? `El Director respondio con error ${res.status}.` };
  return { ok: true, datos };
}

/** Minusculas y sin tildes: "Óscar" -> "oscar". (\p{M} son las marcas como la tilde.) */
function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").trim();
}

/** "Pez Óscar" -> ["pez", "oscar"]: las palabras en el mismo formato del ID de cada carpeta. */
function palabras(s: string): string[] {
  return normalizar(s).split(/[^a-z0-9]+/).filter(Boolean);
}

type ResumenReel = {
  id: string;
  titulo: string;
  creado: string;
  planos: number;
  fotosListas: number;
  costoUsd: number;
  storyboard: boolean;
};

/** Lee el meta.json de un reel. Devuelve null si la carpeta no tiene un reel valido. */
async function resumirReel(id: string): Promise<ResumenReel | null> {
  try {
    const meta = JSON.parse(await readFile(path.join(DIR_REELS, id, "meta.json"), "utf8"));
    const planos: any[] = Array.isArray(meta.planos) ? meta.planos : [];
    let storyboard = false;
    try {
      storyboard = (await stat(path.join(DIR_REELS, id, "storyboard", "storyboard.html"))).isFile();
    } catch {
      // sin storyboard
    }
    return {
      id,
      titulo: String(meta.titulo ?? id),
      creado: String(meta.creado ?? ""),
      planos: planos.length,
      fotosListas: planos.filter((p) => p?.actual).length,
      costoUsd: Number(meta.costoTotalUsd ?? 0),
      storyboard,
    };
  } catch {
    return null; // carpeta sin meta.json o con meta roto
  }
}

/**
 * IDs de los reels del mas nuevo al mas viejo que tienen TODAS las palabras buscadas.
 * Primero busca en el nombre de la carpeta (empieza con fecha y lleva el titulo) sin abrir
 * archivos: la carpeta esta en el Escritorio sincronizado con iCloud, y abrir cientos de
 * archivos que iCloud no tiene descargados tarda minutos. El nombre se corta a 40 letras,
 * asi que si no encuentra nada, recien ahi revisa el titulo completo de cada meta.json.
 */
async function idsDeReels(buscadas: string[]): Promise<string[]> {
  const ids = (await readdir(DIR_REELS)).filter((id) => ID_VALIDO.test(id)).sort().reverse();
  if (buscadas.length === 0) return ids;
  const porCarpeta = ids.filter((id) => buscadas.every((p) => id.includes(p)));
  if (porCarpeta.length > 0) return porCarpeta;
  const porTitulo: string[] = [];
  for (const id of ids) {
    const r = await resumirReel(id);
    if (r && buscadas.every((p) => normalizar(r.titulo).includes(p))) porTitulo.push(id);
  }
  return porTitulo;
}

type Elegido = { ok: true; id: string; otros: number } | { ok: false; mensaje: string };

/** Acepta el ID exacto o palabras del titulo ("pez oscar") y elige el reel mas reciente que calce. */
async function resolverReel(reel: string): Promise<Elegido> {
  const limpio = reel.trim();
  if (ID_VALIDO.test(limpio)) return { ok: true, id: limpio, otros: 0 };
  const buscadas = palabras(limpio);
  if (buscadas.length === 0) return { ok: false, mensaje: "Escribe letras o numeros del titulo del reel, o su ID." };
  let calzan: string[];
  try {
    calzan = await idsDeReels(buscadas);
  } catch {
    return { ok: false, mensaje: `No encuentro la carpeta de reels: ${DIR_REELS}` };
  }
  if (calzan.length === 0) {
    return { ok: false, mensaje: `No hay ningun reel que calce con "${limpio}". Usa listar_reels para ver los nombres.` };
  }
  // Si hay varios, se prefiere el mas reciente (de los 5 primeros) que ya tenga storyboard.
  let id = calzan[0];
  for (const candidato of calzan.slice(0, 5)) {
    if ((await resumirReel(candidato))?.storyboard) {
      id = candidato;
      break;
    }
  }
  return { ok: true, id, otros: calzan.length - 1 };
}

/** Aviso para el modelo cuando el nombre calzaba con varios reels y se eligio uno. */
function avisoOtros(e: { otros: number }): string {
  return e.otros > 0 ? `\n(Otros ${e.otros} reels calzan con ese nombre; para uno puntual usa su ID de listar_reels.)` : "";
}

/** Fecha guardada en UTC -> hora de Chile, ej. "30-10-2026, 16:38". */
function horaChile(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-CL", { timeZone: "America/Santiago", dateStyle: "short", timeStyle: "short" });
}

const PARAM_REEL = z
  .string()
  .min(1)
  .max(80)
  .describe("ID del reel (ej. 2026-10-30_1638_pez-oscar-albino-con-manchas-naranjas) o palabras de su titulo (ej. 'pez oscar')");

export function register(server: McpServer): void {
  server.registerTool(
    "estado_director",
    {
      title: "Estado del Director de Reels",
      description:
        "Revisa si la app Director de Reels esta abierta y lista: version, si tiene la clave de Gemini para escribir guiones, si el motor de fotos Qwen (Modal) esta disponible y si esta ocupada. Usala primero si otra herramienta dice que la app esta apagada.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const r = await pedir("/api/estado", undefined, 30);
      if (!r.ok) return error(r.mensaje);
      const d = r.datos;
      return json({
        abierta: true,
        version: d.version,
        claveGemini: Boolean(d.gemini?.clave),
        motorQwen: d.qwen?.disponible ? "disponible" : `no disponible (${d.qwen?.motivo || "sin motivo"})`,
        ocupada: Boolean(d.ocupado),
      });
    },
  );

  server.registerTool(
    "listar_reels",
    {
      title: "Listar reels",
      description:
        "Lista los reels creados con el Director de Reels, del mas nuevo al mas viejo: ID, titulo, fecha (hora de Chile), cantidad de planos, fotos listas, costo en USD y si tiene storyboard. Usala para ver que reels hay o para encontrar el ID exacto de uno. Se puede filtrar por palabras del titulo. Funciona aunque la app este cerrada.",
      inputSchema: {
        buscar: z.string().max(60).optional().describe("Palabras del titulo para filtrar, en cualquier orden, ej. 'oscar' o 'aros dorados'"),
        limite: z.number().int().min(1).max(50).default(10).describe("Cuantos reels mostrar como maximo"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ buscar, limite }) => {
      const buscadas = buscar ? palabras(buscar) : [];
      if (buscar && buscadas.length === 0) return error("Escribe letras o numeros del titulo para buscar.");
      let ids: string[];
      try {
        ids = await idsDeReels(buscadas);
      } catch {
        return error(`No encuentro la carpeta de reels: ${DIR_REELS}`);
      }
      const reels: ResumenReel[] = [];
      for (const id of ids) {
        if (reels.length >= limite) break;
        const r = await resumirReel(id);
        if (r) reels.push({ ...r, creado: horaChile(r.creado) });
      }
      if (reels.length === 0) return texto(buscar ? `No hay reels que calcen con "${buscar}".` : "Todavia no hay reels creados.");
      return json({ totalCarpetas: ids.length, mostrando: reels.length, reels });
    },
  );

  server.registerTool(
    "ver_reel",
    {
      title: "Ver los planos de un reel",
      description:
        "Muestra el guion de un reel plano por plano: tiempo, tipo de plano, movimiento, que se ve, la foto actual (con su link) y cuantos intentos tuvo. Usala cuando el usuario pregunte que tiene un reel o como es su guion. Acepta el ID o palabras del titulo.",
      inputSchema: { reel: PARAM_REEL },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ reel }) => {
      const e = await resolverReel(reel);
      if (!e.ok) return error(e.mensaje);
      const r = await pedir(`/api/fotos/reel?id=${encodeURIComponent(e.id)}`);
      if (!r.ok) return error(r.mensaje === APAGADO ? r.mensaje : `${r.mensaje} Usa listar_reels para ver los IDs.`);
      const d = r.datos;
      return json({
        id: e.id,
        titulo: d.titulo,
        objetivo: d.objetivo,
        costoUsd: d.costoTotalUsd,
        tieneStoryboard: Boolean(d.storyboard),
        otrosQueCalzan: e.otros,
        planos: (d.planos ?? []).map((p: any) => ({
          n: p.n,
          tiempo: p.tiempo,
          tipo: p.tipo,
          movimiento: p.movimiento,
          queSeVe: p.queSeVe,
          foto: p.url ? `${URL_DIRECTOR}${p.url}` : "sin foto todavia",
          intentos: Array.isArray(p.intentos) ? p.intentos.length : 0,
        })),
      });
    },
  );

  server.registerTool(
    "abrir_storyboard",
    {
      title: "Abrir el storyboard de un reel",
      description:
        "Abre en el navegador el storyboard de un reel: una foto por plano con su prompt de video, listo para copiar a Seedance u otra IA. Usala solo si el usuario pide verlo en pantalla. Acepta el ID o palabras del titulo.",
      inputSchema: { reel: PARAM_REEL },
      // Abre una ventana y el Director rehace storyboard.html (y sus copias de fotos) desde el meta.json.
      // No es destructiva: solo regenera archivos que salen de los datos del reel.
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ reel }) => {
      const e = await resolverReel(reel);
      if (!e.ok) return error(e.mensaje);
      const r = await pedir("/api/fotos/abrir-storyboard", { reelId: e.id });
      if (!r.ok) return error(r.mensaje);
      // El Director lanza "open" y no espera a confirmar que se abrio: por eso "le pedi".
      return texto(`Le pedi al Director abrir el storyboard del reel ${e.id} en el navegador.\nArchivo: ${r.datos.ruta}${avisoOtros(e)}`);
    },
  );

  server.registerTool(
    "abrir_carpeta_reel",
    {
      title: "Abrir la carpeta de un reel",
      description:
        "Abre en el Finder la carpeta de un reel, con sus fotos, el meta.json y el storyboard. Usala solo si el usuario pide ver los archivos. Acepta el ID o palabras del titulo.",
      inputSchema: { reel: PARAM_REEL },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ reel }) => {
      const e = await resolverReel(reel);
      if (!e.ok) return error(e.mensaje);
      const r = await pedir("/api/fotos/abrir-carpeta", { reelId: e.id });
      if (!r.ok) return error(r.mensaje);
      return texto(`Le pedi al Director abrir la carpeta del reel ${e.id} en el Finder.${avisoOtros(e)}`);
    },
  );

  server.registerTool(
    "gasto_modal",
    {
      title: "Gasto del mes en Modal",
      description:
        "Consulta cuanto se ha gastado este mes en Modal, el servicio que genera las fotos del Director. Usala cuando el usuario pregunte por costos o gasto. Solo lee, no gasta nada.",
      inputSchema: {},
      // La app consulta a Modal por internet (modal billing summary): por eso openWorldHint es true.
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async () => {
      const r = await pedir("/api/modal/gasto", undefined, 30);
      if (!r.ok) {
        if (r.mensaje === APAGADO) return error(r.mensaje);
        return error(`${r.mensaje} (puede que la sesion de Modal en este computador no este activa).`);
      }
      return json(r.datos);
    },
  );
}
