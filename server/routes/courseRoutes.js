import express from "express";
import { getAllCourses } from "../controllers/courseController.js";

const courseRouter = express.Router();

courseRouter.get("/all", getAllCourses);

courseRouter.get("/:id", getAllCourses);

export default courseRouter;
