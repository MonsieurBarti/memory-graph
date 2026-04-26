import { existsSync } from "node:fs";
import { sendDirective } from "../utils/send-directive.js";
import { parseFlags, vaultPaths } from "../utils/vault-paths.js";
import type { CommandDefinition, PiApi } from "./types.js";

export function graphLintCommand(pi: PiApi): CommandDefinition {
	return {
		description:
			"Health-check the vault — orphans, broken links, contradictions, stale sources, missing pages. Project by default; --global for the machine-wide vault. Heavy by design.",
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
				`Lint the ${target} vault at ${paths.root}. Follow the wiki skill's lint procedure: cheap-first 7 checks (index-drift, broken-link, stale-source, schema-drift, orphan, missing-page, uncited-claim), then defer the 2 heavy semantic checks (contradiction, rule-drift) unless the cheap ones come up clean. Report findings as markdown tables grouped by severity, with stable issue IDs. Do not auto-apply fixes. Append a "## [YYYY-MM-DD] lint | counts: …" entry to wiki/log.md.`,
			);
		},
	};
}
