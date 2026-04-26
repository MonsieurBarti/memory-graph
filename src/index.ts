// memory-graph pi-coding-agent extension entry.
// Mirrors the Claude Code plugin's slash commands. The shared SKILL is bundled
// via package.json's `pi.skills` field — both runtimes load the same methodology.
//
// Most commands use pi.sendUserMessage to inject a directive that triggers the
// agent immediately; the agent then follows the wiki SKILL to do the actual work.
// `graph-status` and `graph-archive --list` short-circuit the LLM round-trip and
// answer directly from file IO.

import { graphArchiveCommand } from "./commands/graph-archive.js";
import { graphConsolidateCommand } from "./commands/graph-consolidate.js";
import { graphIngestCommand } from "./commands/graph-ingest.js";
import { graphInitCommand } from "./commands/graph-init.js";
import { graphLintCommand } from "./commands/graph-lint.js";
import { graphQueryCommand } from "./commands/graph-query.js";
import { graphStatusCommand } from "./commands/graph-status.js";
import type { PiApi } from "./commands/types.js";

export default function memoryGraphExtension(pi: PiApi): void {
	pi.registerCommand("graph-init", graphInitCommand(pi));
	pi.registerCommand("graph-status", graphStatusCommand());
	pi.registerCommand("graph-ingest", graphIngestCommand(pi));
	pi.registerCommand("graph-query", graphQueryCommand(pi));
	pi.registerCommand("graph-lint", graphLintCommand(pi));
	pi.registerCommand("graph-consolidate", graphConsolidateCommand(pi));
	pi.registerCommand("graph-archive", graphArchiveCommand(pi));
}

export {
	graphArchiveCommand,
	graphConsolidateCommand,
	graphIngestCommand,
	graphInitCommand,
	graphLintCommand,
	graphQueryCommand,
	graphStatusCommand,
};
export * from "./utils/vault-paths.js";
