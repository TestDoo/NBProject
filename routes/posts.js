// posts.js

var express = require("express");
var router = express.Router();
var Post = require("../models/Post");

// 게시판 - Index
router.get("/", function (req, res) {
    Post.find({})
        .sort("-createdAt") // 정렬 방식
        .exec(function (err, posts) {
            if (err) return res.json(err); // 에러메시지 json형태로 출력
            res.render("posts/index", { posts: posts });
        });
});

// 글 작성 페이지 렌더 - New
router.get("/new", function (req, res) {
    res.render("posts/new");
});

// 글 작성하기 - create
router.post("/", function (req, res) {
    Post.create(req.body, function (err, post) {
        if (err) return res.json(err);
        res.redirect("/posts");
    });
});

// 글 상세보기 - show
router.get("/:id", function (req, res) {
    Post.findOne({ _id: req.params.id }, function (err, post) {
        if (err) return res.json(err);
        res.render("posts/show", { post: post });
    });
});

// 글 수정 페이지 렌더 - edit
router.get("/:id/edit", function (req, res) {
    Post.findOne({ _id: req.params.id }, function (err, post) {
        if (err) return res.json(err);
        res.render("posts/edit", { post: post });
    });
});

// 수정 사항 업데이트 하기 - update
router.put("/:id", function (req, res) {
    req.body.updatedAt = Date.now(); // 수정된 날짜 기록
    Post.findOneAndUpdate({ _id: req.params.id }, req.body, function (err, post) {
        if (err) return res.json(err);
        res.redirect("/posts/" + req.params.id);
    });
});

module.exports = router;
