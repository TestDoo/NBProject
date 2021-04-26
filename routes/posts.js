// posts.js

var express = require("express");
var router = express.Router();
var Post = require("../models/Post");
var util = require("../util");

// 게시판 - Index
// model.populate() : relationship이 형성되어 있는 항목의 값을 생성해 주는 함수이다.
// post의 author에 user의 id가 기록되어 있음 - 이 값을 바탕으로 실제로 user의 값을 author에 생성하게 됨
router.get("/", function (req, res) {
    Post.find({})
        .populate("write")
        .sort("-createdAt") // 정렬 방식
        .exec(function (err, posts) {
            if (err) return res.json(err); // 에러메시지 json형태로 출력
            res.render("posts/index", { posts: posts });
        });
});

// 글 작성 페이지 렌더 - New
router.get("/new", function (req, res) {
    var post = req.flash("post")[0] || {};
    var errors = req.flash("errors")[0] || {};
    res.render("posts/new", { post: post, errors: errors });
});

// 글 작성하기 - create
router.post("/", function (req, res) {
    req.body.write = req.user._id;
    Post.create(req.body, function (err, post) {
        if (err) {
            req.flash("post", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/posts/new");
        }
        res.redirect("/posts");
    });
});

// 글 상세보기 - show
router.get("/:id", function (req, res) {
    Post.findOne({ _id: req.params.id })
        .populate("write")
        .exec(function (err, post) {
            if (err) return res.json(err);
            res.render("posts/show", { post: post });
        });
});

// 글 수정 페이지 렌더 - edit
router.get("/:id/edit", function (req, res) {
    var post = req.flash("post")[0];
    var errors = req.flash("errors")[0] || {};
    if (!post) {
        Post.findOne({ _id: req.params.id }, function (err, post) {
            if (err) return res.json(err);
            res.render("posts/edit", { post: post, errors: errors });
        });
    } else {
        post._id = req.params.id;
        res.render("posts/edit", { post: post, errors: errors });
    }
});

// 수정 사항 업데이트 하기 - update
router.put("/:id", function (req, res) {
    req.body.updatedAt = Date.now();
    // .findOneAndUpdate() 함수는 기본적으로 vaildation이 작동하지 안도록 설정되어 있기 때문에 { runValidators: true } 옵션을 추가해 vaildation이 작동하도록 설정함
    Post.findOneAndUpdate({ _id: req.params.id }, req.body, { runValidators: true }, function (err, post) {
        if (err) {
            req.flash("post", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/posts/" + req.params.id + "/edit");
        }
        res.redirect("/posts/" + req.params.id);
    });
});

// 글 삭제하기 - destroy
router.delete("/:id", function (req, res) {
    Post.deleteOne({ _id: req.params.id }, function (err) {
        if (err) return res.json(err);
        res.redirect("/posts");
    });
});

module.exports = router;
