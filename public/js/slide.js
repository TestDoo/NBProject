// ===== slide JS code
const slideList = document.querySelector(".slide_list");
const slideContents = document.querySelectorAll(".slide_content");

const sildeBtnNext = document.querySelector(".slide_btn_next");
const slideBtnPrev = document.querySelector(".slide_btn_prev");

const pagination = document.querySelector(".slide_pagination");

const slideLength = slideContents.length;
// 이미지 크기 유동적으로 변환 -> CSS에서 수정 필수
const slideWidth = 1920;
const slideSpeed = 600;

const startNum = 0;

// 슬라이드 리스트의 너비는 1205px * 5+2(앞과 뒤에 복사해서 붙여 놓은 1,5번 슬라이드 복사본)만큼 가진다
slideList.style.width = slideWidth * (slideLength + 2) + "px";

// 슬라이드 이미지 수에 따른 pagination 동적 추가
let slideIndexNum = 0;
slideContents.forEach(function (el) {
    let li = document.createElement("li");
    let a = document.createElement("a");
    let text = document.createTextNode(slideIndexNum + 1 + "번 슬라이드");
    li.classList = "dot";
    li.setAttribute("data-index", slideIndexNum);
    a.href = "#";
    a.appendChild(text);
    li.appendChild(a);
    slideIndexNum += 1;
    pagination.appendChild(li);
});

const paginationItems = pagination.querySelectorAll("li > a");

// Copy first and last slide
let firstChild = slideList.firstElementChild;
let lastChild = slideList.lastElementChild;
let clonedFirst = firstChild.cloneNode(true);
let clonedLast = lastChild.cloneNode(true);

// Add copied Slides
slideList.appendChild(clonedFirst);
slideList.insertBefore(clonedLast, slideList.firstElementChild);

// 슬라이더가 한번 움직이면 1씩 증가한다.
let currentIndex = startNum;
let currentSlide = slideContents[currentIndex];
currentSlide.classList.add("slide_active");

// Next btn event
sildeBtnNext.addEventListener("click", function () {
    // next버튼을 눌렀을 때 슬라이더의 길이가 currentIndex보다 크거나 같다면..
    // sildeSpeed의 속도를 가지고 transform : translate3d(x축, y축, z축); 만큼 이동하는 if문
    // currentIndex 0, 1, 2, 3, 4 => 같거나를 준 이유 5번 슬라이더 옆에 복사해 둔 1번 복사본 까지 가려고
    if (currentIndex <= slideLength - 1) {
        slideList.style.transition = slideSpeed + "ms";
        // 1205px * 2, 3, 4, 5, 6 곱하여 나온 값까지 이동함
        // 6까지 한 이유는? 뒤에 1번 슬라이드를 붙여넣었기 때문에 7,230px까지 가야함
        slideList.style.transform = "translate3d(-" + slideWidth * (currentIndex + 2) + "px, 0px, 0px";
    }

    // 추가로 만약 현재인덱스(마지막 인덱스)와 총슬라이드(5-1 : 4) >> 5번 슬라이더에서 next 버튼이 눌렸을 때
    // 5번 슬라이더 뒤에 복사해놓은 1번 슬라이더 복사본으로 자연스럽게 넘어간 후 0.3초 후에
    // setTimeout()를 이용해 초기값인 1205px 위치로 0초 만에 순식간게 이동한다.
    if (currentIndex === slideLength - 1) {
        setTimeout(function () {
            slideList.style.transition = "0ms";
            slideList.style.transform = "translate3d(-" + slideWidth + "px, 0px, 0px)";
        }, slideSpeed);
        // -1을 대입한 이유는 밑에서 1을 증가시켜 주기 때문에
        // => 0.3초 후 0번 슬라이더 위치로 가기 때문에
        currentIndex = -1;
    }
    currentSlide.classList.remove("slide_active");
    console.log("Next버튼", currentIndex, "Index증가전=이전슬라이더");

    // 삼항조건식
    // 마지막 5번 슬라이더에서 넘어왔다면 5번 슬라이더에 붙어 있는 on 클래스를 제거
    // 그게 아니라면 현재 인덱스 번호의 on 클래스 제거 => 현재인덱스란 넘어오기 전 인덱스를 말함
    paginationItems[currentIndex === -1 ? slideLength - 1 : currentIndex].classList.remove("on");

    // Next버튼을 누른 후 현재 화면에 표시될 다음 슬라이드
    // slide_active클래스 적용 이유 : 활성화 됐다는 걸 표시하기 위해서
    // ++currentIndex => 이전에서 지금으로 넘어와 눈에 보이는 슬라이더 = 현재 슬라이더 번호를 뜻함
    currentSlide = slideContents[++currentIndex];
    currentSlide.classList.add("slide_active");

    // 현재 눈에 보이는 슬라이더에 on클래스 추가
    paginationItems[currentIndex].classList.add("on");
    console.log("Next버튼", currentIndex, "Index증가후=현재눈에보이는슬라이더");
});

