import { Router } from "express";
import productRouter from "./product.routes.js";
import accountRouter from "./account.routes.js"
import buyRouter from "./buy.routes.js";
import homeRouter from "./home.routes.js";

const router = Router();

router.use(accountRouter);
router.use(productRouter);
router.use(buyRouter);
router.use(homeRouter);


export default router;
