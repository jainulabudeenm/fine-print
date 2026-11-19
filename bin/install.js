#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILL_NAME = 'fine-print';
const SKILL_FILE = path.join(__dirname, '..', 'skills', `${SKILL_NAME}.skill`);

const args = process.argv.slice(2);
const isProject = args.includes('--project') || args.includes('-p');

console.log(`\nfine-print installer\n`);

if (!fs.existsSync(SKILL_FILE)) {
  console.error('Skill file not found in package. Try reinstalling.');
  process.exit(1);
}

// Claude Code reads ~/.agents/skills/, Claude.ai reads ~/.claude/skills/.
// Install to both so it works wherever you are.
const targets = isProject
  ? [
      path.join(process.cwd(), '.agents', 'skills'),
      path.join(process.cwd(), '.claude', 'skills'),
    ]
  : [
      path.join(os.homedir(), '.agents', 'skills'),
      path.join(os.homedir(), '.claude', 'skills'),
    ];

let anySuccess = false;

for (const targetDir of targets) {
  const targetFile = path.join(targetDir, `${SKILL_NAME}.skill`);
  try {
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(SKILL_FILE, targetFile);
    console.log(`installed: ${targetFile}`);
    anySuccess = true;
  } catch (err) {
    if (err.code === 'EEXIST' || err.message.includes('identical')) {
      console.log(`already in place: ${targetFile}`);
      anySuccess = true;
    } else {
      console.warn(`could not install to ${targetDir}: ${err.message}`);
    }
  }
}

if (!anySuccess) {
  console.error('Installation failed. Check folder permissions.');
  process.exit(1);
}

if (isProject) {
  console.log(`\nTip: commit .agents/skills/ and .claude/skills/ to share with your team.`);
}

console.log(`\nHow to use:`);
console.log(`   Select a component in Figma (with the Figma MCP server on) and say "audit this component"`);
console.log(`   You get blockers, warnings, lexicon proposals and what Figma cannot hold`);
console.log(`   After the fixes, it can write the engineer's spec`);
console.log(`\nAlso installable as a Claude Code plugin:`);
console.log(`  /plugin marketplace add jainulabudeenm/fine-print`);
console.log(`  /plugin install fine-print`);

console.log(`\nTo update later: npx fine-print@latest\n`);
