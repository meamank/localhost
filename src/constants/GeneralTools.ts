export const GENERAL_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_internet",
      description: "Search the internet for the latest information, news, or facts to answer user queries.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to look up on the web.",
          },
        },
        required: ["query"],
      },
    },
  },
];

export const createGeneralToolHandler = () => {
  return async (toolCall: { toolName: string; arguments: any }) => {
    const { toolName, arguments: args } = toolCall;

    if (toolName === "search_internet") {
      try {
        console.log("[GeneralTools] Searching web for:", args.query);
        const formData = new URLSearchParams();
        formData.append("q", args.query);
        
        const res = await fetch("https://lite.duckduckgo.com/lite/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          },
          body: formData.toString(),
        });

        const html = await res.text();
        const snippetRegex = /<td class='result-snippet'>([\s\S]*?)<\/td>/gi;
        
        let match;
        const results = [];
        
        while ((match = snippetRegex.exec(html)) !== null && results.length < 5) {
          // Strip HTML tags and decode basic HTML entities
          let cleanSnippet = match[1].replace(/<[^>]*>?/gm, "").trim();
          cleanSnippet = cleanSnippet.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
          results.push(cleanSnippet);
        }

        if (results.length === 0) {
          return "No web results found for that query.";
        }

        return results.map((r, i) => `${i + 1}. ${r}`).join("\n");
      } catch (e) {
        console.error("Web search failed:", e);
        return `Search failed. Tell the user you couldn't access the internet.`;
      }
    }

    throw new Error(`Unknown general tool: ${toolName}`);
  };
};
