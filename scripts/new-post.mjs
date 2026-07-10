#!/usr/bin/env node
// scripts/new-post.mjs
// Crea un nuevo post MDX con frontmatter válido en 1 comando.
//
// Uso:
//   npm run new-post "Mi título del post"
//   npm run new-post -- --lang en "My post title"
//   npm run new-post -- --category gaming "Reseña de un juego"
//   npm run new-post -- --dry-run "Mi título"   # solo muestra qué haría

import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const VALID_LANGS = ['es', 'en'];
const VALID_CATEGORIES = ['tech', 'gaming', 'devlog'];

// 1. Parsear argumentos
const argv = process.argv.slice(2);
const opts = { lang: 'es', category: 'tech', dryRun: false };
const titleParts = [];

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--lang' && argv[i + 1]) {
    opts.lang = argv[++i];
  } else if (arg === '--category' && argv[i + 1]) {
    opts.category = argv[++i];
  } else if (arg === '--dry-run') {
    opts.dryRun = true;
  } else if (arg.startsWith('--')) {
    console.error(`⚠ Flag desconocida ignorada: ${arg}`);
  } else {
    titleParts.push(arg);
  }
}

const title = titleParts.join(' ').trim();

if (!title) {
  console.error('✖ Error: falta el título.');
  console.error('  Uso: npm run new-post "Tu título aquí"');
  process.exit(1);
}

if (!VALID_LANGS.includes(opts.lang)) {
  console.error(`✖ Idioma inválido: "${opts.lang}". Usa "es" o "en".`);
  process.exit(1);
}

if (!VALID_CATEGORIES.includes(opts.category)) {
  console.error(`✖ Categoría inválida: "${opts.category}". Opciones: ${VALID_CATEGORIES.join(', ')}`);
  process.exit(1);
}

// 2. Slug: minúsculas, sin acentos, kebab-case, max 60 chars
const slug = title
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')   // quitar diacríticos
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')      // solo letras, números, espacios y guiones
  .trim()
  .replace(/\s+/g, '-')              // espacios → guiones
  .replace(/-+/g, '-')               // colapsar guiones repetidos
  .replace(/^-+|-+$/g, '')           // trim guiones extremos
  .slice(0, 60);                     // límite de longitud

if (!slug) {
  console.error('✖ El título no produce un slug válido. Usa letras/números.');
  process.exit(1);
}

// 3. Fecha de hoy en formato YYYY-MM-DD
const today = new Date().toISOString().slice(0, 10);

// 4. Construir ruta y verificar que no exista
const dir = resolve(process.cwd(), 'src', 'content', 'posts', opts.lang);
const filePath = join(dir, `${slug}.mdx`);
const relPath = `src/content/posts/${opts.lang}/${slug}.mdx`;

if (existsSync(filePath)) {
  console.error(`✖ Ya existe: ${relPath}`);
  console.error('  Borra el archivo o usa otro título.');
  process.exit(1);
}

// 5. Plantilla del frontmatter (escapea comillas en el título por seguridad)
const safeTitle = title.replace(/"/g, '\\"');
const content = `---
title: "${safeTitle}"
description: ""
pubDate: ${today}
language: "${opts.lang}"
tags: []
category: "${opts.category}"
---

<!-- Escribe aquí el contenido del post. La intro va sin encabezado. -->

`;

if (opts.dryRun) {
  console.log(`(dry-run) Crearía: ${relPath}`);
  console.log('--- Contenido ---');
  console.log(content);
  process.exit(0);
}

// 6. Crear directorio (por si las moscas) y archivo
mkdirSync(dir, { recursive: true });
writeFileSync(filePath, content, 'utf8');

console.log(`✔ Post creado: ${relPath}`);
console.log(`  Título:    ${title}`);
console.log(`  Fecha:     ${today}`);
console.log(`  Idioma:    ${opts.lang}`);
console.log(`  Categoría: ${opts.category}`);
console.log('');
console.log('Siguiente paso: edita el archivo y rellena "description" + el cuerpo.');