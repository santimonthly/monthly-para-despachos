// Lectura y escritura de Excel en el navegador (SheetJS). No necesita servidor.
import * as XLSX from "xlsx";

/** Lee .xlsx, .xls o .csv. Usa la hoja «Contactos» si existe; si no, la primera. */
export async function leerFilas(file: File): Promise<unknown[][]> {
  const buf = new Uint8Array(await file.arrayBuffer());
  const wb = XLSX.read(buf, { type: "array" });
  const hoja = wb.SheetNames.includes("Contactos") ? "Contactos" : wb.SheetNames[0];
  return XLSX.utils.sheet_to_json(wb.Sheets[hoja], { header: 1, defval: "" }) as unknown[][];
}

export function descargarXlsx(nombre: string, hojas: [string, unknown[][]][]) {
  const wb = XLSX.utils.book_new();
  for (const [n, filas] of hojas) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(filas), n);
  XLSX.writeFile(wb, nombre);
}
