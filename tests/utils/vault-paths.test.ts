import { homedir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { parseFlags, sanitizeCwd, vaultPaths } from "../../src/utils/vault-paths.js";

describe("sanitizeCwd", () => {
	it("replaces every / with -", () => {
		expect(sanitizeCwd("/Users/x/Projects/foo")).toBe("-Users-x-Projects-foo");
	});

	it("handles trailing slash", () => {
		expect(sanitizeCwd("/Users/x/")).toBe("-Users-x-");
	});

	it("returns input unchanged when no slashes", () => {
		expect(sanitizeCwd("foo")).toBe("foo");
	});

	it("does not collapse repeated slashes — they round-trip to repeated dashes", () => {
		expect(sanitizeCwd("/Users//x")).toBe("-Users--x");
	});
});

describe("vaultPaths", () => {
	it("project target uses sanitized cwd as slug", () => {
		const paths = vaultPaths("project", "/Users/x/Projects/foo");
		expect(paths.slug).toBe("-Users-x-Projects-foo");
		expect(paths.root).toBe(resolve(homedir(), ".memory-graph", "-Users-x-Projects-foo"));
	});

	it("global target uses literal 'global' as slug regardless of cwd", () => {
		const paths = vaultPaths("global", "/anything/at/all");
		expect(paths.slug).toBe("global");
		expect(paths.root).toBe(resolve(homedir(), ".memory-graph", "global"));
	});

	it("derives raw/wiki/schema/index/log under root", () => {
		const paths = vaultPaths("project", "/p");
		expect(paths.raw).toBe(resolve(paths.root, "raw"));
		expect(paths.wiki).toBe(resolve(paths.root, "wiki"));
		expect(paths.schema).toBe(resolve(paths.root, "SCHEMA.md"));
		expect(paths.index).toBe(resolve(paths.root, "wiki", "index.md"));
		expect(paths.log).toBe(resolve(paths.root, "wiki", "log.md"));
	});

	it("falls back to process.cwd() when cwd not provided", () => {
		const paths = vaultPaths("project");
		expect(paths.slug).toBe(sanitizeCwd(process.cwd()));
	});
});

describe("parseFlags", () => {
	it("returns all-false defaults on empty input", () => {
		expect(parseFlags("")).toEqual({ global: false, all: false, list: false, rest: "" });
	});

	it("recognizes --global / --all / --list", () => {
		expect(parseFlags("--global")).toMatchObject({ global: true, all: false, list: false });
		expect(parseFlags("--all")).toMatchObject({ global: false, all: true, list: false });
		expect(parseFlags("--list")).toMatchObject({ global: false, all: false, list: true });
	});

	it("preserves non-flag tokens in rest, joined by single space", () => {
		expect(parseFlags("hello   world")).toMatchObject({ rest: "hello world" });
	});

	it("strips flags out of rest regardless of position", () => {
		expect(parseFlags("--global how does X scale")).toMatchObject({
			global: true,
			rest: "how does X scale",
		});
		expect(parseFlags("how does X scale --global")).toMatchObject({
			global: true,
			rest: "how does X scale",
		});
		expect(parseFlags("how --global does X scale")).toMatchObject({
			global: true,
			rest: "how does X scale",
		});
	});

	it("supports multiple flags in any order", () => {
		expect(parseFlags("--all --list label")).toEqual({
			global: false,
			all: true,
			list: true,
			rest: "label",
		});
	});

	it("treats unknown dash-tokens as rest (forward-compatible)", () => {
		expect(parseFlags("--unknown-flag value")).toMatchObject({
			rest: "--unknown-flag value",
		});
	});
});
