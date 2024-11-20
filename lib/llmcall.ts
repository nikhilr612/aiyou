import { ChatResponse, Tool, Ollama } from "ollama/browser";

export interface Message {
  content: string;
  isUser: boolean;
}

/// Simple Endpoint interface (OLLAMA doesn't require much).
/// TODO: Add a type field and meta object to support more endpoint.
export interface Endpoint {
  /// The name of the endpoint.
  name: string;
  /// Target URL.
  target: string;
}

const base_tools: Tool[] = [
  // Wikipedia lookup.
  {
    type: "function",
    function: {
      name: "wiki-lookup",
      description: "Retrieve summary on topic from Wikipedia",
      parameters: {
        type: "object",
        required: ["article_title"],
        properties: {
          article_title: {
            type: "string",
            description: "The title of the article to search for on Wikipedia",
          },
        },
      },
    },
  },
  // JS-code execution.
  {
    type: "execution",
    function: {
      name: "js-exec",
      description:
        "Execute JavaScript code / function / expression and return result",
      parameters: {
        type: "object",
        required: ["code"],
        properties: {
          code: {
            type: "string",
            description:
              "The JavaScript code to execute in an isolated environment and return result",
          },
        },
      },
    },
  },
  // Weather report.
  {
    type: "function",
    function: {
      name: "weather-report",
      description: "Retrieve current weather for a specified location",
      parameters: {
        type: "object",
        required: ["location"],
        properties: {
          location: {
            type: "string",
            description: "The name of the location (city, town, etc.) to retrieve the weather for."
          }
        }
      }
    }
  },
  // Timezone tool.
  {
    type: "function",
    function: {
      name: "timezone-info",
      description: "Retrieve the current time and time zone information for a specified location.",
      parameters: {
        type: "object",
        required: ["location"],
        properties: {
          location: {
            type: "string",
            description: "The name of the location or timezone to retrieve time information for (e.g., 'America/New_York')."
          }
        }
      }
    }
  },
  // Currency conversion.
  {
    type: "function",
    function: {
      name: "currency-conversion",
      description: "Convert an amount of money from one currency to another using the latest exchange rates.",
      parameters: {
        type: "object",
        required: ["baseCurrency", "targetCurrency", "amount"],
        properties: {
          baseCurrency: {
            type: "string",
            description: "The base currency (e.g., 'EUR', 'USD')."
          },
          targetCurrency: {
            type: "string",
            description: "The target currency (e.g., 'USD', 'GBP')."
          },
          amount: {
            type: "number",
            description: "The amount of money to convert."
          }
        }
      }
    }
  },
  // Quotes from author.
  {
    type: "function",
    function: {
      name: "quote-author",
      description: "Retrieve up to 15 inspirational quotes by a specific author.",
      parameters: {
        type: "object",
        required: ["author"],
        properties: {
          author: {
            type: "string",
            description: "The name of the author whose quotes you want to retrieve."
          }
        }
      }
    }
  },
  // Random quote.
  {
    type: "function",
    function: {
      name: "random-quote",
      description: "Retrieve a random motivational or inspirational quote.",
      parameters: {
        type: "object",
        required: [],
        properties: {}
      }
    }
  }
];

/**
 * Fetch timezone information through `World Time API`.
 * */
async function timezoneInfo(location: string): Promise<string> {
  const endpoint = `http://worldtimeapi.org/api/timezone/${encodeURIComponent(location)}.json`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) return `Error fetching time zone information for ${location}: ${response.statusText}`;

    const data = await response.json();
    const { datetime, timezone, utc_offset } = data;

    return `
      Current Time in ${location}:
      - Timezone: ${timezone}
      - Current Time: ${datetime}
      - UTC Offset: ${utc_offset}
    `;
  } catch (error) {
    return `Failed to fetch time zone information for ${location}.`;
  }
}

/**
 * Make an LLM-inference request to the specified endpoint, with chat history and user query.
 * Does not provide any tools for tool-call.
 * Return the response string.
 * */
export async function base_llmcall(
  endpoint: Endpoint,
  history: Message[],
  query: string,
): Promise<string> {
  const response = await llmcall(endpoint, history, query, "user");
  console.log("Ollama response: ", response);
  return response.message.content;
}

export async function llmcall(
  endpoint: Endpoint,
  history: Message[],
  query: string,
  q_role: "user" | "tool" | "system",
  sysprompt?: string,
  tools?: Tool[],
): Promise<ChatResponse> {
  const ollama = new Ollama({
    host: endpoint.target,
  });

  const messages = history.map(function (m) {
    return {
      content: m.content,
      role: m.isUser ? "user" : "assistant",
    };
  });

  if (sysprompt) {
    messages.push({
      content: sysprompt,
      role: "system",
    });
  }

  messages.push({
    content: query,
    role: q_role,
  });

  const response = await ollama.chat({
    model: "aiyou-llm-target",
    messages: messages,
    tools: tools,
    format: tools ? "json" : undefined,
  });

  return response;
}

