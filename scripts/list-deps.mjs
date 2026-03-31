const dependencies = new Set();
import { readFileSync } from "node:fs";

const lockfile = readFileSync(new URL("../pnpm-lock.yaml", import.meta.url), "utf8");

let inImporters = false;
let inDependencies = false;
let packageName = "";

for (const line of lockfile.split("\n")) {
  if (line === "importers:") {
    inImporters = true;
    continue;
  }

  if (line === "packages:") {
    break;
  }

  if (!inImporters) {
    continue;
  }

  if (/^ {2}[^ ].*:$/.test(line)) {
    inDependencies = false;
    packageName = "";
    continue;
  }

  if (/^ {4}(dependencies|devDependencies):$/.test(line)) {
    inDependencies = true;
    packageName = "";
    continue;
  }

  if (/^ {4}[a-z].*:/.test(line)) {
    inDependencies = false;
    packageName = "";
    continue;
  }

  if (!inDependencies) {
    continue;
  }

  const packageMatch = line.match(/^ {6}(.+):$/);
  if (packageMatch) {
    packageName = stripQuotes(packageMatch[1]);
    continue;
  }

  const versionMatch = line.match(/^ {8}version: (.+)$/);
  if (!versionMatch || !packageName) {
    continue;
  }

  const version = normalizeVersion(stripQuotes(versionMatch[1]));
  if (version.startsWith("link:")) {
    continue;
  }

  dependencies.add(`${packageName}@${version}`);
}

for (const dependency of [...dependencies].sort((left, right) => left.localeCompare(right))) {
  console.log(dependency);
}

function normalizeVersion(version) {
  const peerSuffixIndex = version.indexOf("(");
  if (peerSuffixIndex !== -1) {
    version = version.slice(0, peerSuffixIndex);
  }

  if (version.startsWith("@")) {
    const aliasSeparatorIndex = version.lastIndexOf("@");
    if (aliasSeparatorIndex > 0) {
      return version.slice(aliasSeparatorIndex + 1);
    }
  }

  return version;
}

function stripQuotes(value) {
  return value.replace(/^'(.*)'$/, "$1");
}
