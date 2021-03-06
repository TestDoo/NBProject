// Post.js

var mongoose = require("mongoose");
var Counter = require("./Counter");

// schema
var postSchema = mongoose.Schema({
    // 1
    title: { type: String, required: [true, "제목을 입력해주세요!"] },
    body: { type: String, required: [true, "내용을 입력해주세요!"] },
    // ref: 'user' - 유저 컬렉션의 id와 연결됨을 mongoose에 알리는 옵션
    // user의 user.id와 post의 post.author가 연결돼 관계를 형성한다.
    // user 스키마 사용자 ObjectId가 들어간다는 뜻
    write: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    views: { type: Number, default: 0 },
    numId: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});

postSchema.pre("save", async function (next) {
    var post = this;
    if (post.isNew) {
        counter = await Counter.findOne({ name: "posts" }).exec();
        if (!counter) counter = await Counter.create({ name: "posts" });
        counter.count++;
        counter.save();
        post.numId = counter.count;
    }
    return next();
});

// model & export
var Post = mongoose.model("post", postSchema);
module.exports = Post;
