/**
 * Shared agentic loop for all agents.
 * Drives a tool-use conversation until the model returns end_turn.
 * handleToolCall must return a Promise (or plain value) — both are awaited.
 */

'use strict';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function createWithRetry(client, params, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      return await client.messages.create(params);
    } catch (err) {
      const is429 = err.status === 429 || (err.message && err.message.includes('rate_limit'));
      if (is429 && i < retries - 1) {
        const wait = Math.pow(2, i + 1) * 10000; // 20s, 40s, 80s, 160s
        console.log(`  [rate limit] Waiting ${wait / 1000}s before retry ${i + 1}/${retries - 1}...`);
        await sleep(wait);
        continue;
      }
      throw err;
    }
  }
}

async function runAgent({ client, model = 'claude-sonnet-4-6', systemPrompt, userMessage, tools, handleToolCall, maxTokens = 8096 }) {
  const messages = [{ role: 'user', content: userMessage }];

  while (true) {
    const response = await createWithRetry(client, {
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
