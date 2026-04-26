import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["tests/**/*.spec.ts", "tests/**/*.test.ts"],
		exclude: ["node_modules", "dist", ".worktrees"],
		passWithNoTests: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**/*.ts"],
			exclude: [
				"src/**/*.spec.ts",
				"src/**/*.test.ts",
				"src/**/*.d.ts",
				"src/commands/types.ts",
				// Integration-bound modules — exercised end-to-end in pi/Claude Code,
				// not unit-tested. Wiring them into v8 coverage would require mocking
				// the full ExtensionAPI surface for limited value.
				"src/index.ts",
				"src/utils/send-directive.ts",
			],
		},
	},
});
