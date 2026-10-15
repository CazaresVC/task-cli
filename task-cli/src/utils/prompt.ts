import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { CliError } from './error-handler.js';

export async function confirmAction(
  message: string,
  isTty: boolean = Boolean(input.isTTY)
): Promise<boolean> {
  if (!isTty) {
    throw new CliError('Terminal no interactiva detectada. Usa la opción --force para confirmar la eliminación.');
  }

  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(message);
    const trimmed = answer.trim().toLowerCase();
    return trimmed === 's' || trimmed === 'y';
  } finally {
    rl.close();
  }
}
