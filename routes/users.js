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
    res.render("users/new");
});

// 회원가입 페이지 - create
router.post("/", function (req, res) {
    User.create(req.body, function (err, user) {
        if (err) return res.json(err);
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

// 회원 수정 페이지 렌더 - edit
router.get("/:username/edit", function (req, res) {
    User.findOne({ username: req.params.username }, function (err, user) {
        if (err) return res.json(err);
        res.render("users/edit", { user: user });
    });
});

// 회원 정보가 완료돼 업데이트 요청이 오면 실행되는 라우터
router.put("/:username", function (req, res, next) {
    User.findOne({ username: req.params.username })
        .select("password") // DB에서 패스워드를 읽어오게 설정
        .exec(function (err, user) {
            if (err) return res.json(err);

            // 유저 정보 업데이트 해주기
            user.originalPassword = user.password;
            // 패스워드가 바뀔 수도 있고, 안 바뀔 수도 있기 때문에 설정
            // 새로운 패스워드가 설정됐다면 유저 패스워드에 저장 / 아니면 계속 유지
            user.password = req.body.newPassword ? req.body.newPassword : user.password;
            console.log(req.body);
            for (var p in req.body) {
                // 객체의 각 프로퍼티에 대해 한번씩 실행되는 for in문

                // user는 DB에서 읽어온 값, req.body는 실제 form에 입력된 값
                // 각 항목을 덮어 쓴다.
                user[p] = req.body[p];
            }

            // 업데이트 된 정보 save()로 저장하기
            user.save(function (err, user) {
                if (err) return res.json(err);
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
