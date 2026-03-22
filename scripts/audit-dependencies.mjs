import { readdirSync, readFileSync } from "node:fs";
import { basename, extname, join, relative, resolve, sep } from "node:path";

const rootDir = process.cwd();
const workspaceRoots = ["apps", "packages"];
const codeExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".css"
]);
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "coverage",
  "data",
  "dist",
  "build",
  "node_modules",
  "out",
  "public"
]);
const configFileNames = new Set([
  "eslint.config.js",
  "eslint.config.mjs",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "postcss.config.js",
  "postcss.config.mjs",
  "tailwind.config.js",
  "tailwind.config.mjs",
  "tailwind.config.ts",
  "vitest.config.ts"
]);

function main() {
  const workspacePackages = getWorkspacePackages();
  const reports = workspacePackages.map(auditWorkspacePackage);

  for (const report of reports) {
    printReport(report);
  }

  printSummary(reports);
}

function getWorkspacePackages() {
  const packages = [];

  for (const workspaceRoot of workspaceRoots) {
    const workspaceRootPath = join(rootDir, workspaceRoot);
    const directories = safeReadDir(workspaceRootPath);

    for (const directoryEntry of directories) {
      if (!directoryEntry.isDirectory()) {
        continue;
      }

      const packageDir = join(workspaceRootPath, directoryEntry.name);
      const packageJsonPath = join(packageDir, "package.json");

      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
        packages.push({
          dir: packageDir,
          manifestPath: packageJsonPath,
          manifest: packageJson
        });
      } catch {
        continue;
      }
    }
  }

  return packages;
}

function auditWorkspacePackage(workspacePackage) {
  const dependencyNames = Object.keys(workspacePackage.manifest.dependencies ?? {}).sort();
  const devDependencyNames = Object.keys(workspacePackage.manifest.devDependencies ?? {}).sort();
  const declared = new Set([...dependencyNames, ...devDependencyNames]);
  const imports = collectImports(workspacePackage.dir, workspacePackage.manifest.name);

  const usedPackages = [...imports.keys()].sort();
  const usedInProduction = [];
  const usedInDevelopmentOnly = [];

  for (const packageName of usedPackages) {
    const usage = imports.get(packageName);

    if (usage.prod.size > 0) {
      usedInProduction.push(packageName);
    } else {
      usedInDevelopmentOnly.push(packageName);
    }
  }

  const missingRuntime = usedInProduction.filter(
    (packageName) => !dependencyNames.includes(packageName)
  );
  const missingDevelopment = usedInDevelopmentOnly.filter(
    (packageName) => !declared.has(packageName)
  );
  const runtimeDeclaredButDevOnly = dependencyNames.filter((packageName) => {
    const usage = imports.get(packageName);
    return usage && usage.prod.size === 0 && usage.dev.size > 0;
  }).filter((packageName) => !isFrameworkPeerDependency(dependencyNames, packageName));
  const unusedDependencies = dependencyNames.filter(
    (packageName) => !imports.has(packageName)
  ).filter((packageName) => !isFrameworkPeerDependency(dependencyNames, packageName));
  const rawUnusedDevDependencies = devDependencyNames.filter(
    (packageName) => !imports.has(packageName)
  );
  const toolchainOnlyDevDependencies = rawUnusedDevDependencies.filter(
    isExpectedToolchainDependency
  );
  const unusedDevDependencies = rawUnusedDevDependencies.filter(
    (packageName) => !isExpectedToolchainDependency(packageName)
  );

  return {
    packageName: workspacePackage.manifest.name,
    packageDir: relative(rootDir, workspacePackage.dir).split(sep).join("/"),
    dependencyNames,
    devDependencyNames,
    imports,
    missingRuntime,
    missingDevelopment,
    runtimeDeclaredButDevOnly,
    unusedDependencies,
    toolchainOnlyDevDependencies,
    unusedDevDependencies
  };
}

function collectImports(packageDir, selfPackageName) {
  const imports = new Map();
  const files = collectFiles(packageDir);

  for (const filePath of files) {
    const relativePath = relative(packageDir, filePath).split(sep).join("/");
    const source = readFileSync(filePath, "utf8");
    const importSources =
      extname(filePath) === ".css"
        ? extractStylesheetImports(source)
        : extractImportSources(source);
    const bucket = isProductionFile(relativePath) ? "prod" : "dev";

    for (const importDescriptor of importSources) {
      const packageName = normalizePackageName(importDescriptor.source);

      if (!packageName || packageName === selfPackageName) {
        continue;
      }

      if (!imports.has(packageName)) {
        imports.set(packageName, {
          prod: new Set(),
          dev: new Set()
        });
      }

      const targetBucket = importDescriptor.typeOnly ? "dev" : bucket;
      const resolvedBucket =
        importDescriptor.typeOnly || importDescriptor.kind === "css"
          ? "dev"
          : bucket;
      imports.get(packageName)[resolvedBucket].add(relativePath);
    }
  }

  return imports;
}

