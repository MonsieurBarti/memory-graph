// Sends a directive to the agent via pi.sendUserMessage, handling the steering
// case when the agent is mid-turn.

import type { CommandContext, PiApi } from "../commands/types.js";

export function sendDirective(pi: PiApi, ctx: CommandContext, directive: string): void {
	const idle = ctx.isIdle?.();
	if (idle === false) {
		pi.sendUserMessage(directive, { deliverAs: "steer" });
	} else {
		pi.sendUserMessage(directive);
	}
}
