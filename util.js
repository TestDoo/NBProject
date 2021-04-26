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
        parsed.username = { message: "This username already exists!" };
    } else {
        parsed.unhandled = JSON.stringify(errors);
    }
    return parsed;
};

module.exports = util;
