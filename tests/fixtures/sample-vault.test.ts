// Sanity tests on the sample-vault fixture itself. The fixture is what humans
// (and future sessions) eyeball to understand "what a healthy vault looks like";
// drifting it silently undermines that. These checks aren't a substitute for
// /graph-lint — they're guardrails to keep the fixture self-consistent.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const fixtureRoot = resolve(__dirname, "sample-vault");
const wikiRoot = join(fixtureRoot, "wiki");

function listMarkdownPagesUnder(dir: string): string[] {
	if (!existsSync(dir)) return [];
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		const stat = statSync(full);
		if (stat.isDirectory()) {
			out.push(...listMarkdownPagesUnder(full));
		} else if (entry.endsWith(".md")) {
			out.push(full);
		}
	}
	return out;
}

const allPages = listMarkdownPagesUnder(wikiRoot);

describe("sample-vault: structure", () => {
	it("has SCHEMA.md", () => {
		expect(existsSync(join(fixtureRoot, "SCHEMA.md"))).toBe(true);
	});

	it("has wiki/index.md and wiki/log.md", () => {
		expect(existsSync(join(wikiRoot, "index.md"))).toBe(true);
		expect(existsSync(join(wikiRoot, "log.md"))).toBe(true);
	});

	it("contains every page kind exercised by phases 1–5", () => {
		const kinds = ["sources", "entities", "concepts", "synthesis", "decisions", "conflicts"];
		for (const kind of kinds) {
			const dir = join(wikiRoot, kind);
			expect(existsSync(dir), `wiki/${kind}/ exists`).toBe(true);
			const pages = readdirSync(dir).filter((f) => f.endsWith(".md"));
			expect(pages.length, `wiki/${kind}/ has ≥1 page`).toBeGreaterThan(0);
		}
	});
});

describe("sample-vault: wikilinks resolve", () => {
	const linkRegex = /\[\[wiki\/([^\]]+?)\]\]/g;

	it.each(allPages.map((p) => [p.replace(`${fixtureRoot}/`, "")]))(
		"%s has no broken [[wiki/...]] links",
		(rel) => {
			const full = join(fixtureRoot, rel);
			const body = readFileSync(full, "utf8");
			const broken: string[] = [];
			for (const match of body.matchAll(linkRegex)) {
				const target = match[1];
				if (target === undefined) continue;
				const targetPath = join(wikiRoot, `${target}.md`);
				if (!existsSync(targetPath)) {
					broken.push(target);
				}
			}
			expect(broken, `${rel} broken links`).toEqual([]);
		},
	);
});

describe("sample-vault: source pages reference real raw files", () => {
	const sourcesDir = join(wikiRoot, "sources");
	const sourcePages = readdirSync(sourcesDir).filter((f) => f.endsWith(".md"));

	it.each(sourcePages)("sources/%s has a real sourceFile", (file) => {
		const body = readFileSync(join(sourcesDir, file), "utf8");
		const match = body.match(/^sourceFile:\s+(.+)$/m);
		const captured = match?.[1] ?? "";
		expect(captured, `${file} has sourceFile frontmatter`).toBeTruthy();
		const sourceFile = captured.trim();
		const sourceFilePath = join(fixtureRoot, sourceFile);
		expect(existsSync(sourceFilePath), `${file} sourceFile (${sourceFile}) exists`).toBe(true);
	});
});

describe("sample-vault: index covers every page", () => {
	const index = readFileSync(join(wikiRoot, "index.md"), "utf8");
	const linkedInIndex = new Set<string>();
	for (const match of index.matchAll(/\[\[wiki\/([^\]]+?)\]\]/g)) {
		const target = match[1];
		if (target !== undefined) linkedInIndex.add(target);
	}

	it.each(allPages.map((p) => [p.replace(`${wikiRoot}/`, "").replace(/\.md$/, "")]))(
		"%s appears in wiki/index.md",
		(slug) => {
			// index.md and log.md are catalogs, not content — skip.
			if (slug === "index" || slug === "log") return;
			expect(linkedInIndex.has(slug), `${slug} is referenced in index.md`).toBe(true);
		},
	);
});
