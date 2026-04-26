import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { CommandDefinition, PiApi } from "../../src/commands/types.js";
import memoryGraphExtension from "../../src/index.js";

const repoRoot = resolve(__dirname, "..", "..");
const commandsDir = resolve(repoRoot, "commands");

function listCommandMarkdownFiles(): string[] {
	return readdirSync(commandsDir)
		.filter((f) => f.endsWith(".md"))
		.map((f) => f.replace(/\.md$/, ""))
		.sort();
}

function collectRegisteredCommands(): Map<string, CommandDefinition> {
	const registered = new Map<string, CommandDefinition>();
	const fakePi: PiApi = {
		registerCommand: (name, def) => {
			registered.set(name, def);
		},
		sendUserMessage: () => {},
	};
	memoryGraphExtension(fakePi);
	return registered;
}

describe("command registration parity", () => {
	const markdownCommands = listCommandMarkdownFiles();
	const registered = collectRegisteredCommands();

	it("every commands/*.md file has a TS handler registered", () => {
		const missing = markdownCommands.filter((name) => !registered.has(name));
		expect(missing).toEqual([]);
	});

	it("every registered TS handler has a commands/*.md file", () => {
		const orphans = [...registered.keys()].filter((name) => !markdownCommands.includes(name));
		expect(orphans).toEqual([]);
	});

	it("every registered command has a non-empty description", () => {
		for (const [name, def] of registered) {
			expect(def.description, `${name} description`).toBeTruthy();
			expect(def.description.length, `${name} description length`).toBeGreaterThan(20);
		}
	});

	it("every registered command has a handler function", () => {
		for (const [name, def] of registered) {
			expect(typeof def.handler, `${name} handler`).toBe("function");
		}
	});
});

describe("command markdown frontmatter", () => {
	const markdownCommands = listCommandMarkdownFiles();

	it.each(markdownCommands)("commands/%s.md has a description frontmatter field", (name) => {
		const body = readFileSync(resolve(commandsDir, `${name}.md`), "utf8");
		expect(body.startsWith("---\n"), `${name} starts with frontmatter`).toBe(true);
		expect(body, `${name} has description`).toMatch(/^description:\s+\S/m);
	});

	it.each(markdownCommands)("commands/%s.md frontmatter description is non-trivial", (name) => {
		const body = readFileSync(resolve(commandsDir, `${name}.md`), "utf8");
		const match = body.match(/^description:\s+(.+)$/m);
		const captured = match?.[1] ?? "";
		expect(captured, `${name} description match`).toBeTruthy();
		expect(captured.trim().length, `${name} description length`).toBeGreaterThan(20);
	});
});

describe("vault path safety", () => {
	it("commands that take args declare argument-hint", () => {
		const requiresHint = [
			"graph-init",
			"graph-ingest",
			"graph-query",
			"graph-lint",
			"graph-archive",
			"graph-consolidate",
		];
		for (const name of requiresHint) {
			const body = readFileSync(resolve(commandsDir, `${name}.md`), "utf8");
			expect(body, `${name} has argument-hint`).toMatch(/^argument-hint:/m);
		}
	});
});
