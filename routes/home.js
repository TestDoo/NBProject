var express = require("express");
var router = express.Router();

// Home
router.get("/", function (req, res) {
    // 경로에 views를 안 쓴 이유 : express가 기본적으로 views폴더에서 파일을 찾아 준다
    res.render("home/main");
});

module.exports = router;
