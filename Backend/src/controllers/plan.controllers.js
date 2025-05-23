import { Plan } from "../models/plan.model.js";

export const createPlan = async (req, res) => {
  try {
    const { planName, planPrice, planDuration, storageLimit } = req.body;

    if (
      planName === undefined ||
      planPrice === undefined ||
      planDuration === undefined ||
      storageLimit === undefined
    ) {
      return res.status(400).json({ message: "All fields are require" });
    }

    const newPlan = new Plan({
      planName,
      planPrice,
      planDuration,
      storageLimit,
    });
    await newPlan.save();

    return res
      .status(200)
      .json({ message: "New Plan added successfully", newPlan });
  } catch (error) {
    console.error("Can't add your Plan", error);
    return res
      .status(500)
      .json({ message: "getting while adding your new Plan" });
  }
};
