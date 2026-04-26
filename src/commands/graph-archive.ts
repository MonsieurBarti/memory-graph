import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { sendDirective } from "../utils/send-directive.js";
import { parseFlags, sanitizeCwd, vaultPaths } from "../utils/vault-paths.js";
import type { CommandContext, CommandDefinition, PiApi } from "./types.js";

export function graphArchiveCommand(pi: PiApi): CommandDefinition {
	return {
		description:
			"Snapshot a vault to ~/.memory-graph-archive/ (project by default; --global for machine-wide; --all for both). --list to see existing snapshots.",
		handler: async (args, ctx) => {
			const flags = parseFlags(args);
			if (flags.list) {
				listMode(flags, ctx);
				return;
			}
			const targets = flags.all
				? (["project", "global"] as const)
				: ([flags.global ? "global" : "project"] as const);
			const label = flags.rest.trim() || "snapshot";
			const targetDescriptions: string[] = [];
			for (const target of targets) {
				const paths = vaultPaths(target, ctx.cwd);
				if (!existsSync(paths.schema)) {
					ctx.ui.notify(
						`${target} vault not initialized at ${paths.root} — skipping.`,
						"warn",
					);
					continue;
				}
				targetDescriptions.push(
					`${target} vault: ${paths.root} → ~/.memory-graph-archive/${paths.slug}/${label}-YYYYMMDD/`,
				);
			}
			if (targetDescriptions.length === 0) return;
			sendDirective(
				pi,
				ctx,
				`Snapshot the following per the wiki skill's archive procedure (cp -a contents into the destination, append a log entry; archives live outside vault root so ingest/query/lint can't reach them):\n${targetDescriptions.map((d) => `- ${d}`).join("\n")}`,
			);
		},
	};
}

function listMode(flags: ReturnType<typeof parseFlags>, ctx: CommandContext): void {
	const slug = flags.global ? "global" : sanitizeCwd(ctx.cwd ?? process.cwd());
	const archiveRoot = resolve(homedir(), ".memory-graph-archive", slug);
	if (!existsSync(archiveRoot)) {
		ctx.ui.notify(
			`No archives yet for ${flags.global ? "global" : "project"} vault (${archiveRoot}).`,
			"info",
		);
		return;
	}
	const entries = readdirSync(archiveRoot, { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => {
			const p = resolve(archiveRoot, e.name);
			const mtime = statSync(p).mtime.toISOString().slice(0, 10);
			return `  ${e.name}  (${mtime})`;
		});
	const lines = [
		`Archives at ${archiveRoot}:`,
		...entries,
		"",
		"To restore one: see the wiki skill's `Restore — manual` section.",
	];
	ctx.ui.notify(lines.join("\n"), "info");
}
