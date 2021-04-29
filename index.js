var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("./config/passport");
var app = express();

// 몽고 디비 기본셋팅
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

// DB Setting
mongoose.connect(process.env.MONGO_DB); // DB 연결
var db = mongoose.connection; // DB 객체를 변수에 저장
db.once("open", function () {
    // DB 성공적 연결시 메시지 출력
    console.log("DB connected");
});
db.on("error", function (err) {
    // DB 연결 중 에러 발생 시 에러 메시지 출력
    console.log("DB ERROR : ", err);
});

// Other Settings
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// flash는 변수처럼 이름과 값을 저장할 수 있는데, 한번 생성되고 서버 메모리에 저장돼 있다가 한번 사용하면 사라지는 형태
app.use(flash());
// secret은 session을 해쉬화 하는데 사용하는 값
app.use(session({ secret: "MySecret", resave: true, saveUninitialized: true }));

// Passport 로그인 관련 패키지
app.use(passport.initialize());
// passport와 session 연결시킴
app.use(passport.session());
app.use(function (req, res, next) {
    // req.isAuthenticated(); 현재 로그인 했는지 안했는지를 true, false로 return하는 함수
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});

// Routes
// app.use -> 서버에 요청이 올 때마다 무조건 콜백함수 실행 -> 각 라우트 파일로 가서 처리된다
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts"));
app.use("/users", require("./routes/users"));

// Port Setting
var port = 3000;
app.listen(port, function () {
    console.log("server on! http://localhost:" + port);
});
