import express, { Request, Response } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { InjectHardwareInputSchema, executeDatabaseInjection } from './tools/injectDatabase';
import { ScrapeVendorInputSchema, executeVendorScrape } from '../services/scrapeVendor';

export const createMcpRouter = () => {
  const router = express.Router();

  const mcpServer = new Server({
    name: "AutonomousHardwareHubMCP",
    version: "1.0.0",
  }, {
    capabilities: {
      tools: {}
    }
  });

  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "inject_hardware_payload",
        description: "Validates, cleans, and inserts polymorphic hardware data into MongoDB, then invalidates Redis cache.",
        inputSchema: zodToJsonSchema(InjectHardwareInputSchema) as any
      },
      {
        name: "scrape_vendor_pricing",
        description: "Scrapes live pricing, stock availability, and technical specifications from electronic distributor websites.",
        inputSchema: zodToJsonSchema(ScrapeVendorInputSchema) as any
      }
    ]
  }));

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === "inject_hardware_payload") {
      try {
        const validatedArgs = InjectHardwareInputSchema.parse(args);
        const result = await executeDatabaseInjection(validatedArgs);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Injection Error: ${error.message}` }]
        };
      }
    }

    if (name === "scrape_vendor_pricing") {
      try {
        const validatedArgs = ScrapeVendorInputSchema.parse(args);
        const result = await executeVendorScrape(validatedArgs);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: `Scraping Error: ${error.message}` }]
        };
      }
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  const transports: Record<string, SSEServerTransport> = {};

  router.get('/sse', async (req: Request, res: Response) => {
    const transport = new SSEServerTransport('/mcp/messages', res as any);
    await mcpServer.connect(transport);
    transports[transport.sessionId] = transport;

    req.on('close', () => {
      delete transports[transport.sessionId];
    });
  });

  router.post('/messages', async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports[sessionId];

    if (!transport) {
      return res.status(404).json({ error: "Session not found. Connect to /sse first." });
    }

    await transport.handlePostMessage(req, res as any);
  });

  return router;
};