// Prev btn event
slideBtnPrev.addEventListener("click", function () {
    if (currentIndex >= 0) {
        slideList.style.transition = slideSpeed + "ms";
        // transform : translate3d(x축, y축, z축); 만큼 이동한다
        slideList.style.transform = "translate3d(-" + slideWidth * currentIndex + "px, 0px, 0px";
    }

    // 1번 슬라이더에서 prev버튼이 눌렸다면..
    if (currentIndex === 0) {
        setTimeout(function () {
            slideList.style.transition = "0ms";
            // 5번 복사본에서 원본 5번 슬라이드 위치로 이동함
            slideList.style.transform = "translate3d(-" + slideWidth * slideLength + "px, 0px, 0px)";
        }, slideSpeed);
        // 그대로 slideLength를 준 이유는 아래에서 currentIndex를 1 감소시키기 때문에
        currentIndex = slideLength;
    }
    console.log("Prev버튼", currentIndex, "Index감소전=현재눈에보이는슬라이더");

    // currentIndex가 slideLength(=5)와 같다면 : 1번 슬라이더에서 prev버튼이 눌려 5번 슬라이더로 갔다면 -> paginationItems[0] = 1번 슬라이더에 on 클래스 제거
    // 그게 아니라면 넘어 오기 전 슬라이더의 on클래스 삭제
    paginationItems[currentIndex === slideLength ? 0 : currentIndex].classList.remove("on");

    // 이전 슬라이더에 붙은 액티브 클래스 삭제
    currentSlide.classList.remove("slide_active");
    currentSlide = slideContents[--currentIndex];
    currentSlide.classList.add("slide_active");
    paginationItems[currentIndex].classList.add("on");
    console.log("Prev버튼", currentIndex, "Index감소후=현재눈에보이는슬라이더");
});

// pagination Btn event
let currentDot;
paginationItems.forEach(function (el, i) {
    el.addEventListener("click", function (e) {
        e.preventDefault();
        currentDot = pagination.querySelector(".on");
        currentDot.classList.remove("on");

        currentDot = this;
        this.classList.add("on");

        currentSlide.classList.remove("slide_active");
        // currentIndex = Number(this.getAttribute("data-index"));
        currentIndex = i;
        console.log(currentIndex);
        currentSlide = slideContents[currentIndex];
        currentSlide.classList.add("slide_active");
        slideList.style.transition = slideSpeed + "ms";
        slideList.style.transform = "translate3d(-" + slideWidth * (currentIndex + 1) + "px, 0px, 0px";
    });
});

// 최초 실행 함수
function init() {
    // 초기 슬라이더 위치
    slideList.style.transform = "translate3d(-" + slideWidth * (startNum + 1) + "px, 0px, 0px";
    paginationItems[0].classList.add("on");
}

init();
