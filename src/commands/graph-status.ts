import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { vaultPaths, type VaultTarget } from "../utils/vault-paths.js";
import type { CommandDefinition } from "./types.js";

export function graphStatusCommand(): CommandDefinition {
	return {
		description: "Show stats for the project vault and the global vault.",
		handler: async (_args, ctx) => {
			const lines: string[] = [];
			for (const target of ["project", "global"] as const) {
				lines.push(...reportVault(target, ctx.cwd));
				lines.push("");
			}
			ctx.ui.notify(lines.join("\n"), "info");
		},
	};
}

function reportVault(target: VaultTarget, cwd: string | undefined): string[] {
	const paths = vaultPaths(target, cwd);
	const out: string[] = [`--- ${target} vault: ${paths.root} ---`];
	if (!existsSync(paths.schema)) {
		out.push(
			`  (not initialized — run /graph-init${target === "global" ? " --global" : ""})`,
		);
		return out;
	}
	out.push(`  raw sources: ${countMd(paths.raw)}`);
	const counts = countWiki(paths.wiki);
	out.push(
		`  wiki pages: ${counts.total} (sources: ${counts.sources}, entities: ${counts.entities}, concepts: ${counts.concepts}, synthesis: ${counts.synthesis})`,
	);
	out.push("  last 3 log entries:");
	for (const line of lastLogHeaders(paths.log, 3)) out.push(`    ${line}`);
	return out;
}

function countMd(dir: string): number {
	if (!existsSync(dir)) return 0;
	let n = 0;
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.isFile() && entry.name.endsWith(".md")) n++;
	}
	return n;
}

interface WikiCounts {
	total: number;
	sources: number;
	entities: number;
	concepts: number;
	synthesis: number;
}

function countWiki(wikiDir: string): WikiCounts {
	const counts: WikiCounts = { total: 0, sources: 0, entities: 0, concepts: 0, synthesis: 0 };
	if (!existsSync(wikiDir)) return counts;
	walk(wikiDir, (path) => {
		if (!path.endsWith(".md")) return;
		const name = path.split("/").pop() ?? "";
		if (name === "index.md" || name === "log.md") return;
		counts.total++;
		if (path.includes("/sources/")) counts.sources++;
		else if (path.includes("/entities/")) counts.entities++;
		else if (path.includes("/concepts/")) counts.concepts++;
		else if (path.includes("/synthesis/")) counts.synthesis++;
	});
	return counts;
}

function walk(dir: string, onFile: (path: string) => void): void {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const p = join(dir, entry.name);
		if (entry.isDirectory()) walk(p, onFile);
		else if (entry.isFile()) onFile(p);
	}
}

function lastLogHeaders(logPath: string, n: number): string[] {
	if (!existsSync(logPath)) return ["(no log file)"];
	const headers = readFileSync(logPath, "utf8")
		.split("\n")
		.filter((line) => line.startsWith("## "));
	return headers.slice(-n);
}
