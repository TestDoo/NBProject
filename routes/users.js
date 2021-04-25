// users.js

var express = require("express");
var router = express.Router();
var User = require("../models/User");

// index
router.get("/", function (req, res) {
    User.find({})
        .sort({ username: 1 })
        .exec(function (err, users) {
            if (err) return res.json(err);
            res.render("users/index", { users: users });
        });
});

// 회원가입 페이지 렌더링 - New
router.get("/new", function (req, res) {
    var user = req.flash("user")[0] || {};
    var errors = req.flash("errors")[0] || {};
    res.render("users/new", { user: user, errors: errors });
});

// 회원가입 페이지에서 받은 요청 처리 - create
router.post("/", function (req, res) {
    User.create(req.body, function (err, user) {
        if (err) {
            req.flash("user", req.body);
            req.flash("errors", parseError(err));
            return res.redirect("/users/new");
        }
        res.redirect("/users");
    });
});

// 회원 상세 보기 - show
router.get("/:username", function (req, res) {
    User.findOne({ username: req.params.username }, function (err, user) {
        if (err) return res.json(err);
        res.render("users/show", { user: user });
    });
});

// 회원 수정 페이지 보여주는 라우터 - edit
router.get("/:username/edit", function (req, res) {
    var user = req.flash("user")[0];
    var errors = req.flash("errors")[0] || {};
    if (!user) {
        User.findOne({ username: req.params.username }, function (err, user) {
            if (err) return res.json(err);
            res.render("users/edit", { username: req.params.username, user: user, errors: errors });
        });
    } else {
        res.render("users/edit", { username: req.params.username, user: user, errors: errors });
    }
});

// 회원 정보 수정하는
router.put("/:username", function (req, res, next) {
    User.findOne({ username: req.params.username })
        .select("password") // DB에서 패스워드를 읽어오게 설정
        .exec(function (err, user) {
            if (err) return res.json(err);

            // 패스워드가 바뀔 수도 있고, 안 바뀔 수도 있기 때문에 설정
            // 새로운 패스워드가 설정됐다면 유저 패스워드에 저장 / 아니면 계속 유지
            user.originalPassword = user.password;
            user.password = req.body.newPassword ? req.body.newPassword : user.password;

            // 객체의 각 프로퍼티에 대해 한번씩 실행되는 for in문
            // user는 DB에서 읽어온 값, req.body는 실제 form에 입력된 값
            // 각 항목을 덮어 쓴다.
            for (var p in req.body) {
                user[p] = req.body[p];
            }
            console.log(user.originalPassword, "  ", user.password, user);
            // 업데이트 된 정보 save()로 저장하기
            user.save(function (err, user) {
                if (err) {
                    req.flash("user", req.body);
                    req.flash("errors", parseError(err));
                    return res.redirect("/users/" + req.params.username + "/edit");
                }
                res.redirect("/users/" + user.username);
            });
        });
});

// 회원탈퇴 - destroy
router.delete("/:username", function (req, res) {
    User.deleteOne({ username: req.params.username }, function (err) {
        if (err) return res.json(err);
        res.redirect("/users");
    });
});

module.exports = router;

// mongoose에서 내는 에러와 mongoBD에서 내는 에러의 형태를 통일시켜주는 함수
// {항목이름 : {message: "에러메시지"}} 형태로 출력됨
function parseError(errors) {
    var parsed = {};
    if (errors.name == "ValidationError") {
        for (var name in errors.errors) {
            var validationError = errors.errors[name];
            parsed[name] = { message: validationError.message };
        }
    } else if (errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
        parsed.username = { message: "This username already exists!" };
    } else {
        parsed.unhandled = JSON.stringify(errors);
    }
    return parsed;
}
