import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const req = createRequire(import.meta.url);

// Ensure .env exists
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');
if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log('\x1b[33m[setup]\x1b[0m Created .env from .env.example');
}

const viteBin = path.join(path.dirname(req.resolve('vite/package.json')), 'bin/vite.js');

console.log('\x1b[35m[cmc]\x1b[0m Starting API and Web dev servers...');
console.log('\x1b[35m[cmc]\x1b[0m Press Ctrl+C to stop both servers.\n');

const env = { ...process.env, FORCE_COLOR: '1' };

const api = spawn(process.execPath, ['--watch', 'src/server.js'], {
  cwd: path.join(rootDir, 'services/api'),
  env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

const web = spawn(
  process.execPath,
  [viteBin, '--configLoader', 'runner', '--clearScreen', 'false', '--host', '127.0.0.1', '--port', '5173'],
  {
    cwd: path.join(rootDir, 'apps/web'),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  }
);

function pipeOutput(stream, prefix, colorCode, isError = false) {
  const rl = readline.createInterface({ input: stream });
  const label = `\x1b[${colorCode}m[${prefix}]\x1b[0m`;
  const out = isError ? console.error : console.log;
  rl.on('line', (line) => {
    out(`${label} ${line}`);
  });
}

pipeOutput(api.stdout, 'api', '32');
pipeOutput(api.stderr, 'api', '31', true);
pipeOutput(web.stdout, 'web', '36');
pipeOutput(web.stderr, 'web', '31', true);

let isShuttingDown = false;

function shutdown(exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n\x1b[35m[cmc]\x1b[0m Stopping dev servers...');

  const killChild = (child) => {
    if (child && !child.killed) {
      try {
        child.kill();
      } catch {
        // ignore
      }
    }
  };

  killChild(api);
  killChild(web);

  setTimeout(() => {
    process.exit(exitCode);
  }, 200).unref();
}

api.on('exit', (code) => {
  if (!isShuttingDown && code !== 0 && code !== null) {
    console.error(`\x1b[31m[api] Process exited unexpectedly with code ${code}\x1b[0m`);
    shutdown(code);
  }
});

web.on('exit', (code) => {
  if (!isShuttingDown && code !== 0 && code !== null) {
    console.error(`\x1b[31m[web] Process exited unexpectedly with code ${code}\x1b[0m`);
    shutdown(code);
  }
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('exit', () => shutdown(0));
