/**
 * Create a symlink from dist/ to the game's mods folder
 */

import { existsSync, mkdirSync, symlinkSync, unlinkSync, lstatSync, readFileSync } from 'fs';
import { join, basename } from 'path';

const platform = process.platform;

// Mods folder paths by platform
const MODS_PATHS: Record<string, string> = {
  darwin: `${process.env.HOME}/Library/Application Support/metro-maker4/mods`,
  win32: `${process.env.APPDATA}\\metro-maker4\\mods`,
  linux: `${process.env.HOME}/.config/metro-maker4/mods`,
};

function getModId(): string {
  const manifestPath = join(process.cwd(), 'manifest.json');
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      // Use the last part of the mod ID as the folder name
      // e.g., "com.author.mymod" -> "mymod"
      const parts = manifest.id?.split('.') || [];
      return parts[parts.length - 1] || 'my-mod';
    } catch {
      // Fall back to default
    }
  }
  return 'my-mod';
}

function link() {
  const modsPath = MODS_PATHS[platform];

  if (!modsPath) {
    console.error(`Unsupported platform: ${platform}`);
    process.exit(1);
  }

  const distPath = join(process.cwd(), 'dist');
  const modId = getModId();
  const linkPath = join(modsPath, modId);

  // Check dist exists
  if (!existsSync(distPath)) {
    console.error(`dist/ folder not found. Run 'pnpm build' first.`);
    process.exit(1);
  }

  // Create mods directory if it doesn't exist
  if (!existsSync(modsPath)) {
    console.log(`Creating mods directory: ${modsPath}`);
    mkdirSync(modsPath, { recursive: true });
  }

  // Remove existing link/folder if present
  if (existsSync(linkPath)) {
    const stats = lstatSync(linkPath);
    if (stats.isSymbolicLink()) {
      console.log(`Removing existing symlink: ${linkPath}`);
      unlinkSync(linkPath);
    } else {
      console.error(`${linkPath} exists and is not a symlink.`);
      console.error(`Please remove it manually if you want to create a symlink.`);
      process.exit(1);
    }
  }

  // Create symlink
  try {
    symlinkSync(distPath, linkPath, 'junction'); // 'junction' works on Windows without admin
    console.log(`Symlink created successfully!`);
    console.log(`  Source: ${distPath}`);
    console.log(`  Target: ${linkPath}`);
    console.log('');
    console.log(`Your mod will now be available in Subway Builder.`);
    console.log(`Enable it in Settings > Mods after restarting the game.`);
  } catch (err: any) {
    if (err.code === 'EPERM' && platform === 'win32') {
      console.error(`Permission denied. On Windows, try running as Administrator.`);
    } else {
      console.error(`Failed to create symlink: ${err.message}`);
    }
    process.exit(1);
  }
}

function unlink() {
  const modsPath = MODS_PATHS[platform];
  const modId = getModId();
  const linkPath = join(modsPath, modId);

  if (!existsSync(linkPath)) {
    console.log(`No symlink found at: ${linkPath}`);
    return;
  }

  const stats = lstatSync(linkPath);
  if (!stats.isSymbolicLink()) {
    console.error(`${linkPath} is not a symlink. Not removing.`);
    process.exit(1);
  }

  unlinkSync(linkPath);
  console.log(`Symlink removed: ${linkPath}`);
}

// Parse args
const args = process.argv.slice(2);
if (args.includes('--unlink') || args.includes('-u')) {
  unlink();
} else {
  link();
}
