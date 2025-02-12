import { Router } from "express";
import {
  createPerson,
  getPerson,
  deletePerson,
  updatePerson,
  getPersonById,
} from "../controllers/person.js";
import upload from "../config/multerConfig.js";

const personRouter = Router();

personRouter.post("/", upload.single("thumbnail"), createPerson);
personRouter.get("/", getPerson);
personRouter.get("/:id", getPersonById);
personRouter.delete("/:id", deletePerson);
personRouter.put("/:id", updatePerson);

export default personRouter;
