/*
  Generate a minimal OpenAPI document for Supabase Edge Functions used here.
*/
import { writeFileSync } from "fs";

const spec = {
  openapi: "3.0.3",
  info: { title: "Asphalt Overwatch Functions", version: "1.0.0" },
  paths: {
    "/functions/v1/ai-chat": {
      post: {
        summary: "Chat with AI assistant",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { messages: { type: "array", items: { type: "object" } } },
              },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/functions/v1/analyze-asphalt": {
      post: {
        summary: "Analyze asphalt image",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", properties: { imageData: { type: "string" } } },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
  },
};

writeFileSync("docs/swagger.json", JSON.stringify(spec, null, 2));
console.log("OpenAPI spec written to docs/swagger.json");