/**
 * Perform character-based chunking on provided string.
 * Splits on nearest delimiter under chunk width with highest priority.
 * */
export function chunkText(
  text: string,
  max_chunk_size: number,
  delims: string[],
): string[] {
  // Remove padding whitespaces, and append delimeter.
  text = text.trim();

  /// Utility function to grab the next chunk.
  function nextChunk(index: number): string {
    const substr = text.slice(index, index + max_chunk_size);
    let last_index = max_chunk_size;
    for (const delim of delims) {
      const last_delim_occur = substr.lastIndexOf(delim);
      if (last_delim_occur >= 0) {
        last_index = last_delim_occur + delim.length;
        break;
      }
    }

    return substr.slice(0, last_index);
  }

  let i = 0;
  const res = [];
  while (i < text.length) {
    const c = nextChunk(i);
    i += c.length;
    console.log("Chunk", i);
    res.push(c);
  }

  return res;
}

const PROMPT1 =
  "You are an LLM Agent whose sole purpose is to improve and enhance the user's query or statement with any relevant information suitable. However, ensure that the core intent or message is not distorted. Respond only with the improved query. DO NOT MAKE ANY OTHER RESPONSE.";
const PROMPT3 =
  "You are an LLM Agent with access to special tools which you can choose to invoke. Use them to best help the user with their query.";
const PROMPT2 =
  "You are a professional AI assistant. Answer the user's query with clarity. You may optionally be provided with additional context to help you answer. Evaluate the relevance and usefulness of the information before answering. There will also be an attempted answer to the user's question provided for your reference. The attempted answer can be considered as part of the context. If there is any information that is not relevant ignore it and do not mention it to the user.";

type NotificationFn = (a: string) => Promise<void>;

async function default_notification_fn(a: string) {
  console.log(a);
}

/**
 * A function to perform agentic LLM call on specified endpoint with pre-defined tools and provided query and chat history.
 * Addtionally, a notification callback can be provided which will be called to log any unexpected events during generation.
 * */
export async function agentic_call(
  endpoint: Endpoint,
  history: Message[],
  query: string,
  notify: NotificationFn = default_notification_fn,
  retriever_access_token: string
): Promise<string> {
  const response1 = await llmcall(endpoint, history, query, "user", PROMPT1);
  console.log("CRAG-Response1: ", response1.message.content);

  let response2;
  try {
    response2 = await llmcall(
      endpoint,
      history,
      query,
      "user",
      PROMPT3,
      base_tools,
    );
    console.log("CRAG-ToolCall-Response: ", response2.message);
  } catch (error) {
    notify("ToolCall Request failed.");
    console.error("Error occurred while performing llm call with tools", error);
    response2 = { message: { tool_calls: undefined } };
  }

  let toolResponses = "";
  // Handle tool calls
  if (response2.message.tool_calls) {
    for (const tool_call of response2.message.tool_calls) {
      let tool_response;
      switch (tool_call.function.name) {
        case "wiki-lookup":
          tool_response = await wikiLookup(
            tool_call.function.arguments.article_title,
          );
          break;
        case "js-exec":
          tool_response = await jsExec(tool_call.function.arguments.code);
          break;
        case "weather-report":
          tool_response = await weatherReport(tool_call.function.arguments.location);
          break;
        case "timezone-info":
          tool_response = await timezoneInfo(tool_call.function.arguments.location);
          break;
        case "currency-conversion":
          tool_response = await convertCurrency(tool_call.function.arguments.baseCurrency, tool_call.function.arguments.targetCurrency, tool_call.function.arguments.amount);
          break;
        case "random-quote":
          tool_response = await randomQuote();
          break;
        case "quote-author":
          tool_response = await quoteAuthor(tool_call.function.arguments.author);
          break;
        default:
          console.log(`Unknown tool: ${tool_call.function.name}`);
      }
      toolResponses += `Tool Response for ${tool_call.function.name}: ${tool_response}\n`;
      console.log(
        `Tool Response for ${tool_call.function.name}: `,
        tool_response,
      );
    }
  }

  // Retrieve documents from server via API using `response1.message.content` as user query
  const fetchResponse = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: response1.message.content,
      method: "retrieve",
      meta: JSON.stringify({
        token: retriever_access_token
      }), // TODO: Add JSON for user-related stuff here.
    }),
  });

  let docs_concat = "";

  try {
    const result = await fetchResponse.json();
    if (result.error) {
      console.error("Document retrieval error: " + result.message);
      docs_concat = "Failed to fetch context. ERROR: " + result.message;
      notify("Document Retrieval Request was unsuccessful.");
    } else if (result.documents) {
      docs_concat = result.documents[0] + "\n" + result.documents[1];
    } else {
      docs_concat = "";
      console.error("Unexpected result object: " + result);
    }
  } catch (error) {
    console.error(
      "Document retrieval failed. Fallback to original response.\nCause: ",
      error,
    );
    notify("Context retrieval failed. Fallback.");
    return response1.message.content;
  }

  const context =
    "\nCONTEXT\n" +
    docs_concat +
    "\n\nTOOL RESPONSE\n" +
    toolResponses +
    "\nATTEMPTED ANSWER\n" +
    response1.message.content;

  console.log("CRAG-Final-Context: ", context);

  const response3 = await llmcall(
    endpoint,
    history,
    query,
    "user",
    PROMPT2 + context,
  );
  console.log("CRAG-Response3: ", response3);

  return response3.message.content;
}

