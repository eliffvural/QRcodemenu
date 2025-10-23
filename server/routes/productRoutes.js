const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middleware/upload");

router.post("/", upload.single('image'), productController.createProduct);
router.get("/", productController.getAllProducts);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
