/**
 * Patches react-scripts' webpackDevServer.config.js to fix two bugs on Node 17+:
 * 1. "allowedHosts[0] should be a non-empty string"
 * 2. Fully disables host check as a belt-and-suspenders measure
 */
const fs   = require('fs');
const path = require('path');

const configPath = path.join(
  __dirname,
  'node_modules', 'react-scripts', 'config', 'webpackDevServer.config.js'
);

if (!fs.existsSync(configPath)) {
  console.log('[patch-wds] Config not found, skipping.');
  process.exit(0);
}

let content = fs.readFileSync(configPath, 'utf8');
let changed = false;

// Patch 1: allowedHosts crash when allowedHost is empty string
const OLD1 = `allowedHosts: disableFirewall ? 'all' : [allowedHost],`;
const NEW1 = `allowedHosts: disableFirewall || !allowedHost ? 'all' : [allowedHost],`;
if (content.includes(OLD1)) {
  content = content.replace(OLD1, NEW1);
  changed = true;
  console.log('[patch-wds] ✅ Patched allowedHosts empty-string bug.');
} else if (!content.includes(NEW1)) {
  console.log('[patch-wds] allowedHosts line not found — may have changed in this version.');
}

// Patch 2: force host check off entirely as backup
const OLD2 = `const disableFirewall =`;
const NEW2 = `const disableFirewall = true || `;
if (content.includes(OLD2) && !content.includes(NEW2)) {
  content = content.replace(OLD2, NEW2);
  changed = true;
  console.log('[patch-wds] ✅ Forced disableFirewall = true.');
}

if (changed) {
  fs.writeFileSync(configPath, content, 'utf8');
  console.log('[patch-wds] ✅ webpackDevServer.config.js patched successfully.');
} else {
  console.log('[patch-wds] Already patched or no changes needed.');
}
