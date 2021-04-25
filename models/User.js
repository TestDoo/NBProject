// User.js

var mongoose = require("mongoose");

var userSchema = mongoose.Schema(
    {
        username: { type: String, required: [true, "Username is required!"], unique: true },
        password: { type: String, required: [true, "Password is required!"], select: false },
        name: { type: String, required: [true, "Name is required!"] },
        email: { type: String },
    },
    {
        toObject: { virtuals: true },
    }
);

// virtuals - DB에 굳이 저장 안해도 되는 것들 정리
userSchema
    .virtual("passwordConfirmation")
    .get(function () {
        return this._passwordConfirmation;
    })
    .set(function (value) {
        this._passwordConfirmation = value;
    });

userSchema
    .virtual("originalPassword")
    .get(function () {
        return this._originalPassword;
    })
    .set(function (value) {
        this._originalPassword = value;
    });

userSchema
    .virtual("currentPassword")
    .get(function () {
        return this._currentPassword;
    })
    .set(function (value) {
        this._currentPassword = value;
    });

userSchema
    .virtual("newPassword")
    .get(function () {
        return this._newPassword;
    })
    .set(function (value) {
        this._newPassword = value;
    });

// 비밀번호 확인
userSchema.path("password").validate(function (v) {
    var user = this; // 여기서 this 유저 모델이다

    // user.isNew는 해당 모델이 생성되는 경우에 true, 아니면 false값을 가진다
    // 회원가입시 새 모델 생성이므로 아직 서버에 없다 -> 그래서 true -> 아래 if문 진행
    if (user.isNew) {
        if (!user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "비밀번호를 확인해주세요!");
        }

        if (user.password !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "비밀번호가 일치하지 않습니다!");
        }
    }

    // 회원정보수정시 이미 서버에 모델이 있기 때문에 위에서는 false로 if문 넘어가고
    // 여기서는 논리부정 연산자를 통해 user.isNew가 false일 때 실행될 if문으로 진입하게 만든다.
    if (!user.isNew) {
        if (!user.currentPassword) {
            user.invalidate("currentPassword", "현재 비밀번호가 필요합니다!");
        } else if (user.currentPassword != user.originalPassword) {
            user.invalidate("currentPassword", "현재 비밀번호가 잘못됐습니다!");
        }

        if (user.newPassword !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "비밀번호가 일치하지 않습니다!");
        }
    }
});

// model & export
var User = mongoose.model("user", userSchema);
module.exports = User;
