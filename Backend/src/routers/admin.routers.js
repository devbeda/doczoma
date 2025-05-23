import {Router} from "express"
import { deletePlan, getPlans, getUsers, updatePlan } from "../controllers/admin.controllers.js"
import { createPlan } from "../controllers/plan.controllers.js";

const router = Router()

router.get("/getplan", getPlans);
router.post("/createplan", createPlan);
router.put("/updateplan/:id", updatePlan);
router.delete("/deleteplan/:id", deletePlan);

router.get("/getusers", getUsers);

export default router;