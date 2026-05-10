/* =========================
   Google Sheets CSV 링크
   cars   = 전체 튜닝 차량 DB
   weekly = 페스티벌 추천 차량 게시용
========================= */

const CARS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbFvBegPwsW2UpUTUMyA8peYLKihKS9HJLqworTV6zC1Zxa96tT7643TsHxVWSTYEKHRtyDSdrD-C3/pub?gid=0&single=true&output=csv";

const WEEKLY_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbFvBegPwsW2UpUTUMyA8peYLKihKS9HJLqworTV6zC1Zxa96tT7643TsHxVWSTYEKHRtyDSdrD-C3/pub?gid=620032495&single=true&output=csv";


/* =========================
   테스트 트랙 표시 이름
   나중에 실제 트랙 이름이 정해지면 여기만 바꾸면 됨
========================= */

const TRACK_A_NAME = "테스트 트랙 A";
const TRACK_B_NAME = "테스트 트랙 B";


/* =========================
   HTML 요소 가져오기
========================= */

const carGrid = document.getElementById("carGrid");
const weeklyGrid = document.getElementById("weeklyGrid");
const averageGrid = document.getElementById("averageGrid");
const weeklyTitle = document.getElementById("weeklyTitle");
const carCount = document.getElementById("carCount");

const searchInput = document.getElementById("searchInput");
const classFilter = document.getElementById("classFilter");
const typeFilter = document.getElementById("typeFilter");
const driveFilter = document.getElementById("driveFilter");
const categoryFilter = document.getElementById("categoryFilter");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");


/* =========================
   차량 데이터 저장용 배열
========================= */

let cars = [];
let weeklyCars = [];


/* =========================
   구글 시트 데이터 전체 불러오기
========================= */

async function loadAllData() {
  try {
    carGrid.innerHTML = `<div class="empty">전체 차량 데이터를 불러오는 중입니다...</div>`;
    weeklyGrid.innerHTML = `<div class="weekly-empty">페스티벌 튜닝차량 데이터를 불러오는 중입니다...</div>`;

    if (averageGrid) {
      averageGrid.innerHTML = `<div class="weekly-empty">PI별 평균 기록을 계산하는 중입니다...</div>`;
    }

    carCount.textContent = "불러오는 중";

    const [carsResponse, weeklyResponse] = await Promise.all([
      fetch(CARS_CSV_URL),
      fetch(WEEKLY_CSV_URL)
    ]);

    if (!carsResponse.ok) {
      throw new Error("전체 차량 CSV 데이터를 불러오지 못했습니다.");
    }

    if (!weeklyResponse.ok) {
      throw new Error("페스티벌 차량 CSV 데이터를 불러오지 못했습니다.");
    }

    const carsCsvText = await carsResponse.text();
    const weeklyCsvText = await weeklyResponse.text();

    cars = parseCars(carsCsvText);
    weeklyCars = parseCars(weeklyCsvText);

    renderWeeklyCars();
    renderAverageStats();
    renderCars();
  } catch (error) {
    console.error(error);
    renderLoadError();
  }
}


/* =========================
   불러오기 실패 화면
========================= */

function renderLoadError() {
  carCount.textContent = "불러오기 실패";

  carGrid.innerHTML = `
    <div class="empty">
      전체 차량 데이터를 불러오지 못했습니다.<br>
      CSV 링크 또는 cars 시트 게시 상태를 확인해주세요.
    </div>
  `;

  weeklyGrid.innerHTML = `
    <div class="weekly-empty">
      페스티벌 튜닝차량 데이터를 불러오지 못했습니다.<br>
      CSV 링크 또는 weekly 시트 게시 상태를 확인해주세요.
    </div>
  `;

  if (averageGrid) {
    averageGrid.innerHTML = `
      <div class="weekly-empty">
        PI별 평균 기록을 계산하지 못했습니다.
      </div>
    `;
  }
}


/* =========================
   CSV 텍스트를 차량 객체 배열로 변환
========================= */

