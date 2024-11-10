import { Ollama } from "ollama/browser";

export interface Message {
  content: string;
  isUser: boolean;
}

/// Simple Endpoint interface (OLLAMA doesn't require much).
/// TODO: Add a type field and meta object to support more endpoint.
export interface Endpoint {
  /// The name of the endpoint.
  name: string,
  /// Target URL.
  target: string,
}

/**
 * Make an LLM-inference request to the specified endpoint, with chat history and user query.
 * Handle any necessary tool calls.
 * Return the response string.
 * */
export async function llmcall(endpoint: Endpoint, history: Message[], query: string, q_role: "user" | "system" | "tool") : Promise<string> { 
  let ollama = new Ollama({
    host: endpoint.target
  });

  let messages = history.map(function (m) {
    return {
      content: m.content,
      role: (m.isUser ? "user" : "assistant")
    }
  });

  messages.push({
    content: query,
    role: q_role
  });

  const response = await ollama.chat({
    model: 'aiyou-llm-target',
    messages: messages
  });

  console.log("Ollama response: ", response);

  return response.message.content;
}