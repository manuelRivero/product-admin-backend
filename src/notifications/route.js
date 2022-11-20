import {Router} from "express"
import { list } from "./controller";

const router = Router();

router.get("/", list.do)

module.exports = router