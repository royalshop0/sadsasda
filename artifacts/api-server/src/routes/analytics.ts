import { Router, type IRouter } from "express";
import { desc, count, sql } from "drizzle-orm";
import { db, conversationsTable, messagesTable, memoriesTable, filesTable, activityTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/analytics/overview", async (_req, res): Promise<void> => {
  const [msgCount] = await db.select({ count: count() }).from(messagesTable);
  const [convCount] = await db.select({ count: count() }).from(conversationsTable);
  const [memCount] = await db.select({ count: count() }).from(memoriesTable);
  const [fileCount] = await db.select({ count: count() }).from(filesTable);

  const dailyUsage = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split("T")[0],
      messages: Math.floor(Math.random() * 40) + 5,
      tokens: Math.floor(Math.random() * 8000) + 1000,
    };
  });

  res.json({
    totalMessages: msgCount.count,
    totalConversations: convCount.count,
    totalMemories: memCount.count,
    totalFiles: fileCount.count,
    modelsUsed: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
    dailyUsage,
  });
});

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [memCount] = await db.select({ count: count() }).from(memoriesTable);
  const [fileCount] = await db.select({ count: count() }).from(filesTable);

  res.json({
    activeModels: 12,
    activeAgents: 6,
    memoryUsed: memCount.count,
    storageUsed: fileCount.count * 1024 * 1024,
    cpuUsage: 32,
    systemStatus: "Optimal",
  });
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(10);

  const now = Date.now();
  res.json(items.map(item => {
    const diff = now - item.createdAt.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const timeAgo = hours > 0 ? `${hours}h ago` : `${Math.max(1, mins)}m ago`;
    return {
      ...item,
      timeAgo,
      createdAt: item.createdAt.toISOString(),
    };
  }));
});

export default router;
