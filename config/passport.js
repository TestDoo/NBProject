// config/passport.js

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/User");

// passport.serializeUser() - login시 DB에서 발견한 user를 어떻게 session에 저장할지 정하는 부분 -> 유저의 아이디만 저장한다.
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
// passport.deserializeUser() - request시에 session에서 어떻게 user 오브젝트를 만들지 정하는 부분
passport.deserializeUser(function (id, done) {
    User.findOne({ _id: id }, function (err, user) {
        done(err, user);
    });
});

// local strategy
// local-login은 뒤의 LocalStrategy에 이름을 부여한 것. home.js에서 local-login인이 호출되면 이 함수가 실행된다.
passport.use(
    "local-login",
    new LocalStrategy(
        {
            usernameField: "username",
            passwordField: "password",
            passReqToCallback: true,
        },
        // 로그인 시 이 함수가 호출됨
        function (req, username, password, done) {
            User.findOne({ username: username })
                .select({ password: 1 })
                // 여기서 user가 전달되지 않으면 local-strategy는 실패로 간주됨
                .exec(function (err, user) {
                    if (err) return done(err);

                    // user.authenticate(password) 입력받은 패스워드와 저장된 패스워드 해쉬를 비교함
                    if (user && user.authenticate(password)) {
                        // 일치하면 해당 user를 done에 담아서 return
                        return done(null, user);
                    } else {
                        // 일치하지 않으면 username flash와 에러 flash를 생성해 done에 담아 return
                        req.flash("username", username);
                        req.flash("errors", { login: "The username or password is incorrect." });
                        return done(null, false);
                    }
                });
        }
    )
);

module.exports = passport;
