// Hook PreToolUse del planner: solo deja escribir dentro de specs/.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const entrada = JSON.parse(readFileSync(0, 'utf8'));
const raiz = process.env.CLAUDE_PROJECT_DIR ?? entrada.cwd;
const ruta = path.resolve(entrada.cwd ?? raiz, entrada.tool_input?.file_path ?? '');
const carpetaSpecs = path.join(raiz, 'specs') + path.sep;

if (!ruta.startsWith(carpetaSpecs)) {
  console.error(`El planner solo puede escribir dentro de specs/. Ruta bloqueada: ${ruta}`);
  process.exit(2);
}
