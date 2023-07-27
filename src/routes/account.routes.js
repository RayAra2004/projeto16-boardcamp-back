import { Router } from "express";
import validateAuth from "../middlewares/validateAuth.js";
import { signUp, signIn, logout, getUserInfo } from "../controllers/account.controller.js";
import validateSchema from "../middlewares/validadeSchema.js";
import { SignInSchema, SignUpSchema } from "../schemas/account.schemas.js";

const accountRouter = Router();

accountRouter.post('/cadastro', validateSchema(SignUpSchema), signUp);
accountRouter.post('/login', validateSchema(SignInSchema), signIn);
accountRouter.post('/logout', validateAuth, logout);
accountRouter.get('/info-usuario',getUserInfo);

export default accountRouter;