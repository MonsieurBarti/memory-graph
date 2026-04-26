import { existsSync } from "node:fs";
import { sendDirective } from "../utils/send-directive.js";
import { parseFlags, vaultPaths } from "../utils/vault-paths.js";
import type { CommandDefinition, PiApi } from "./types.js";

export function graphConsolidateCommand(pi: PiApi): CommandDefinition {
	return {
		description:
			"Surface stale pages, near-duplicates, and open conflicts in the vault — report only, no mutations. Project by default; --global for the machine-wide vault. Heavy by design.",
		handler: async (args, ctx) => {
			const flags = parseFlags(args);
			const target = flags.global ? "global" : "project";
			const paths = vaultPaths(target, ctx.cwd);
			if (!existsSync(paths.schema)) {
				ctx.ui.notify(
					`No ${target} vault at ${paths.root}. Run /graph-init${target === "global" ? " --global" : ""} first.`,
					"warn",
				);
				return;
			}
			sendDirective(
				pi,
				ctx,
				`Consolidate the ${target} vault at ${paths.root}. Follow the wiki skill's "Consolidate" procedure under "Three operations": stale-page sweep (frontmatter walk), near-duplicate sweep (≥2 of three signals: title Jaccard ≥0.7, slug-stem match, ≥3 shared wikilinks), open-conflict roll-up. Report findings as three markdown-table sections with a one-line topline. Do NOT mutate any wiki page. Append a "## [YYYY-MM-DD] consolidate | counts: …" entry to wiki/log.md — that is the only write the command performs.`,
			);
		},
	};
}
