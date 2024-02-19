const express = require("express");
const router = express.Router();

const SlotsController = require("../controllers/SlotsController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* POST park vehicle. */
router.post("/park", async function (req, res, next) {
  try {
    const responseBody = await SlotsController.parkVehicle(req.body);

    res.status(200).json(responseBody);
  } catch (error) {
    res.status(500).json("Error 500");
  }
});

/* POST park vehicle. */
router.post("/unpark", async function (req, res, next) {
  try {
    const responseBody = await SlotsController.unparkVehicle(req.body);

    res.status(200).json(responseBody);
  } catch (error) {
    res.status(500).json("Error 500");
  }
});

module.exports = router;
