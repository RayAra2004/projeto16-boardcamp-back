import { Router } from "express";
import { getCustomer, getCustomers, postCustomer, putCustomer } from "../controllers/customers.controllers.js";
import validateSchema from "../middlewares/validadeSchema.js";
import { customersSchema } from "../schemas/customers.schemas.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getCustomer);
customersRouter.post("/customers", validateSchema(customersSchema), postCustomer);
customersRouter.put("/customers/:id", validateSchema(customersSchema), putCustomer);

export default customersRouter;