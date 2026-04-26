import { existsSync } from "node:fs";
import { sendDirective } from "../utils/send-directive.js";
import { parseFlags, vaultPaths } from "../utils/vault-paths.js";
import type { CommandDefinition, PiApi } from "./types.js";

export function graphQueryCommand(pi: PiApi): CommandDefinition {
	return {
		description:
			"Ask a question against the memory-graph vault. Index-first retrieval with citations. Project by default; --global for the machine-wide vault.",
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
			if (!flags.rest) {
				ctx.ui.notify("Usage: /graph-query <question> [--global]", "warn");
				return;
			}
			sendDirective(
				pi,
				ctx,
				`Answer this question against the ${target} vault at ${paths.root}: "${flags.rest}". Follow the wiki skill's query procedure: read SCHEMA, then wiki/index.md first, pick pages in synthesis → concept → entity → source order, cap at ~10 pages, read only those, synthesize with inline [[wikilinks]] as citations, close with the structured Vault / Sources read / Suggested follow-ups footer. If I follow up with "file this", write the answer as a wiki/synthesis/<slug>.md page and update the index.`,
			);
		},
	};
}
