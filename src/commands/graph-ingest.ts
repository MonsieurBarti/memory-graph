import { existsSync } from "node:fs";
import { sendDirective } from "../utils/send-directive.js";
import { parseFlags, vaultPaths } from "../utils/vault-paths.js";
import type { CommandDefinition, PiApi } from "./types.js";

export function graphIngestCommand(pi: PiApi): CommandDefinition {
	return {
		description:
			"Ingest a raw source (file path or URL) into the memory-graph vault. Project by default; --global for the machine-wide vault.",
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
				ctx.ui.notify("Usage: /graph-ingest <path-or-url> [--global]", "warn");
				return;
			}
			sendDirective(
				pi,
				ctx,
				`Ingest the source "${flags.rest}" into the ${target} vault at ${paths.root}. Follow the wiki skill's ingest procedure: read SCHEMA first, copy to raw/, write the source page with citations and ^[raw:…] anchors, touch affected entity/concept pages, update wiki/index.md, append a "## [YYYY-MM-DD] ingest | …" entry to wiki/log.md. Apply any workflows and hard rules SCHEMA mandates.`,
			);
		},
	};
}
