import { createServer } from "node:http";
import { z } from "zod";
import { parsePropertyPdf } from "./infrai_pdf_client.js";

const requestSchema = z.object({ pdf: z.string().min(1), source: z.string().min(1).optional() });
export type PropertyDecision = { tenantName: string | null; maintenanceRequests: string[]; inspectionReminder: string | null };

export function decidePropertyWork(parsed: unknown): PropertyDecision {
  const record = (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>;
  const text = JSON.stringify(record).toLowerCase();
  const requests = ["leak", "broken", "repair", "heating"].filter((word) => text.includes(word));
  const tenantName = typeof record.tenant_name === "string" ? record.tenant_name : null;
  const inspectionReminder = /inspection|inspect/.test(text) ? "Schedule property inspection" : null;
  return { tenantName, maintenanceRequests: requests, inspectionReminder };
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/property-parse") { res.writeHead(404).end(); return; }
  try {
    const body = await new Promise<string>((resolve, reject) => { let value = ""; req.on("data", (chunk) => { value += chunk; }); req.on("end", () => resolve(value)); req.on("error", reject); });
    const input = requestSchema.parse(JSON.parse(body));
    const parsed = await parsePropertyPdf(input.pdf);
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true, data: decidePropertyWork(parsed) }));
  } catch (error) {
    const status = error instanceof z.ZodError ? 400 : 502;
    res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify({ ok: false, error: { message: error instanceof Error ? error.message : "Request failed" } }));
  }
});

if (process.env.NODE_ENV !== "test") server.listen(Number(process.env.PORT ?? 3000), () => console.log("property parser listening on port 3000"));
