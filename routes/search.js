const express = require("express");
const router = express.Router();
const search = require("../controllers/searchRouters");
const wrapAsync = require("../utils/wrapAsync");
const { validateSearch } = require("../middleware/validate");

router.get("/search", validateSearch, wrapAsync(search.search));

module.exports = router;
