import { Router, type IRouter } from "express";

const router: IRouter = Router();

const AGENTS = [
  {
    id: "builder",
    name: "Builder Agent",
    description: "Designs and builds full applications, UI components, and systems from natural language",
    category: "Construction",
    isActive: true,
    tasksCompleted: 247,
  },
  {
    id: "coding",
    name: "Coding Agent",
    description: "Generates, debugs, refactors and explains code across all major languages",
    category: "Development",
    isActive: true,
    tasksCompleted: 1842,
  },
  {
    id: "research",
    name: "Research Agent",
    description: "Deep-dives into topics, synthesizes sources and generates comprehensive reports",
    category: "Intelligence",
    isActive: true,
    tasksCompleted: 523,
  },
  {
    id: "business",
    name: "Business Agent",
    description: "Analyzes markets, drafts strategies, and produces business documents",
    category: "Strategy",
    isActive: false,
    tasksCompleted: 89,
  },
];

router.get("/agents", async (_req, res): Promise<void> => {
  res.json(AGENTS);
});

export default router;