function collectFiles(directoryPath) {
  const files = [];

  for (const directoryEntry of safeReadDir(directoryPath)) {
    const entryPath = join(directoryPath, directoryEntry.name);

    if (directoryEntry.isDirectory()) {
      if (ignoredDirectories.has(directoryEntry.name)) {
        continue;
      }

      files.push(...collectFiles(entryPath));
      continue;
    }

    if (codeExtensions.has(extname(directoryEntry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function extractImportSources(source) {
  const matches = [];
  const patterns = [
    {
      pattern: /\bimport\s+(type\s+)?(?:[^"'`]*?\s+from\s+)?["'`]([^"'`]+)["'`]/g,
      extractor: (match) => ({
        typeOnly: Boolean(match[1]),
        source: match[2],
        kind: "module"
      })
    },
    {
      pattern: /\bexport\s+(type\s+)?[^"'`]*?\s+from\s+["'`]([^"'`]+)["'`]/g,
      extractor: (match) => ({
        typeOnly: Boolean(match[1]),
        source: match[2],
        kind: "module"
      })
    },
    {
      pattern: /\bimport\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
      extractor: (match) => ({
        typeOnly: false,
        source: match[1],
        kind: "module"
      })
    },
    {
      pattern: /\brequire\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
      extractor: (match) => ({
        typeOnly: false,
        source: match[1],
        kind: "module"
      })
    }
  ];

  for (const { pattern, extractor } of patterns) {
    for (const match of source.matchAll(pattern)) {
      const importDescriptor = extractor(match);

      if (importDescriptor.source) {
        matches.push(importDescriptor);
      }
    }
  }

  return matches;
}

function extractStylesheetImports(source) {
  const matches = [];
  const pattern = /@import\s+["'`]([^"'`]+)["'`]/g;

  for (const match of source.matchAll(pattern)) {
    if (match[1]) {
      matches.push({
        typeOnly: false,
        source: match[1],
        kind: "css"
      });
    }
  }

  return matches;
}

function normalizePackageName(importSource) {
  if (importSource === "mdx/types") {
    return "@types/mdx";
  }

  if (
    importSource.startsWith(".") ||
    importSource.startsWith("/") ||
    importSource.startsWith("@/") ||
    importSource.startsWith("node:")
  ) {
    return null;
  }

  if (importSource.startsWith("@")) {
    const [scope, name] = importSource.split("/");
    return scope && name ? `${scope}/${name}` : null;
  }

  const [name] = importSource.split("/");
  return name || null;
}

function isProductionFile(relativePath) {
  const fileName = basename(relativePath);

  if (
    relativePath.includes("/tests/") ||
    relativePath.includes("/__tests__/") ||
    /\.test\.[^.]+$/.test(fileName) ||
    /\.spec\.[^.]+$/.test(fileName)
  ) {
    return false;
  }

  if (relativePath.startsWith("scripts/")) {
    return false;
  }

  return !configFileNames.has(fileName);
}

function printReport(report) {
  const sections = [
    formatSection("Missing runtime dependencies", report.missingRuntime, report.imports),
    formatSection(
      "Missing development or type-only dependencies",
      report.missingDevelopment,
      report.imports
    ),
    formatSection(
      "Dependencies referenced only from type-only or dev files",
      report.runtimeDeclaredButDevOnly,
      report.imports
    ),
    formatPlainSection(
      "Dependencies not referenced by static imports",
      report.unusedDependencies
    ),
    formatPlainSection(
      "Toolchain devDependencies without direct imports",
      report.toolchainOnlyDevDependencies
    ),
    formatPlainSection(
      "DevDependencies not referenced by static imports",
      report.unusedDevDependencies
    )
  ].filter(Boolean);

  console.log(`\n# ${report.packageName} (${report.packageDir})`);
  console.log(`Declared dependencies: ${report.dependencyNames.length}`);
  console.log(`Declared devDependencies: ${report.devDependencyNames.length}`);

  if (sections.length === 0) {
    console.log("No issues detected by static import and stylesheet audit.");
    return;
  }

  for (const section of sections) {
    console.log(section);
  }
}

function formatSection(title, packageNames, imports) {
  if (packageNames.length === 0) {
    return "";
  }

  const lines = [`${title}:`];

  for (const packageName of packageNames) {
    const usage = imports.get(packageName);
    const files = usage
      ? [...usage.prod, ...usage.dev].slice(0, 3).join(", ")
      : "";
    lines.push(`- ${packageName}${files ? ` -> ${files}` : ""}`);
  }

  return lines.join("\n");
}

function formatPlainSection(title, packageNames) {
  if (packageNames.length === 0) {
    return "";
  }

  return `${title}:\n- ${packageNames.join("\n- ")}`;
}

function printSummary(reports) {
  const summary = reports.map((report) => ({
    packageName: report.packageName,
    missingRuntime: report.missingRuntime.length,
    missingDevelopment: report.missingDevelopment.length,
    runtimeDeclaredButDevOnly: report.runtimeDeclaredButDevOnly.length,
    unusedDependencies: report.unusedDependencies.length,
    toolchainOnlyDevDependencies: report.toolchainOnlyDevDependencies.length,
    unusedDevDependencies: report.unusedDevDependencies.length
  }));

  console.log("\n# Summary");

  for (const item of summary) {
    console.log(
      `- ${item.packageName}: missing runtime ${item.missingRuntime}, missing dev ${item.missingDevelopment}, runtime-only-dev ${item.runtimeDeclaredButDevOnly}, unused deps ${item.unusedDependencies}, toolchain-only devDeps ${item.toolchainOnlyDevDependencies}, unused devDeps ${item.unusedDevDependencies}`
    );
  }
}

function isFrameworkPeerDependency(declaredDependencies, packageName) {
  return (
    declaredDependencies.includes("next") &&
    (packageName === "react" || packageName === "react-dom")
  );
}

function isExpectedToolchainDependency(packageName) {
  return expectedToolchainDependencies.has(packageName);
}

function safeReadDir(directoryPath) {
  try {
    return readdirSync(resolve(directoryPath), { withFileTypes: true });
  } catch {
    return [];
  }
}

const expectedToolchainDependencies = new Set([
  "@tailwindcss/postcss",
  "@types/mdx",
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "babel-plugin-react-compiler",
  "eslint",
  "eslint-config-next",
  "shadcn",
  "tailwindcss",
  "tw-animate-css",
  "typescript"
]);

main();
