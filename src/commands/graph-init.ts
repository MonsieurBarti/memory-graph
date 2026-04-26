import { existsSync } from "node:fs";
import { sendDirective } from "../utils/send-directive.js";
import { parseFlags, vaultPaths } from "../utils/vault-paths.js";
import type { CommandDefinition, PiApi } from "./types.js";

export function graphInitCommand(pi: PiApi): CommandDefinition {
	return {
		description:
			"Bootstrap a memory-graph vault interactively. Project vault by default; --global for the machine-wide vault.",
		handler: async (args, ctx) => {
			const flags = parseFlags(args);
			const target = flags.global ? "global" : "project";
			const paths = vaultPaths(target, ctx.cwd);
			if (existsSync(paths.schema)) {
				ctx.ui.notify(
					`Vault already initialized at ${paths.root}. Run /graph-status for details.`,
					"warn",
				);
				return;
			}
			sendDirective(
				pi,
				ctx,
				`Run the wiki skill's interactive init for the ${target} vault at ${paths.root}. Interview me on scope, source kinds, entity types, workflows, and hard rules per the SKILL, then write SCHEMA.md, wiki/index.md, wiki/log.md, and the directory skeleton (raw/, wiki/{entities,concepts,sources,synthesis}/).`,
			);
		},
	};
}
