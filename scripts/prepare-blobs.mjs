
import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const source = "assets";
const target = ".netlify/blobs/deploy";

if (existsSync(target)) {
  await rm(target, { recursive: true, force: true });
}

await mkdir(target, { recursive: true });

await cp(source, target, {
  recursive: true
});

console.log("Media prepared for Netlify Blobs");
