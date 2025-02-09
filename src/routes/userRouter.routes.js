import { Router } from "express";
import { linkContacts } from "../controllers/user.controller.js";

const router = new Router()

router.route("/identify").post(linkContacts)

export default router