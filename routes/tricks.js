import express from "express";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Page des tricks");
});

export default router;