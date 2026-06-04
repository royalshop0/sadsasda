import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, conversationsTable, messagesTable, activityTable } from "@workspace/db";
import {
  CreateConversationBody,
  GetConversationParams,
  UpdateConversationParams,
  UpdateConversationBody,
  DeleteConversationParams,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ─── Provider helpers ──────────────────────────────────────────────────────────

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "deepseek-r1-distill-llama-70b",
];

const NVIDIA_MODELS = [
  "meta/llama-3.3-70b-instruct",
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "mistralai/mistral-7b-instruct-v0.3",
];

const OPENROUTER_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "microsoft/phi-4-reasoning-plus:free",
];

type Message = { role: string; content: string };

async function callGroq(messages: Message[], model: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq: ${err}`);
  }
  const data = await response.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function callNvidia(messages: Message[], model: string): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error("NVIDIA_API_KEY not set");
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`NVIDIA: ${err}`);
  }
  const data = await response.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

async function callOpenRouter(messages: Message[], model: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://madarx.app",
      "X-Title": "MadarX AI OS",
    },
    body: JSON.stringify({ model, messages, max_tokens: 2048 }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter: ${err}`);
  }
  const data = await response.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content;
}

// ─── Smart routing ─────────────────────────────────────────────────────────────

function detectProvider(model: string, content: string): "groq" | "nvidia" | "openrouter" {
  if (NVIDIA_MODELS.includes(model)) return "nvidia";
  if (OPENROUTER_MODELS.includes(model)) return "openrouter";
  if (GROQ_MODELS.includes(model)) return "groq";
  // Auto-detect by content
  const lower = content.toLowerCase();
  const codeKeywords = ["code", "debug", "program", "function", "class", "algorithm", "fix bug", "error", "compile", "runtime"];
  const researchKeywords = ["research", "analyze", "report", "explain in detail", "comprehensive", "summarize", "compare"];
  if (codeKeywords.some(k => lower.includes(k))) return "nvidia";
  if (researchKeywords.some(k => lower.includes(k))) return "openrouter";
  return "groq";
}

// Calls the right provider with fallback chain: primary → groq → openrouter
async function callAI(messages: Message[], model: string, userContent: string): Promise<{ content: string; provider: string; model: string }> {
  const provider = detectProvider(model, userContent);

  // Resolve actual model for each provider
  const groqModel = GROQ_MODELS.includes(model) ? model : "llama-3.3-70b-versatile";
  const nvidiaModel = NVIDIA_MODELS.includes(model) ? model : "meta/llama-3.3-70b-instruct";
  const openrouterModel = OPENROUTER_MODELS.includes(model) ? model : "meta-llama/llama-3.3-70b-instruct:free";

  const attempts: Array<{ name: string; fn: () => Promise<string>; model: string }> = [];

  if (provider === "nvidia") {
    attempts.push({ name: "nvidia", fn: () => callNvidia(messages, nvidiaModel), model: nvidiaModel });
    attempts.push({ name: "groq", fn: () => callGroq(messages, groqModel), model: groqModel });
    attempts.push({ name: "openrouter", fn: () => callOpenRouter(messages, openrouterModel), model: openrouterModel });
  } else if (provider === "openrouter") {
    attempts.push({ name: "openrouter", fn: () => callOpenRouter(messages, openrouterModel), model: openrouterModel });
    attempts.push({ name: "groq", fn: () => callGroq(messages, groqModel), model: groqModel });
    attempts.push({ name: "nvidia", fn: () => callNvidia(messages, nvidiaModel), model: nvidiaModel });
  } else {
    attempts.push({ name: "groq", fn: () => callGroq(messages, groqModel), model: groqModel });
    attempts.push({ name: "openrouter", fn: () => callOpenRouter(messages, openrouterModel), model: openrouterModel });
    attempts.push({ name: "nvidia", fn: () => callNvidia(messages, nvidiaModel), model: nvidiaModel });
  }

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      const content = await attempt.fn();
      return { content, provider: attempt.name, model: attempt.model };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// ─── Routes ────────────────────────────────────────────────────────────────────

router.get("/chat/conversations", async (req, res): Promise<void> => {
  const conversations = await db
    .select({
      id: conversationsTable.id,
      title: conversationsTable.title,
      model: conversationsTable.model,
      createdAt: conversationsTable.createdAt,
      updatedAt: conversationsTable.updatedAt,
      messageCount: sql<number>`(SELECT COUNT(*) FROM messages WHERE conversation_id = ${conversationsTable.id})::int`,
    })
    .from(conversationsTable)
    .orderBy(desc(conversationsTable.updatedAt));
  res.json(conversations.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })));
});

router.post("/chat/conversations", async (req, res): Promise<void> => {
  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [conv] = await db.insert(conversationsTable).values({
    title: parsed.data.title,
    model: parsed.data.model ?? "llama-3.3-70b-versatile",
  }).returning();
  res.status(201).json({ ...conv, createdAt: conv.createdAt.toISOString(), updatedAt: conv.updatedAt.toISOString(), messageCount: 0 });
});

router.get("/chat/conversations/:id", async (req, res): Promise<void> => {
  const params = GetConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, params.data.id));
  if (!conv) { res.status(404).json({ error: "Conversation not found" }); return; }
  const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, params.data.id)).orderBy(messagesTable.createdAt);
  res.json({
    ...conv,
    createdAt: conv.createdAt.toISOString(),
    updatedAt: conv.updatedAt.toISOString(),
    messages: msgs.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })),
  });
});

router.patch("/chat/conversations/:id", async (req, res): Promise<void> => {
  const params = UpdateConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [conv] = await db.update(conversationsTable).set({ title: parsed.data.title }).where(eq(conversationsTable.id, params.data.id)).returning();
  if (!conv) { res.status(404).json({ error: "Conversation not found" }); return; }
  res.json({ ...conv, createdAt: conv.createdAt.toISOString(), updatedAt: conv.updatedAt.toISOString(), messageCount: 0 });
});

router.delete("/chat/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteConversationParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(messagesTable).where(eq(messagesTable.conversationId, params.data.id));
  await db.delete(conversationsTable).where(eq(conversationsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/chat/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, params.data.id));
  if (!conv) { res.status(404).json({ error: "Conversation not found" }); return; }

  await db.insert(messagesTable).values({ conversationId: params.data.id, role: "user", content: parsed.data.content });

  const history = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, params.data.id)).orderBy(messagesTable.createdAt);

  const requestedModel = parsed.data.model ?? conv.model;
  let assistantContent: string;
  let usedModel = requestedModel;

  try {
    const result = await callAI(
      history.map(m => ({ role: m.role, content: m.content })),
      requestedModel,
      parsed.data.content,
    );
    assistantContent = result.content;
    usedModel = result.model;
  } catch (err) {
    req.log.error({ err }, "All AI providers failed");
    assistantContent = "All AI providers are currently unavailable. Please try again in a moment.";
  }

  const [assistantMsg] = await db.insert(messagesTable).values({
    conversationId: params.data.id,
    role: "assistant",
    content: assistantContent,
    model: usedModel,
  }).returning();

  await db.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, params.data.id));
  await db.insert(activityTable).values({
    type: "chat",
    title: `AI Chat`,
    description: parsed.data.content.slice(0, 80),
    module: "AI Chat",
  }).catch(() => {});

  res.json({ ...assistantMsg, createdAt: assistantMsg.createdAt.toISOString() });
});

export default router;
