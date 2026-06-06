/**
 * Run the game and capture logs to debug/latest.log
 */

import { spawn } from 'child_process';
import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const platform = process.platform;

// Game executable paths by platform
const GAME_PATHS: Record<string, string[]> = {
  darwin: [
    '/Applications/Subway Builder.app/Contents/MacOS/Subway Builder',
    `${process.env.HOME}/Applications/Subway Builder.app/Contents/MacOS/Subway Builder`,
  ],
  win32: [
    `${process.env.LOCALAPPDATA}\\Programs\\subway-builder\\Subway Builder.exe`,
    `${process.env.PROGRAMFILES}\\Subway Builder\\Subway Builder.exe`,
    `${process.env['PROGRAMFILES(X86)']}\\Subway Builder\\Subway Builder.exe`,
  ],
  linux: [
    `${process.env.HOME}/Applications/Subway Builder.AppImage`,
    `${process.env.HOME}/.local/bin/Subway Builder.AppImage`,
    '/usr/local/bin/Subway Builder.AppImage',
  ],
};

function findGameExecutable(): string | null {
  const paths = GAME_PATHS[platform] || [];
  for (const path of paths) {
    if (existsSync(path)) {
      return path;
    }
  }
  return null;
}

function run() {
  const gamePath = findGameExecutable();

  if (!gamePath) {
    console.error(`Could not find Subway Builder installation.`);
    console.error(`Searched paths:`);
    (GAME_PATHS[platform] || []).forEach(p => console.error(`  - ${p}`));
    console.error(`\nPlease set SUBWAY_BUILDER_PATH environment variable to the game executable.`);
    process.exit(1);
  }

  // Create debug directory
  const debugDir = join(process.cwd(), 'debug');
  if (!existsSync(debugDir)) {
    mkdirSync(debugDir, { recursive: true });
  }

  const logPath = join(debugDir, 'latest.log');
  const logStream = createWriteStream(logPath);

  console.log(`Starting Subway Builder...`);
  console.log(`Executable: ${gamePath}`);
  console.log(`Logs: ${logPath}`);
  console.log('');

  const child = spawn(gamePath, [], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: {
      ...process.env,
      ELECTRON_ENABLE_LOGGING: '1',
    },
  });

  const timestamp = () => new Date().toISOString();

  child.stdout?.on('data', (data) => {
    const lines = data.toString();
    process.stdout.write(lines);
    logStream.write(`[${timestamp()}] [stdout] ${lines}`);
  });

  child.stderr?.on('data', (data) => {
    const lines = data.toString();
    process.stderr.write(lines);
    logStream.write(`[${timestamp()}] [stderr] ${lines}`);
  });

  child.on('close', (code) => {
    logStream.write(`[${timestamp()}] Process exited with code ${code}\n`);
    logStream.end();
    console.log(`\nGame exited with code ${code}`);
    console.log(`Logs saved to: ${logPath}`);
  });

  child.on('error', (err) => {
    console.error(`Failed to start game: ${err.message}`);
    logStream.end();
    process.exit(1);
  });
}

run();
