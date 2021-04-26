var express = require("express");
var router = express.Router();
var passport = require("../config/passport");

// 메인 페이지
router.get("/", function (req, res) {
    // 경로에 views를 안 쓴 이유 : express가 기본적으로 views폴더에서 파일을 찾아 준다
    res.render("home/main");
});

// 로그인 view 보여주는 라우트
router.get("/login", function (req, res) {
    var username = req.flash("username")[0];
    var errors = req.flash("errors")[0] || {};
    res.render("home/login", {
        username: username,
        errors: errors,
    });
});

// 로그인 처리해주는 라우트 - 두 개의 콜백함수를 가진다.
router.post(
    "/login",
    // form의 validation을 위한 함수
    function (req, res, next) {
        var errors = {};
        var isValid = true;

        // 아무것도 입력하지 않았다면 출력함
        if (!req.body.username) {
            isValid = false;
            errors.username = "아이디는 필수입력항목입니다.";
        }
        if (!req.body.password) {
            isValid = false;
            errors.password = "비밀번호는 필수입력항목입니다.";
        }

        // 별다른 문제가 없으면 다음 콜백함수로 넘어가 로그인 진행
        if (isValid) {
            next();
        } else {
            req.flash("errors", errors);
            res.redirect("/login");
        }
    },
    // passport local strategy를 호출해서 authentication(로그인)을 진행하는 함수
    passport.authenticate("local-login", {
        successRedirect: "/posts",
        failureRedirect: "/login",
    })
);

// 로그아웃 - passport에서 제공해주는 logout함수
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;
