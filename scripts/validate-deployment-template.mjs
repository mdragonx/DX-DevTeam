import { readFileSync } from "node:fs";

const file = process.argv[2] ?? "infra/swarm/laboratory-stack.yml";
const source = readFileSync(file, "utf8");
const invalid = [/example(?:\.com|\/)/i, /sha256:(?:1{64}|2{64}|0{64})/, /<[^>]*image[^>]*>/i, /(?:TODO|PLACEHOLDER).*image/i];
if (invalid.some((pattern) => pattern.test(source))) throw new Error(`${file} contains a placeholder image reference`);
for (const image of source.matchAll(/^\s*image:\s*(.+)$/gm)) {
  if (!/@sha256:[a-f0-9]{64}/.test(image[1]) && !/^\$\{[A-Z0-9_]+:\?[^}]+\}$/.test(image[1])) throw new Error(`Unpinned or unresolved image expression: ${image[1]}`);
}