function parseCars(csvText) {
  return parseCSV(csvText)
    .map((row) => ({
      eventTitle: cleanValue(row.eventTitle),
      id: cleanValue(row.id),
      manufacturer: cleanValue(row.manufacturer),
      carName: cleanValue(row.carName),
      className: cleanValue(row.className),
      carType: cleanValue(row.carType),
      drive: cleanValue(row.drive),
      category: cleanValue(row.category),
      concept: cleanValue(row.concept),
      power: cleanValue(row.power),
      weight: cleanValue(row.weight),
      lateralG: cleanValue(row.lateralG),
      shareCode: cleanValue(row.shareCode),
      summary: cleanValue(row.summary),
      tuneNotes: cleanValue(row.tuneNotes),
      updatedAt: cleanValue(row.updatedAt),
      testTrackATime: cleanValue(row.testTrackATime),
      testTrackBTime: cleanValue(row.testTrackBTime)
    }))
    .filter((car) => car.id || car.carName || car.manufacturer);
}


/* =========================
   빈 값 정리
========================= */

function cleanValue(value) {
  return value ? value.trim() : "";
}


/* =========================
   CSV 파서
   쉼표와 따옴표가 들어간 CSV도 어느 정도 처리 가능
========================= */

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentValue += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }

      currentRow.push(currentValue);

      if (currentRow.some((value) => value.trim() !== "")) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  currentRow.push(currentValue);

  if (currentRow.some((value) => value.trim() !== "")) {
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());

  return rows.slice(1).map((row) => {
    const rowObject = {};

    headers.forEach((header, index) => {
      rowObject[header] = row[index] || "";
    });

    return rowObject;
  });
}


/* =========================
   랩타임 변환
   예: 1:12.438 → 72.438초
========================= */

function lapTimeToSeconds(timeText) {
  if (!timeText) return null;

  const text = timeText.trim();

  if (!text) return null;

  const parts = text.split(":");

  if (parts.length !== 2) {
    return null;
  }

  const minutes = Number(parts[0]);
  const seconds = Number(parts[1]);

  if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
    return null;
  }

  return minutes * 60 + seconds;
}


/* =========================
   초 단위 값을 랩타임 형식으로 변환
   예: 72.438 → 1:12.438
========================= */

