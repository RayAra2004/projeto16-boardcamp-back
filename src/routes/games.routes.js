import { Router } from "express";
import { getGames, postGame } from "../controllers/games.controllers.js";
import validateSchema from "../middlewares/validadeSchema.js";
import { gameSchema } from "../schemas/game.schemas.js";

const gamesRouter = Router();

gamesRouter.get("/games", getGames)
gamesRouter.post("/games", validateSchema(gameSchema), postGame)

export default gamesRouter;