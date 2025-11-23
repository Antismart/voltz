const fs = require('fs').promises;
const path = require('path');

const TARGET_SEGMENTS = ['@xmtp', 'proto', 'ts', 'dist', 'esm'];
const ROOT = path.resolve(__dirname, '..');
const NODE_MODULES_DIR = path.join(ROOT, 'node_modules');

function hasTargetSuffix(dir) {
  const normalized = path.normalize(dir);
  const segments = normalized.split(path.sep).filter(Boolean);
  if (segments.length < TARGET_SEGMENTS.length) {
    return false;
  }
  const tail = segments.slice(-TARGET_SEGMENTS.length);
  return TARGET_SEGMENTS.every((segment, idx) => tail[idx] === segment);
}

async function collectIndexFiles(dir, results = []) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    return results;
  }

  if (hasTargetSuffix(dir)) {
    const filePath = path.join(dir, 'index.js');
    try {
      await fs.access(filePath);
      results.push(filePath);
    } catch (err) {
      // ignore
    }
    return results;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const nextDir = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '@xmtp') {
      await collectIndexFiles(nextDir, results);
    } else {
      if (nextDir.includes(path.join('node_modules', '@xmtp'))) {
        await collectIndexFiles(nextDir, results);
      }
    }
  }

  return results;
}

async function patchFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const patched = content.replace(/\.pb(["'])/g, '.pb.js$1');
  if (patched !== content) {
    await fs.writeFile(filePath, patched, 'utf8');
    return true;
  }
  return false;
}

(async () => {
  try {
    await fs.access(NODE_MODULES_DIR);
  } catch (err) {
    console.log('Skipping XMTP proto patching because node_modules is missing.');
    return;
  }

  const indexFiles = await collectIndexFiles(NODE_MODULES_DIR, []);

  if (!indexFiles.length) {
    console.log('No XMTP proto ESM entrypoints found to patch.');
    return;
  }

  let patchedCount = 0;
  for (const filePath of indexFiles) {
    const patched = await patchFile(filePath);
    if (patched) {
      patchedCount += 1;
      console.log(`Patched ${filePath}`);
    }
  }

  console.log(`Fixed ${patchedCount} XMTP proto entrypoint${patchedCount === 1 ? '' : 's'}.`);
})();
