import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import net from 'node:net';
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

console.log('\x1b[35m[rollover]\x1b[0m Starting API and Web dev servers...');
console.log();

const fileEnv = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    fileEnv[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim();
  }
}
const env = { ...fileEnv, ...process.env, FORCE_COLOR: '1' };

function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

const apiPortInUse = await isPortInUse(3001);
const webPortInUse = await isPortInUse(5173);

const api = apiPortInUse
  ? null
  : spawn(process.execPath, ['--watch', '--watch-path=src', '--watch-path=../../data/inventory.xlsx', 'src/server.js'], {
      cwd: path.join(rootDir, 'services/api'),
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

const web = webPortInUse
  ? null
  : spawn(
      process.execPath,
      [viteBin, '--configLoader', 'runner', '--clearScreen', 'false', '--host', '127.0.0.1', '--port', '5173'],
      {
        cwd: path.join(rootDir, 'apps/web'),
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );

if (apiPortInUse) console.log('\x1b[33m[api]\x1b[0m Port 3001 is already in use; leaving the existing API running.');
if (webPortInUse) console.log('\x1b[33m[web]\x1b[0m Port 5173 is already in use; leaving the existing frontend running.');
if (api || web) {
  console.log('\n\x1b[35m[rollover]\x1b[0m Press Ctrl+C to stop the services started by this command.');
} else {
  console.log('\n\x1b[35m[rollover]\x1b[0m Both services are already running; use their existing terminals to stop them.');
}

function pipeOutput(stream, prefix, colorCode, isError = false) {
  const rl = readline.createInterface({ input: stream });
  const label = `\x1b[${colorCode}m[${prefix}]\x1b[0m`;
  const out = isError ? console.error : console.log;
  rl.on('line', (line) => {
    out(`${label} ${line}`);
  });
}

if (api) {
  pipeOutput(api.stdout, 'api', '32');
  pipeOutput(api.stderr, 'api', '31', true);
}
if (web) {
  pipeOutput(web.stdout, 'web', '36');
  pipeOutput(web.stderr, 'web', '31', true);
}

let isShuttingDown = false;

function shutdown(exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('\n\x1b[35m[rollover]\x1b[0m Stopping dev servers...');

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

if (api) {
  api.on('exit', (code) => {
    if (!isShuttingDown && code !== 0 && code !== null) {
      console.error(`\x1b[31m[api] Process exited unexpectedly with code ${code}\x1b[0m`);
      shutdown(code);
    }
  });
}

if (web) {
  web.on('exit', (code) => {
    if (!isShuttingDown && code !== 0 && code !== null) {
      console.error(`\x1b[31m[web] Process exited unexpectedly with code ${code}\x1b[0m`);
      shutdown(code);
    }
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
if (api || web) process.on('exit', () => shutdown(0));
