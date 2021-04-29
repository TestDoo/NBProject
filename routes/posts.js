// posts.js

var express = require("express");
var router = express.Router();
var Post = require("../models/Post");
var util = require("../util");

// 게시판 - Index
// model.populate() : relationship이 형성되어 있는 항목의 값을 생성해 주는 함수이다.
// post의 author에 user의 id가 기록되어 있음 - 이 값을 바탕으로 실제로 user의 값을 author에 생성하게 됨
router.get("/", async function (req, res) {
    // parseInt 문자열로 전달돼 숫자가 아닐수도 있어서
    // page, limt는 무조건 양수기 때문에 Math.max 함수 사용
    var page = Math.max(1, parseInt(req.query.page)); // 전달 받은 값이 없으면 기본 1이 부여된다.
    var limit = Math.max(1, parseInt(req.query.limit)); // index.ejs -> 표시될게시물 form에서 전달되는 option value값 name은 limit

    // 만약 정수로 변환될 수 없는 값이 page,limit에 오는 경우 기본값 설정
    // isNaN(value) -> value값이 숫자가 아니면 true, 숫자면 false 반환
    page = !isNaN(page) ? page : 1;
    limit = !isNaN(limit) ? limit : 10;

    var skip = (page - 1) * limit; // 무시할 게시물의 수를 담는 변수?

    // Post.countDocuments()가 완료될 때까지 다음 코드를 진행하지 않고 기다렸다가 완료될 때 결과값을 반환한다. Post.countDocuments() -> {}조건에 해당하는 post의 수를 DB에서 읽어와 변수 count에 담는다
    var count = await Post.countDocuments({});

    // 전체 게시물 수 / 한 페이지당 표시 게시물 수 => maxPage변수에 담기
    var maxPage = Math.ceil(count / limit);

    // 검색된 posts를 posts 변수에 담는다.
    var posts = await Post.find({})
        .populate("write")
        .sort("-createdAt") // 정렬 방식
        .skip(skip) // skip함수는 일정한 수만큼 검색된 결과를 무시하는 함수
        .limit(limit) // limit함수는 일정한 수만큼만 검색된 결과를 보여주는 함수
        .exec();

    // view에 뿌려준다. => index.ejs
    res.render("posts/index", {
        posts: posts,
        currentPage: page,
        maxPage: maxPage,
        limit: limit,
    });
});

// 글 작성 페이지 렌더 - New
router.get("/new", util.isLoggedin, function (req, res) {
    var post = req.flash("post")[0] || {};
    var errors = req.flash("errors")[0] || {};
    res.render("posts/new", { post: post, errors: errors });
});

// 글 작성하기 - create
router.post("/", util.isLoggedin, function (req, res) {
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
router.get("/:id/edit", util.isLoggedin, checkPermission, function (req, res) {
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
router.put("/:id", util.isLoggedin, checkPermission, function (req, res) {
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
router.delete("/:id", util.isLoggedin, checkPermission, function (req, res) {
    Post.deleteOne({ _id: req.params.id }, function (err) {
        if (err) return res.json(err);
        res.redirect("/posts");
    });
});

// 해당 게시물에 기록된 write와 로그인된 user.id를 비교해서 같은 경우에만 계속 진행시키고 - next(), 만약 다르면 util.noPermission함수를 호출하여 login 화면으로 돌려보낸다.
function checkPermission(req, res, next) {
    Post.findOne({ _id: req.params.id }, function (err, post) {
        if (err) return res.json(err);
        if (post.write != req.user.id) return util.noPermission(req, res);
        next();
    });
}

module.exports = router;
