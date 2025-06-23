# Discussion MCP Server

<div align="center">
  <img src="./images/logo.png" alt="Think MCP Logo" width="200">
  
  An MCP (Model Context Protocol) server that provides thinking and discussion tools for AI assistants. Features a thinking tool to organize reasoning during complex tasks and a Gemini discussion tool for analyzing long texts. Built with TypeScript and deployable on Cloudflare Workers.
</div>

## Features

- 🧠 **Thinking Tool**: Helps AI assistants explicitly reason through complex problems
- 💬 **Gemini Discussion Tool**: Enables extended conversations with Gemini API for long text analysis
- 🚀 **Cloudflare Workers**: Runs serverless with global distribution
- 🎯 **Dual Purpose**: Tools for both reasoning organization and extended text analysis
- 🌐 **Dual Transport**: Supports both SSE and Streamable HTTP for maximum compatibility
- 📦 **Simple Architecture**: Stateless design with minimal overhead
- 🔍 **Transparent Reasoning**: Makes AI decision-making more observable
- 📚 **Long Text Support**: Ideal for summarizing and analyzing extensive documents

## Architecture

This server implements the MCP specification using Cloudflare's Agents SDK:
- **GET /sse**: SSE endpoint for MCP communication
- **POST /mcp**: Streamable HTTP endpoint for MCP communication
- Built with TypeScript, MCP SDK, and Cloudflare Agents SDK
- Proper JSON-RPC 2.0 error handling
- Node.js compatibility mode enabled

## What is the Think Tool?

