## Tool Calling

`llama.rn` has universal tool call support by using [minja](https://github.com/google/minja) (as Jinja template parser) and [chat.cpp](https://github.com/ggerganov/llama.cpp/blob/master/common/chat.cpp) in llama.cpp.

Example:

```js
import { initLlama } from "llama.rn";

const context = await initLlama({
  // ...params
});

const { text, tool_calls } = await context.completion({
  // ...params
  tool_choice: "auto",
  tools: [
    {
      type: "function",
      function: {
        name: "ipython",
        description:
          "Runs code in an ipython interpreter and returns the result of the execution after 60 seconds.",
        parameters: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "The code to run in the ipython interpreter.",
            },
          },
          required: ["code"],
        },
      },
    },
  ],
  messages: [
    {
      role: "system",
      content:
        "You are a helpful assistant that can answer questions and help with tasks.",
    },
    {
      role: "user",
      content: "Test",
    },
  ],
});
console.log("Result:", text);
// If tool_calls is not empty, it means the model has called the tool
if (tool_calls) console.log("Tool Calls:", tool_calls);
```

You can check [chat.cpp](https://github.com/ggerganov/llama.cpp/blob/6eecde3cc8fda44da7794042e3668de4af3c32c6/common/chat.cpp#L7-L23) for models has native tool calling support, or it will fallback to `GENERIC` type tool call.

The generic tool call will be always JSON object as output, the output will be like `{"response": "..."}` when it not decided to use tool call.
