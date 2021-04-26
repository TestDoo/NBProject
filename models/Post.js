// Post.js

var mongoose = require("mongoose");

// schema
var postSchema = mongoose.Schema({
    // 1
    title: { type: String, required: [true, "제목을 입력해주세요!"] },
    body: { type: String, required: [true, "내용을 입력해주세요!"] },
    createdAt: { type: Date, default: Date.now }, // 2
    updatedAt: { type: Date },
});

// model & export
var Post = mongoose.model("post", postSchema);
module.exports = Post;
