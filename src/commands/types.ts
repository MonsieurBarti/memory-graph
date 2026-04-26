// Local structural types so commands can be tested without importing pi-coding-agent.

export interface CommandContext {
	cwd?: string;
	ui: {
		notify: (msg: string, level?: "info" | "warn" | "error") => void;
	};
	isIdle?: () => boolean;
}

export interface CommandDefinition {
	description: string;
	handler: (args: string, ctx: CommandContext) => Promise<void>;
}

export interface PiApi {
	registerCommand: (name: string, def: CommandDefinition) => void;
	sendUserMessage: (
		content: string,
		options?: { deliverAs?: "steer" | "followUp" },
	) => void;
}
