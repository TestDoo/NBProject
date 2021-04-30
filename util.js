var util = {};

// mongoose에서 내는 에러와 mongoBD에서 내는 에러의 형태를 통일시켜주는 함수
// {항목이름 : {message: "에러메시지"}} 형태로 출력됨
util.parseError = function (errors) {
    var parsed = {};
    if (errors.name == "ValidationError") {
        for (var name in errors.errors) {
            var validationError = errors.errors[name];
            parsed[name] = { message: validationError.message };
        }
    } else if (errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
        parsed.username = { message: "이 아이디는 중복된 아이디입니다!" };
    } else {
        parsed.unhandled = JSON.stringify(errors);
    }
    return parsed;
};

// 사용자가 로그인 했는지 아닌지를 판단 -> 로그인 되지 않을 경우 에러 메시지와 함께 로그인 페이지로 보내버린다.
util.isLoggedin = function (req, res, next) {
    if (req.isAuthenticated()) {
        // 로그인이 된 상태라면 다음 콜백함수 진행
        next();
    } else {
        req.flash("errors", { login: "먼저 로그인을 해주세요!" });
        res.redirect("/login");
    }
};

// 어떠한 route에 접근권한이 없다고 판단된 경우에 호출되어 에러 메세지와 함께 로그인 페이지로 보내버리는 함수
util.noPermission = function (req, res) {
    req.flash("errors", { login: "당신은 권한을 가지고 있지 않습니다." });
    req.logout();
    res.redirect("/login");
};

util.getPostQueryString = function (req, res, next) {
    // res.locals에 추가된 함수or변수는 view에서 바로 사용할 수 있고, route에서도 사용 가능
    res.locals.getPostQueryString = function (isAppended = false, overwrites = {}) {
        var queryString = "";
        var queryArray = [];
        var page = overwrites.page ? overwrites.page : req.query.page ? req.query.page : "";
        var limit = overwrites.limit ? overwrites.limit : req.query.limit ? req.query.limit : "";

        if (page) queryArray.push("page=" + page);
        if (limit) queryArray.push("limit=" + limit);

        if (queryArray.length > 0) queryString = (isAppended ? "&" : "?") + queryArray.join("&");

        return queryString;
    };
    next();
};

module.exports = util;
