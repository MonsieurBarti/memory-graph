// Vault path resolution shared across all memory-graph pi commands.
// Mirrors the path conventions hard-coded in the Claude Code commands and SKILL.

import { homedir } from "node:os";
import { resolve } from "node:path";

export interface VaultPaths {
	slug: string;
	root: string;
	raw: string;
	wiki: string;
	schema: string;
	index: string;
	log: string;
}

export type VaultTarget = "project" | "global";

export function vaultPaths(target: VaultTarget, cwd: string = process.cwd()): VaultPaths {
	const slug = target === "global" ? "global" : sanitizeCwd(cwd);
	const root = resolve(homedir(), ".memory-graph", slug);
	return {
		slug,
		root,
		raw: resolve(root, "raw"),
		wiki: resolve(root, "wiki"),
		schema: resolve(root, "SCHEMA.md"),
		index: resolve(root, "wiki", "index.md"),
		log: resolve(root, "wiki", "log.md"),
	};
}

export function sanitizeCwd(cwd: string): string {
	return cwd.replace(/\//g, "-");
}

export interface ParsedFlags {
	global: boolean;
	all: boolean;
	list: boolean;
	rest: string;
}

export function parseFlags(args: string): ParsedFlags {
	const tokens = args.split(/\s+/).filter(Boolean);
	let global = false;
	let all = false;
	let list = false;
	const restTokens: string[] = [];
	for (const t of tokens) {
		if (t === "--global") global = true;
		else if (t === "--all") all = true;
		else if (t === "--list") list = true;
		else restTokens.push(t);
	}
	return { global, all, list, rest: restTokens.join(" ") };
}
