#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Recursive copy function
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source directory not found: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);

  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });

  console.log(`✓ Copied ${src} to ${dest}`);
}

try {
  // Create directories
  const nodeModulesDist = path.join(__dirname, "dist", "node_modules");
  const prismaClientDist = path.join(nodeModulesDist, "@prisma", "client");
  const prismaBinDist = path.join(nodeModulesDist, ".prisma");

  // Ensure directories exist
  fs.mkdirSync(prismaClientDist, { recursive: true });
  fs.mkdirSync(prismaBinDist, { recursive: true });

  // Copy @prisma/client
  const prismaClientSrc = path.join(
    __dirname,
    "node_modules",
    "@prisma",
    "client",
  );
  if (fs.existsSync(prismaClientSrc)) {
    copyDirRecursive(prismaClientSrc, prismaClientDist);
  }

  // Copy .prisma (binaries)
  const prismaBinSrc = path.join(__dirname, "node_modules", ".prisma");
  if (fs.existsSync(prismaBinSrc)) {
    copyDirRecursive(prismaBinSrc, prismaBinDist);
  }

  console.log("✓ All Prisma files copied successfully!");
} catch (error) {
  console.error("✗ Error copying Prisma files:", error.message);
  process.exit(1);
}
