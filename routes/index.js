import express from "express";
const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("Bienvenue sur l'api!");
});

export default router;
