/**
 * Shared agentic loop for all agents.
 * Drives a tool-use conversation until the model returns end_turn.
 * handleToolCall must return a Promise (or plain value) — both are awaited.
 */

'use strict';

async function runAgent({ client, model = 'claude-opus-4-6', systemPrompt, userMessage, tools, handleToolCall, maxTokens = 8096 }) {
  const messages = [{ role: 'user', content: userMessage }];

  while (true) {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      tools,
      messages
    });

    if (response.stop_reason === 'end_turn') {
      const textBlock = response.content.find(b => b.type === 'text');
      return textBlock ? textBlock.text : '';
    }

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });

      const toolResults = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          console.log(`  [tool] ${block.name}`);
          const result = await Promise.resolve(handleToolCall(block.name, block.input));
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: String(result)
          });
        }
      }

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    throw new Error(`Unexpected stop_reason: ${response.stop_reason}`);
  }
}

module.exports = { runAgent };