function secondsToLapTime(totalSeconds) {
  if (totalSeconds === null || Number.isNaN(totalSeconds)) {
    return "기록 없음";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;

  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}


/* =========================
   PI 순서 정렬용
========================= */

function sortPI(pi) {
  const order = {
    "D500": 1,
    "C600": 2,
    "B700": 3,
    "A800": 4,
    "S1 900": 5,
    "S2 998": 6
  };

  return order[pi] || 999;
}


/* =========================
   PI별 평균 기록 계산
========================= */

function calculateAverageByPI(trackKey) {
  const groups = {};

  cars.forEach((car) => {
    const pi = car.className;
    const seconds = lapTimeToSeconds(car[trackKey]);

    if (!pi || seconds === null) return;

    if (!groups[pi]) {
      groups[pi] = [];
    }

    groups[pi].push(seconds);
  });

  return Object.entries(groups)
    .map(([pi, values]) => {
      const sum = values.reduce((total, value) => total + value, 0);
      const average = sum / values.length;

      return {
        pi,
        average,
        count: values.length
      };
    })
    .sort((a, b) => sortPI(a.pi) - sortPI(b.pi));
}


/* =========================
   PI별 평균 기록 섹션 표시
========================= */

function renderAverageStats() {
  if (!averageGrid) return;

  const trackAAverages = calculateAverageByPI("testTrackATime");
  const trackBAverages = calculateAverageByPI("testTrackBTime");

  averageGrid.innerHTML = `
    ${renderAverageCard(TRACK_A_NAME, trackAAverages)}
    ${renderAverageCard(TRACK_B_NAME, trackBAverages)}
  `;
}


function renderAverageCard(trackName, averages) {
  if (averages.length === 0) {
    return `
      <article class="average-card">
        <h3>${trackName}</h3>
        <div class="weekly-empty">아직 기록이 없습니다.</div>
      </article>
    `;
  }

  return `
    <article class="average-card">
      <h3>${trackName}</h3>
      <div class="average-list">
        ${averages
          .map(
            (item) => `
            <div class="average-row">
              <span>${item.pi} 평균 · ${item.count}대</span>
              <span>${secondsToLapTime(item.average)}</span>
            </div>
          `
          )
          .join("")}
      </div>
    </article>
  `;
}


/* =========================
   페스티벌 튜닝차량 섹션 표시
========================= */

function renderWeeklyCars() {
  const titleFromSheet = weeklyCars.find((car) => car.eventTitle)?.eventTitle;

  weeklyTitle.textContent = titleFromSheet || "페스티벌 튜닝차량";

  if (weeklyCars.length === 0) {
    weeklyGrid.innerHTML = `<div class="weekly-empty">페스티벌 튜닝차량이 아직 등록되지 않았습니다.</div>`;
    return;
  }

  weeklyGrid.innerHTML = weeklyCars
    .map(
      (car) => `
      <article class="weekly-card" onclick="openCarDetail('${escapeAttribute(car.id)}', 'weekly')">
        ${renderBadges(car)}

        <p class="manufacturer">${escapeHTML(car.manufacturer || "제조사 미입력")}</p>
        <h3>${escapeHTML(car.carName || "차량명 미입력")}</h3>

        <p class="share-code">공유 코드: ${escapeHTML(car.shareCode || "미입력")}</p>
        ${renderTrackTimeLine(TRACK_A_NAME, car.testTrackATime)}
        ${renderTrackTimeLine(TRACK_B_NAME, car.testTrackBTime)}

        <p class="summary">${escapeHTML(car.summary || "페스티벌용 설명이 아직 입력되지 않았습니다.")}</p>
      </article>
    `
    )
    .join("");
}


/* =========================
   전체 차량 카드 목록 표시
========================= */

function renderCars() {
  const keyword = searchInput.value.toLowerCase().trim();
  const selectedClass = classFilter.value;
  const selectedType = typeFilter.value;
  const selectedDrive = driveFilter.value;
  const selectedCategory = categoryFilter.value;

  const filteredCars = cars.filter((car) => {
    const searchableText = `
      ${car.carName}
      ${car.manufacturer}
      ${car.carType}
      ${car.drive}
      ${car.category}
      ${car.shareCode}
      ${car.lateralG}
      ${car.testTrackATime}
      ${car.testTrackBTime}
      ${car.concept}
      ${car.summary}
      ${car.tuneNotes}
    `.toLowerCase();

    const matchesKeyword = searchableText.includes(keyword);
    const matchesClass = selectedClass === "all" || car.className === selectedClass;
    const matchesType = selectedType === "all" || car.carType === selectedType;
    const matchesDrive = selectedDrive === "all" || car.drive === selectedDrive;
    const matchesCategory = selectedCategory === "all" || car.category === selectedCategory;

    return matchesKeyword && matchesClass && matchesType && matchesDrive && matchesCategory;
  });

  carCount.textContent = `${filteredCars.length}대 표시 중`;

  if (filteredCars.length === 0) {
    carGrid.innerHTML = `<div class="empty">조건에 맞는 차량이 없습니다.</div>`;
    return;
  }

  carGrid.innerHTML = filteredCars
    .map(
      (car) => `
      <article class="car-card" onclick="openCarDetail('${escapeAttribute(car.id)}', 'cars')">
        ${renderBadges(car)}

        <p class="manufacturer">${escapeHTML(car.manufacturer || "제조사 미입력")}</p>
        <h2>${escapeHTML(car.carName || "차량명 미입력")}</h2>

        <p class="share-code">공유 코드: ${escapeHTML(car.shareCode || "미입력")}</p>
        ${renderTrackTimeLine(TRACK_A_NAME, car.testTrackATime)}
        ${renderTrackTimeLine(TRACK_B_NAME, car.testTrackBTime)}

        <p class="summary">${escapeHTML(car.summary || "주행 평가가 아직 입력되지 않았습니다.")}</p>
      </article>
    `
    )
    .join("");
}


/* =========================
   카드 배지 공통 렌더링
========================= */

function renderBadges(car) {
  return `
    <div class="meta">
      <span class="badge">${escapeHTML(car.className || "PI 미입력")}</span>
      <span class="badge">${escapeHTML(car.carType || "분류 미입력")}</span>
      <span class="badge">${escapeHTML(car.drive || "구동방식 미입력")}</span>
      <span class="badge">${escapeHTML(car.category || "용도 미입력")}</span>
    </div>
  `;
}


/* =========================
   테스트 트랙 기록 한 줄 표시
========================= */

function renderTrackTimeLine(trackName, time) {
  if (!time) return "";

  return `<p class="track-time">${escapeHTML(trackName)}: ${escapeHTML(time)}</p>`;
}


/* =========================
   차량 상세창 열기
========================= */

function openCarDetail(id, source = "cars") {
  const sourceList = source === "weekly" ? weeklyCars : cars;
  const car = sourceList.find((item) => item.id === id);

  if (!car) return;

  modalBody.innerHTML = `
    ${renderBadges(car)}

    <p class="manufacturer">${escapeHTML(car.manufacturer || "제조사 미입력")}</p>
    <h2>${escapeHTML(car.carName || "차량명 미입력")}</h2>
    <p class="summary">${escapeHTML(car.concept || "빌드 콘셉트가 아직 입력되지 않았습니다.")}</p>

    <div class="share-box">
      <span class="detail-label">튜닝 공유 코드</span>
      <strong>${escapeHTML(car.shareCode || "미입력")}</strong>
    </div>

    <div class="detail-grid">
      ${renderDetailItem("제조사", car.manufacturer)}
      ${renderDetailItem("차량 분류", car.carType)}
      ${renderDetailItem("구동방식", car.drive)}
      ${renderDetailItem("용도", car.category)}
      ${renderDetailItem("출력", car.power)}
      ${renderDetailItem("중량", car.weight)}
      ${renderDetailItem("횡G", car.lateralG)}
      ${renderDetailItem("최근 수정일", car.updatedAt)}
      ${renderDetailItem(TRACK_A_NAME, car.testTrackATime)}
      ${renderDetailItem(TRACK_B_NAME, car.testTrackBTime)}
    </div>

    <h3>주행 평가</h3>
    <p class="summary">${escapeHTML(car.summary || "주행 평가가 아직 입력되지 않았습니다.")}</p>

    <h3>튜닝 메모</h3>
    <p class="summary">${escapeHTML(car.tuneNotes || "튜닝 메모가 아직 입력되지 않았습니다.")}</p>
  `;

  modal.classList.remove("hidden");
}


/* =========================
   상세 정보 한 칸 렌더링
========================= */

function renderDetailItem(label, value) {
  return `
    <div class="detail-item">
      <span class="detail-label">${escapeHTML(label)}</span>
      <span class="detail-value">${escapeHTML(value || "미입력")}</span>
    </div>
  `;
}


/* =========================
   차량 상세창 닫기
========================= */

function closeCarDetail() {
  modal.classList.add("hidden");
}


/* =========================
   HTML 특수문자 처리
   시트에 입력한 텍스트가 HTML로 오작동하지 않게 방지
========================= */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================
   HTML 속성용 특수문자 처리
========================= */

function escapeAttribute(value) {
  return escapeHTML(value).replaceAll("`", "&#096;");
}


/* =========================
   이벤트 연결
========================= */

searchInput.addEventListener("input", renderCars);
classFilter.addEventListener("change", renderCars);
typeFilter.addEventListener("change", renderCars);
driveFilter.addEventListener("change", renderCars);
categoryFilter.addEventListener("change", renderCars);

closeModal.addEventListener("click", closeCarDetail);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeCarDetail();
  }
});


/* =========================
   최초 실행
========================= */

loadAllData();