/**
 * Retrieve article/page summary from wikipedia.
 * */
async function wikiLookup(article_title: string): Promise<string> {
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article_title)}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      return `Error fetching Wikipedia summary: ${response.statusText}`;
    }
    const data = await response.json();
    return data.extract; // This should contain text for the article.
  } catch (error) {
    console.error("Failed to fetch Wikipedia summary:", error);
    return "Failed to fetch summary from Wikipedia.";
  }
}

async function jsExec(code: string): Promise<string> {
  try {
    return String(eval(code));
  } catch (error) {
    console.error("JS-Exec error:", error);
    return String(error);
  }
}

/**
 * Perform forward-geocoding through nominatim.
 * */
async function getCoordinatesFromNominatim(location: string): Promise<{ lat: number; lon: number }> {
  const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&addressdetails=1`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Error fetching geocoding data:" + response.statusText);

    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon } = data[0];
      return { lat: parseFloat(lat), lon: parseFloat(lon) };
    } else {
      throw new Error("No geocoding results found.");
    }
  } catch (error) {
    throw new Error("Failed to fetch geocoding data: " + error);
  }
}

/**
 * Get weather report from location through OpenMeteo.
 * */
async function weatherReport(location: string): Promise<string> {
  try {
    const { lat, lon } = await getCoordinatesFromNominatim(location);
    const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      return `Error fetching weather data: ${response.statusText}`;
    }
    const data = await response.json();
    const weatherData = data.current_weather;

    const weatherDetails = `
      Weather in your location:
      - Temperature: ${weatherData.temperature}°C
      - Wind: ${weatherData.windspeed} km/h, Direction: ${weatherData.winddirection}° (from the North)
      - Wind Gusts: ${weatherData.windgusts} km/h
      - Humidity: ${weatherData.relative_humidity}%
      - Pressure: ${weatherData.pressure} hPa
      - Weather Condition: ${weatherData.weathercode}
      - Cloud Cover: ${weatherData.cloudcover}%
      - Time of Report: ${new Date(weatherData.time).toLocaleString()}`;

    return weatherDetails;
  } catch (error) {
    return "Failed to fetch weather data. Caused by: " + String(error);
  }
}

/**
 * Convert between currencies at the current rate through Frankfurter.
 * */
async function convertCurrency(baseCurrency: string, targetCurrency: string, amount: number): Promise<string> {
  const endpoint = `https://api.frankfurter.app/latest?base=${baseCurrency}&symbols=${targetCurrency}`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) return `Error fetching exchange rate: ${response.statusText}`;

    const data = await response.json();
    const rate = data.rates[targetCurrency];
    if (!rate) return `No exchange rate found for ${baseCurrency} to ${targetCurrency}.`;

    const convertedAmount = (amount * rate).toFixed(2); // 2 decimal places of accuracy.
    return `${amount} ${baseCurrency} = ${convertedAmount} ${targetCurrency}`;
  } catch (error) {
    return "Failed to fetch currency conversion data. Caused by: " + String(error);
  }
}

/**
 * Fetch a random quote from `ZenQuotes.io`
 * */
async function randomQuote(): Promise<string> {
  const endpoint = "https://zenquotes.io/api/random";

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      return `Error fetching quote: ${response.statusText}`;
    }

    const data = await response.json();
    const quote = data[0]?.q || "No quote found.";
    const author = data[0]?.a || "Unknown";

    return `"${quote}" — ${author}`;
  } catch (error) {
    console.error("Failed to fetch quote:", error);
    return "Failed to fetch a quote.";
  }
}

/**
 * Fetch upto 15 quotes by an author from `ZenQuotes.io`
 * */
async function quoteAuthor(author: string): Promise<string> {
  const endpoint = `https://zenquotes.io/api/quotes/${encodeURIComponent(author)}`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok)
      return `Error fetching quotes by ${author}: ${response.statusText}`;

    const data = await response.json();
    if (data.length === 0)
      return `No quotes found for ${author}.`;

    // Maximum of 15 quotes only. 
    const quotesToReturn = data.slice(0, 15);
    return quotesToReturn
      .map((quote: any) => `"${quote.q}" — ${quote.a}`)
      .join("\n");
  } catch (error) {
    console.error("Failed to fetch quote by author:", error);
    return `Failed to fetch quotes by ${author}.`;
  }
}