import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import memoryRouter from "./memory";
import filesRouter from "./files";
import agentsRouter from "./agents";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(memoryRouter);
router.use(filesRouter);
router.use(agentsRouter);
router.use(analyticsRouter);

export default router;
