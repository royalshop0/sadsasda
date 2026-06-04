import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, memoriesTable } from "@workspace/db";
import {
  ListMemoriesQueryParams,
  CreateMemoryBody,
  DeleteMemoryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/memory", async (req, res): Promise<void> => {
  const params = ListMemoriesQueryParams.safeParse(req.query);
  const search = params.success ? params.data.search : undefined;
  const memories = search
    ? await db.select().from(memoriesTable).where(
        or(ilike(memoriesTable.title, `%${search}%`), ilike(memoriesTable.content, `%${search}%`))
      )
    : await db.select().from(memoriesTable);
  res.json(memories.map(m => ({ ...m, createdAt: m.createdAt.toISOString() })));
});

router.post("/memory", async (req, res): Promise<void> => {
  const parsed = CreateMemoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [mem] = await db.insert(memoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...mem, createdAt: mem.createdAt.toISOString() });
});

// Delete single memory
router.delete("/memory/:id", async (req, res): Promise<void> => {
  const params = DeleteMemoryParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  await db.delete(memoriesTable).where(eq(memoriesTable.id, params.data.id));
  res.sendStatus(204);
});

// Delete ALL memories
router.delete("/memory", async (_req, res): Promise<void> => {
  await db.delete(memoriesTable);
  res.sendStatus(204);
});

export default router;
