// User.js

var mongoose = require("mongoose");

// 회원 비밀번호 암호화를 위한 패키지 - DB에 비밀번호를 그대로 저장하지 않고 hash 변환하여 저장한다.
var bcrypt = require("bcryptjs");

var userSchema = mongoose.Schema(
    {
        // trim항목은 문자열 앞뒤에 빈칸이 있는 경우 제거해 주는 옵션
        // match항목에 정규표현식을 넣어 여기에 부합하지 않으면 에러메시지 출력
        username: {
            type: String,
            required: [true, "회원 아이디는 필수입력 항목입니다."],
            match: [/^.{4,12}$/, "4자리에서 12자리 사이의 아이디를 설정해주세요."],
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: [true, "비밀번호는 필수입력 항목입니다."],
            select: false,
        },
        name: {
            type: String,
            match: [/^.{3,12}$/, "3자리에서 12자리 사이의 이름를 설정해주세요."],
            required: [true, "이름은 필수입력 항목입니다."],
        },
        email: {
            type: String,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "이메일 형식에 맞게 설정해주세요."],
            trim: true,
        },
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

var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
// 반복되는 에러 메시지 변수에 저장해서 쓰기
var passwordRegexErrorMessage = "알파벳과 숫자 조합으로 최소 8자여야 합니다!";

// 비밀번호 확인
userSchema.path("password").validate(function (v) {
    var user = this; // 여기서 this 유저 모델이다
    console.log("작동됩니까", user);

    // user.isNew는 해당 모델이 생성되는 경우에 true, 아니면 false값을 가진다
    // 회원가입시 새 모델 생성이므로 아직 서버에 없다 -> 그래서 true -> 아래 if문 진행
    if (user.isNew) {
        if (!user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "비밀번호를 확인해주세요!");
        }

        // 회원가입 중에 정규표현식을 통과하지 못했다면 진행되는 if문
        // 회원가입 중에 정규표현식.test(문자열) -> 정규표현식 통과시 true, 미통과시 false
        if (!passwordRegex.test(user.password)) {
            user.invalidate("password", passwordRegexErrorMessage);
        } else if (user.password !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "비밀번호가 일치하지 않습니다.");
        }
    }

    // 회원정보수정시 이미 서버에 모델이 있기 때문에 위에서는 false로 if문 넘어가고
    // 여기서는 논리부정 연산자를 통해 user.isNew가 false일 때 실행될 if문으로 진입하게 만든다.
    if (!user.isNew) {
        if (!user.currentPassword) {
            user.invalidate("currentPassword", "Current Password is required!");
        } else if (!bcrypt.compareSync(user.currentPassword, user.originalPassword)) {
            // bcrypt패키지의 compareSync함수를 통해 저장된 hash와 입력받은 비밀번호의 hash가 일치하는지 확인
            // currentPassword: 입력받은 비밀번호의 해시값, originalPassword: DB에 저장된 비밀번호의 해시값
            user.invalidate("currentPassword", "Current Password is invalid!");
        }

        if (user.newPassword && !passwordRegex.test(user.newPassword)) {
            // 회원 수정 중에 정규표현식을 통과하지 못했다면 진행되는 if문
            // 회원 수정 중에 정규표현식.test(문자열) -> 정규표현식 통과시 true, 미통과시 false
            user.invalidate("newPassword", passwordRegexErrorMessage);
        } else if (user.newPassword !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }
});

// 비밀번호 해쉬화
// model.create, model,save 함수 실행시 발생하는 save이벤트 실행 전에 실행되는 함수
userSchema.pre("save", function (next) {
    var user = this;
    if (!user.isModified("password")) {
        // 회원가입으로 인한 비밀번호 생성, 회원수정으로 인한 비밀번호 변경이 없는 경우 실행되는 문장
        return next();
    } else {
        // 회원가입 및 회원수정 시 실행되는 else문 유저의 해쉬값을 새로 입력받은 값으로 바꾼다.
        user.password = bcrypt.hashSync(user.password); //3-2
        return next();
    }
});

// 유저의 비밀번호 해쉬값과 입력받은 비밀번호 text를 비교하는 메소드 -> 로그인 시 사용
userSchema.methods.authenticate = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

// model & export
var User = mongoose.model("user", userSchema);
module.exports = User;