Based on [Anthropic's research](https://www.anthropic.com/engineering/claude-think-tool), the think tool creates a designated space for AI assistants to:
- Process external information carefully
- Follow detailed policies more consistently
- Make better decisions in multi-step scenarios
- Organize reasoning before taking actions

## Setup

### Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Node.js**: Preferably with a version manager like [nvm](https://github.com/nvm-sh/nvm)
3. **pnpm**: [Installation instructions](https://pnpm.io/installation)

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Configure Gemini API key for local development:
   ```bash
   cp .dev.vars.example .dev.vars
   # Edit .dev.vars and add your Gemini API key
   ```

### Deployment

1. Set up your Gemini API key:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
   Enter your Gemini API key when prompted.

2. Deploy to Cloudflare Workers:
   ```bash
   pnpm run deploy
   ```

**Alternative: Continuous Deployment**

You can also set up continuous deployment directly from the Cloudflare dashboard. Learn more about [Git Integration with Cloudflare](https://developers.cloudflare.com/pages/configuration/git-integration/)

### Claude Code Configuration

Add the MCP server to Claude Code using the CLI via SSE transport:

```bash
# For production deployment (SSE)
claude mcp add think https://your-worker-name.workers.dev/sse -t sse

# For local development
claude mcp add think http://localhost:8787/sse -t sse
```

You can verify the configuration with:
```bash
claude mcp list
```

## Usage

Once configured, Claude Code can use the think tool to organize its reasoning during complex tasks.

### Available Tools

**think**: Record a thought during reasoning
- `thought` (required): A thought to think about

**discuss_with_gemini**: Engage in extended discussion with Gemini API
- `text` (required): The text content to discuss or analyze
- `prompt` (required): The prompt or question for Gemini to process
- `model` (optional): The Gemini model to use (default: gemini-1.5-flash)
- `max_tokens` (optional): Maximum tokens in response (default: 8192)
- `temperature` (optional): Temperature for response generation (0-1, default: 0.7)

Example usage:
```javascript
// During a complex debugging session
await think({ 
  thought: "The error occurs in the authentication flow. Let me check if the token is being properly validated before proceeding to fix the issue." 
})

// When analyzing multiple options
await think({ 
  thought: "I have three possible approaches: 1) Refactor the entire module, 2) Add a wrapper function, 3) Modify the existing implementation. Option 2 seems best because it maintains backward compatibility." 
})

// Before making important decisions
await think({ 
  thought: "The user wants to optimize performance. I should first profile the code to identify bottlenecks rather than making assumptions about what needs optimization." 
})

// Analyzing a long document
await discuss_with_gemini({
  text: "/* Very long document content here */",
  prompt: "Please provide a comprehensive summary of this document, highlighting the main points and key takeaways.",
  model: "gemini-1.5-pro",
  max_tokens: 4096
})

// Technical analysis with specific requirements
await discuss_with_gemini({
  text: "/* Complex technical specification */",
  prompt: "Analyze this technical specification and identify potential implementation challenges, security concerns, and performance considerations.",
  temperature: 0.3 // Lower temperature for more focused analysis
})
```

### When the Tools are Used

**Think Tool** - Claude Code will use this when:
- Working through complex multi-step problems
- Analyzing tool outputs before making decisions
- Following detailed policies or guidelines
- Debugging challenging issues
- Evaluating multiple solution approaches

**Gemini Discussion Tool** - Claude Code will use this when:
- Analyzing very long documents that exceed Claude's context window
- Needing detailed summaries of extensive text
- Requiring specialized analysis from Gemini models
- Processing large technical documents or specifications
- Generating comprehensive reports from lengthy content

### Example Scenarios

**Think tool** improves performance in scenarios like:
1. **Software Engineering**: Breaking down complex refactoring tasks
2. **Debugging**: Systematically analyzing error patterns
3. **Architecture Design**: Evaluating trade-offs between different approaches
4. **Code Review**: Organizing observations before providing feedback
5. **Problem Solving**: Working through algorithmic challenges step-by-step

**Gemini Discussion tool** excels at:
1. **Document Analysis**: Summarizing lengthy technical documentation
2. **Research Papers**: Extracting key findings from academic papers
3. **Code Documentation**: Analyzing large codebases and their documentation
4. **Legal/Contract Review**: Processing extensive legal documents
5. **Log Analysis**: Examining large log files for patterns and issues

### CLAUDE.md Examples

To encourage effective use of the think tool, add these to your CLAUDE.md:

```markdown
# Think Tool Usage

Use the mcp__think__think tool to organize your reasoning during complex tasks.

- Use the think tool when:
  - Analyzing results from other tool calls
  - Making decisions between multiple approaches
  - Working through multi-step problems
  - Debugging complex issues
  - Following detailed implementation requirements

- Structure your thoughts to include:
  - Current understanding of the problem
  - Available options or approaches
  - Reasoning for decisions
  - Next steps to take

- Example thinking patterns:
  - "I see three potential issues here: X, Y, and Z. Let me investigate X first because..."
  - "The test failure suggests a race condition. I should check the async operations..."
  - "Before implementing, I need to consider the performance implications of..."
```

## Development

Run locally:
```bash
# Start local development server
pnpm dev
```

Run all checks before deployment:
```bash
pnpm build
```

This command runs:
1. `pnpm format` - Format code with Biome
2. `pnpm lint:fix` - Fix linting issues  
3. `pnpm cf-typegen` - Generate Cloudflare types
4. `pnpm type-check` - Check TypeScript types

Test the server:
```bash
# Test SSE connection
curl http://localhost:8787/sse

# Test health endpoint
curl http://localhost:8787/
```

## Performance Benefits

According to Anthropic's research, the think tool provides:
- Improved pass rates on complex tasks
- Better consistency in following policies
- More accurate multi-step reasoning
- Enhanced performance in customer service and software engineering domains

## Technical Details

- **Language**: TypeScript (ES2021 target)
- **Runtime**: Cloudflare Workers with Node.js compatibility
- **Protocol**: MCP (Model Context Protocol)
- **Transport**: SSE and Streamable HTTP
- **Observability**: Enabled for monitoring

## References

- [Give Claude "Thinking" Tool - Anthropic Engineering](https://www.anthropic.com/engineering/claude-think-tool)
- [Model Context Protocol (MCP) - Cloudflare Agents](https://developers.cloudflare.com/agents/model-context-protocol/)
- [Build a Remote MCP server - Cloudflare Agents](https://developers.cloudflare.com/agents/guides/remote-mcp-server/)

## License

MIT