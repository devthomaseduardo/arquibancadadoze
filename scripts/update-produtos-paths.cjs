#!/usr/bin/env node
/**
 * Atualiza src/data/produtos-public-paths.ts a partir da pasta Produtos.
 * Escaneia src/public/Produtos ou public/Produtos e gera o objeto por pasta.
 * Uso: node scripts/update-produtos-paths.cjs
 */

const fs = require("fs");
const path = require("path");

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif|svg)$/i;
const PRODUTOS_NAMES = ["Produtos", "produtos"];

function findProdutosDir(cwd) {
  const candidates = [
    path.join(cwd, "src", "public", "Produtos"),
    path.join(cwd, "src", "public", "produtos"),
    path.join(cwd, "public", "Produtos"),
    path.join(cwd, "public", "produtos"),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
  }
  return null;
}

function walkDir(dir, baseDir, list) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.relative(baseDir, full).replace(/\\/g, "/");
    if (e.isDirectory()) {
      walkDir(full, baseDir, list);
    } else if (e.isFile() && IMAGE_EXT.test(e.name)) {
      list.push(rel);
    }
  }
}

function groupByFolder(paths) {
  const byFolder = {};
  for (const p of paths) {
    const idx = p.lastIndexOf("/");
    const folder = idx >= 0 ? p.slice(0, idx) : "";
    const file = idx >= 0 ? p : p;
    if (!byFolder[folder]) byFolder[folder] = [];
    byFolder[folder].push(p);
  }
  for (const k of Object.keys(byFolder)) {
    byFolder[k].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }
  return byFolder;
}

function escapeKey(key) {
  return key.includes('"') ? `'${key.replace(/'/g, "\\'")}'` : `"${key}"`;
}

function generateTs(byFolder) {
  const keys = Object.keys(byFolder).filter(Boolean).sort((a, b) => a.localeCompare(b, "pt-BR"));
  const lines = [
    "// Gerado por scripts/update-produtos-paths.cjs — paths relativos (URL encode na hora de montar)",
    "export const produtosPublicPathsByFolder: Record<string, string[]> = {",
  ];
  for (const folder of keys) {
    const paths = byFolder[folder];
    const keyStr = escapeKey(folder);
    lines.push(`  ${keyStr}: [`);
    for (const p of paths) {
      lines.push(`    ${JSON.stringify(p)},`);
    }
    lines.push("  ],");
  }
  lines.push("};");
  lines.push("");
  lines.push("export function buildProdutoImageUrl(relativePath: string): string {");
  lines.push('  return "/Produtos/" + relativePath.split("/").map(encodeURIComponent).join("/");');
  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

function main() {
  const cwd = process.cwd();
  const produtosDir = findProdutosDir(cwd);
  if (!produtosDir) {
    console.error("Nenhuma pasta Produtos encontrada. Procure em: src/public/Produtos ou public/Produtos");
    process.exit(1);
  }
  console.log("Escaneando:", produtosDir);
  const list = [];
  walkDir(produtosDir, produtosDir, list);
  const byFolder = groupByFolder(list);
  const outPath = path.join(cwd, "src", "data", "produtos-public-paths.ts");
  const ts = generateTs(byFolder);
  fs.writeFileSync(outPath, ts, "utf8");
  const total = list.length;
  const folders = Object.keys(byFolder).filter(Boolean).length;
  console.log("Atualizado:", outPath);
  console.log("Pastas:", folders, "| Arquivos:", total);
}

main();
