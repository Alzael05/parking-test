const express = require("express");
const router = express.Router();

const SlotsController = require("../controllers/SlotsController");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* POST park vehicle. */
router.post("/park", function (req, res, next) {
  try {
    const responseMessage = SlotsController.parkVehicle(req.body);

    res.status(200).json(responseMessage);
  } catch (error) {
    res.status(500).json("Error 500");
  }
});

/* POST park vehicle. */
router.post("/unpark", function (req, res, next) {
  try {
    const responseMessage = SlotsController.unparkVehicle(req.body);

    res.status(200).json(responseMessage);
  } catch (error) {
    res.status(500).json("Error 500");
  }
});

module.exports = router;
