import { Router, type IRouter } from "express";

import authRouter from "./auth";
import categoriesRouter from "./categories";
import healthRouter from "./health";
import inventoryRouter from "./inventory";
import tasksRouter from "./tasks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(inventoryRouter);
router.use(tasksRouter);

export default router;
