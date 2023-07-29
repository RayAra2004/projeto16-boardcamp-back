import { Router } from "express";
import { postRentals } from "../controllers/rentals.controllers.js";
import validateSchema from "../middlewares/validadeSchema.js";
import { rentalSchema } from "../schemas/rentals.schemas.js";

const rentalsRouter = Router();

rentalsRouter.post("/rentals", validateSchema(rentalSchema), postRentals)

export default rentalsRouter;