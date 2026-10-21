// Hook PreToolUse del reviewer: permite sin preguntar solo comandos de lectura y verificación.
// Cualquier otro comando (o uno encadenado con ; & | > etc.) pide confirmación al usuario.
import { readFileSync } from 'node:fs';

const entrada = JSON.parse(readFileSync(0, 'utf8'));
const comando = (entrada.tool_input?.command ?? '').trim();

const permitidos = [/^node --test\b/, /^git diff\b/, /^git status\b/, /^npm run build$/];
const encadenado = /[;&|`<>\n]|\$\(/.test(comando);
const permitido = !encadenado && permitidos.some((patron) => patron.test(comando));

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: permitido ? 'allow' : 'ask',
      permissionDecisionReason: permitido
        ? 'Comando de verificación permitido para el reviewer.'
        : 'El reviewer solo ejecuta sin preguntar node --test, git diff, git status y npm run build.',
    },
  }),
);
