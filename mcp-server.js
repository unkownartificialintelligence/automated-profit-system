#!/usr/bin/env node

/**
 * MCP Server for Automated Profit System
 * Exposes profit system functionality via Model Context Protocol
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:3003";

// Create MCP server
const server = new Server(
  {
    name: "automated-profit-system",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const TOOLS = [
  {
    name: "get_christmas_products",
    description: "Get today's trending Christmas products ready to launch",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_product_design_specs",
    description: "Get design specifications for a specific Christmas product",
    inputSchema: {
      type: "object",
      properties: {
        product_index: {
          type: "number",
          description: "Product index (0-9)",
        },
      },
      required: ["product_index"],
    },
  },
  {
    name: "get_marketing_campaign",
    description: "Get marketing campaign content for a product",
    inputSchema: {
      type: "object",
      properties: {
        product_index: {
          type: "number",
          description: "Product index (0-9)",
        },
      },
      required: ["product_index"],
    },
  },
  {
    name: "get_dashboard_stats",
    description: "Get personal account dashboard with sales and profit data",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_christmas_revenue_projection",
    description: "Get revenue projection for Christmas season",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "generate_stakeholder_campaign",
    description: "Generate marketing campaign for specific stakeholder type",
    inputSchema: {
      type: "object",
      properties: {
        stakeholder: {
          type: "string",
          enum: ["team", "customers", "clients", "partnerships", "sponsorships"],
          description: "Stakeholder type",
        },
        campaign_type: {
          type: "string",
          description: "Campaign type (e.g., recruitment, product_launch, outreach)",
        },
        custom_data: {
          type: "object",
          description: "Custom data for campaign personalization",
        },
      },
      required: ["stakeholder", "campaign_type"],
    },
  },
  {
    name: "get_marketing_campaigns_list",
    description: "List all available marketing campaigns for a stakeholder type",
    inputSchema: {
      type: "object",
      properties: {
        stakeholder: {
          type: "string",
          enum: ["team", "customers", "clients", "partnerships", "sponsorships"],
          description: "Stakeholder type",
        },
      },
      required: ["stakeholder"],
    },
  },
  {
    name: "get_system_health",
    description: "Get system health status and uptime",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_christmas_products": {
        const response = await axios.get(`${SERVER_URL}/api/christmas/today`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "get_product_design_specs": {
        const { product_index } = args;
        const response = await axios.get(
          `${SERVER_URL}/api/christmas/design/${product_index}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "get_marketing_campaign": {
        const { product_index } = args;
        const response = await axios.get(
          `${SERVER_URL}/api/christmas/marketing/${product_index}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "get_dashboard_stats": {
        const response = await axios.get(`${SERVER_URL}/api/dashboard`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "get_christmas_revenue_projection": {
        const response = await axios.get(`${SERVER_URL}/api/christmas/revenue`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "generate_stakeholder_campaign": {
        const { stakeholder, campaign_type, custom_data } = args;
        const queryParams = custom_data
          ? "?" + new URLSearchParams(custom_data).toString()
          : "";
        const response = await axios.get(
          `${SERVER_URL}/api/marketing/${stakeholder}/${campaign_type}${queryParams}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "get_marketing_campaigns_list": {
        const { stakeholder } = args;
        const response = await axios.get(
          `${SERVER_URL}/api/marketing/${stakeholder}`
        );
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case "get_system_health": {
        const response = await axios.get(`${SERVER_URL}/api/health`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Automated Profit System MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
