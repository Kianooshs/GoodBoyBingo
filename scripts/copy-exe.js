const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distExe = path.join(rootDir, "dist", "GoodBoyBingo.exe");
const targetExe = path.join(rootDir, "GoodBoyBingo.exe");

if (!fs.existsSync(distExe)) {
  console.error("Expected portable EXE not found at:", distExe);
  process.exit(1);
}

fs.copyFileSync(distExe, targetExe);
console.log("Copied portable EXE to:", targetExe);
