/// <reference path="../worker-configuration.d.ts" />

import { GoogleGenAI } from "@google/genai";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

// Helper function to interact with Gemini API
async function discussWithGemini(
	apiKey: string,
	text: string,
	prompt: string,
	options?: {
		model?: string;
		maxTokens?: number;
		temperature?: number;
	},
): Promise<string> {
	const ai = new GoogleGenAI({ apiKey });

	// Combine the user's prompt with the text content
	const fullPrompt = `${prompt}\n\nText to analyze:\n${text}`;

	try {
		const response = await ai.models.generateContent({
			model: options?.model || "gemini-2.5-flash",
			contents: fullPrompt,
			config: {
				maxOutputTokens: options?.maxTokens || 8192,
				temperature: options?.temperature || 0.7,
			},
		});

		if (!response || !response.text) {
			throw new Error("No response received from Gemini API");
		}

		return response.text;
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Gemini API error: ${error.message}`);
		}
		throw new Error("Unknown error occurred while calling Gemini API");
	}
}

// Define our MCP agent with the think and Gemini discussion tools
export class DiscussMCP extends McpAgent {
	server = new McpServer({
		name: "Discussion MCP",
		version: "1.0.0",
	});

	async init() {
		// Register the think tool
		this.server.tool(
			"think",
			"Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed.",
			{
				thought: z.string().describe("A thought to think about"),
			},
			async ({ thought }) => {
				// Log the thought for debugging purposes
				console.log(`[Think] ${thought}`);

				return {
					content: [
						{
							type: "text",
							text: `Thought: ${thought}`,
						},
					],
				};
			},
		);

		// Register the Gemini discussion tool
		this.server.tool(
			"discuss_with_gemini",
			"Engage in extended discussion with Gemini API for reading and summarizing very long text. Useful for complex analysis, detailed summaries, and multi-turn conversations.",
			{
				text: z.string().describe("The text content to discuss or analyze"),
				prompt: z
					.string()
					.describe("The prompt or question for Gemini to process"),
				model: z
					.string()
					.optional()
					.default("gemini-2.0-flash-001")
					.describe("The Gemini model to use"),
				max_tokens: z
					.number()
					.optional()
					.default(8192)
					.describe("Maximum tokens in response"),
				temperature: z
					.number()
					.optional()
					.default(0.7)
					.describe("Temperature for response generation (0-1)"),
			},
			async ({ text, prompt, model, max_tokens, temperature }) => {
				const env = this.env as Env;

				if (!env.GEMINI_API_KEY) {
					return {
						content: [
							{ type: "text", text: "Error: GEMINI_API_KEY is not configured" },
						],
					};
				}

				try {
					const responseText = await discussWithGemini(
						env.GEMINI_API_KEY,
						text,
						prompt,
						{
							model,
							maxTokens: max_tokens,
							temperature,
						},
					);

					return {
						content: [
							{
								type: "text",
								text: responseText,
							},
						],
					};
				} catch (error) {
					return {
						content: [
							{
								type: "text",
								text: `Error communicating with Gemini: ${error instanceof Error ? error.message : "Unknown error"}`,
							},
						],
					};
				}
			},
		);
	}
}

// Export the worker
export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return DiscussMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return DiscussMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
