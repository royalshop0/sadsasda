import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, filesTable } from "@workspace/db";
import { DeleteFileParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/files", async (req, res): Promise<void> => {
  const files = await db.select().from(filesTable);
  res.json(files.map(f => ({ ...f, createdAt: f.createdAt.toISOString() })));
});

router.delete("/files/:id", async (req, res): Promise<void> => {
  const params = DeleteFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(filesTable).where(eq(filesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
