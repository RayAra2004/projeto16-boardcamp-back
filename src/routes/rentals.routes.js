import { Router } from "express";
import { deleteRental, finalizeRent, getRentals, postRentals } from "../controllers/rentals.controllers.js";
import validateSchema from "../middlewares/validadeSchema.js";
import { rentalSchema } from "../schemas/rentals.schemas.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals)
rentalsRouter.post("/rentals", validateSchema(rentalSchema), postRentals)
rentalsRouter.post("/rentals/:id/return", finalizeRent)
rentalsRouter.delete("/rentals/:id", deleteRental)

export default rentalsRouter;