export class CliError extends Error {
  public readonly exitCode: number;

  constructor(message: string, exitCode = 1) {
    super(message);
    this.name = 'CliError';
    this.exitCode = exitCode;
  }
}

export function handleError(error: unknown): void {
  if (error instanceof CliError) {
    const message = error.message.startsWith('Error: ')
      ? error.message
      : `Error: ${error.message}`;
    console.error(message);
    process.exit(error.exitCode);
  }

  if (error instanceof Error) {
    const message = error.message.startsWith('Error: ')
      ? error.message
      : `Error: ${error.message}`;
    console.error(message);
    process.exit(1);
  }

  console.error(`Error: ${String(error)}`);
  process.exit(1);
}
