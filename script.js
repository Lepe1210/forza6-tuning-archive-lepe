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
========================= */

const TRACK_B_NAME = "레전드 섬 서킷";
const TRACK_C_NAME = "세키베 타임어택(오프로드)";


/* =========================
   오늘의 튜닝 저장 키
========================= */

const DAILY_TUNE_STORAGE_KEY = "forzaDailyTuneResult";


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
const sortFilter = document.getElementById("sortFilter");
const resetFilters = document.getElementById("resetFilters");
const refreshData = document.getElementById("refreshData");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

const openDailyTune = document.getElementById("openDailyTune");
const dailyTuneModal = document.getElementById("dailyTuneModal");
const closeDailyTune = document.getElementById("closeDailyTune");
const dailyTuneSlotText = document.getElementById("dailyTuneSlotText");
const spinDailyTune = document.getElementById("spinDailyTune");
const dailyTuneResult = document.getElementById("dailyTuneResult");


/* =========================
   차량 데이터 저장용 배열
========================= */

let cars = [];
let weeklyCars = [];
let isDailyTuneSpinning = false;


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

    if (dailyTuneModal && !dailyTuneModal.classList.contains("hidden")) {
      renderDailyTuneModalState();
    }
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
      shareCode: normalizeShareCode(row.shareCode),
      summary: cleanValue(row.summary),
      tuneNotes: cleanValue(row.tuneNotes),
      updatedAt: cleanValue(row.updatedAt),
      testTrackBTime: cleanValue(row.testTrackBTime),
      testTrackCTime: cleanValue(row.testTrackCTime)
    }))
    .filter((car) => car.id || car.carName || car.manufacturer);
}


/* =========================
   빈 값 정리
========================= */

function cleanValue(value) {
  return value ? String(value).trim() : "";
}


/* =========================
   공유 코드 정리
========================= */

function normalizeShareCode(code) {
  return cleanValue(code).replace(/\s+/g, "");
}


/* =========================
   공유 코드 표시 형식
========================= */

function formatShareCode(code) {
  const normalized = normalizeShareCode(code);

  if (!normalized) {
    return "";
  }

  if (normalized.length !== 9) {
    return normalized;
  }

  return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 9)}`;
}


/* =========================
   CSV 파서
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
    "D 400": 1,
    "C 500": 2,
    "B 600": 3,
    "A 700": 4,
    "S1 800": 5,
    "S2 900": 6,
    "R 998": 7,
    "X 999": 8
  };

  return order[pi] || 999;
}


/* =========================
   최근 튜닝 여부 판단
========================= */

function isRecentTuning(updatedAt) {
  if (!updatedAt) return false;

  const targetDate = new Date(updatedAt);

  if (Number.isNaN(targetDate.getTime())) {
    return false;
  }

  const today = new Date();
  const yesterday = new Date();

  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);

  targetDate.setHours(0, 0, 0, 0);

  return (
    targetDate.getTime() === today.getTime() ||
    targetDate.getTime() === yesterday.getTime()
  );
}


/* =========================
   PI별 평균 + 최고 기록 + 순위표 계산
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

    groups[pi].push({
      seconds,
      car
    });
  });

  return Object.entries(groups)
    .map(([pi, entries]) => {
      const sortedEntries = [...entries].sort((a, b) => a.seconds - b.seconds);
      const sum = sortedEntries.reduce((total, entry) => total + entry.seconds, 0);
      const average = sum / sortedEntries.length;
      const best = sortedEntries[0];

      return {
        pi,
        average,
        count: sortedEntries.length,
        bestCar: best.car,
        bestTime: best.seconds,
        rankings: buildRankings(sortedEntries)
      };
    })
    .sort((a, b) => sortPI(a.pi) - sortPI(b.pi));
}


/* =========================
   동타 기록 처리 코드
========================= */

function buildRankings(sortedEntries) {
  let previousTime = null;
  let previousRank = 0;

  return sortedEntries.map((entry, index) => {
    const currentTime = Math.round(entry.seconds * 1000);

    let rank;

    if (previousTime !== null && currentTime === previousTime) {
      rank = previousRank;
    } else {
      rank = index + 1;
    }

    previousTime = currentTime;
    previousRank = rank;

    return {
      rank,
      car: entry.car,
      seconds: entry.seconds
    };
  });
}


/* =========================
   PI별 평균 기록 섹션 표시
========================= */

function renderAverageStats() {
  if (!averageGrid) return;

  const trackBAverages = calculateAverageByPI("testTrackBTime");
  const trackCAverages = calculateAverageByPI("testTrackCTime");

  averageGrid.innerHTML = `
    ${renderAverageCard(TRACK_B_NAME, "trackB", trackBAverages)}
    ${renderAverageCard(TRACK_C_NAME, "trackC", trackCAverages)}
  `;
}


function renderAverageCard(trackName, trackId, averages) {
  if (averages.length === 0) {
    return `
      <article class="average-card">
        <h3>${escapeHTML(trackName)}</h3>
        <div class="weekly-empty">아직 기록이 없습니다.</div>
      </article>
    `;
  }

  return `
    <article class="average-card">
      <h3>${escapeHTML(trackName)}</h3>
      <div class="average-list">
        ${averages
          .map((item, index) => renderAverageItem(item, trackId, index))
          .join("")}
      </div>
    </article>
  `;
}


function renderAverageItem(item, trackId, index) {
  const rankingId = `ranking-${trackId}-${index}`;

  return `
    <div class="average-row">
      <span>${escapeHTML(item.pi)} 평균 · ${item.count}대</span>
      <span>${secondsToLapTime(item.average)}</span>
    </div>

    <div class="best-record">
      <span class="best-record-label">최고 기록</span>
      <div class="best-record-value">
        ${escapeHTML(item.bestCar.manufacturer || "제조사 미입력")}
        ${escapeHTML(item.bestCar.carName || "차량명 미입력")}
        · ${secondsToLapTime(item.bestTime)}
      </div>

      <button class="ranking-toggle" onclick="toggleRanking('${rankingId}', this)">
        순위표 보기 ▼
      </button>

      <div id="${rankingId}" class="ranking-table">
        ${item.rankings.map((ranking) => renderRankingRow(ranking)).join("")}
      </div>
    </div>
  `;
}


function renderRankingRow(ranking) {
  return `
    <div class="ranking-row">
      <span class="ranking-rank">${ranking.rank}위</span>

      <button
        class="ranking-car-button"
        onclick="openCarDetail('${escapeAttribute(ranking.car.id)}', 'cars')"
      >
        ${escapeHTML(ranking.car.manufacturer || "제조사 미입력")}
        ${escapeHTML(ranking.car.carName || "차량명 미입력")}
      </button>

      <span class="ranking-time">${secondsToLapTime(ranking.seconds)}</span>
    </div>
  `;
}


/* =========================
   순위표 펼치기 / 접기
========================= */

function toggleRanking(rankingId, button) {
  const rankingTable = document.getElementById(rankingId);

  if (!rankingTable) return;

  const isOpen = rankingTable.classList.toggle("open");

  button.textContent = isOpen ? "순위표 접기 ▲" : "순위표 보기 ▼";
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

        <p class="share-code">공유 코드: ${escapeHTML(formatShareCode(car.shareCode) || "미입력")}</p>

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
  const keyword = normalizeShareCode(searchInput.value).toLowerCase();
  const rawKeyword = searchInput.value.toLowerCase().trim();

  const selectedClass = classFilter.value;
  const selectedType = typeFilter.value;
  const selectedDrive = driveFilter.value;
  const selectedCategory = categoryFilter.value;
  const selectedSort = sortFilter ? sortFilter.value : "default";

  const filteredCars = cars.filter((car) => {
    const searchableText = `
      ${car.carName}
      ${car.manufacturer}
      ${car.carType}
      ${car.drive}
      ${car.category}
      ${car.shareCode}
      ${formatShareCode(car.shareCode)}
      ${car.lateralG}
      ${car.testTrackBTime}
      ${car.testTrackCTime}
      ${car.concept}
      ${car.summary}
      ${car.tuneNotes}
    `.toLowerCase();

    const normalizedSearchableText = normalizeShareCode(searchableText).toLowerCase();

    const matchesKeyword =
      !rawKeyword ||
      searchableText.includes(rawKeyword) ||
      normalizedSearchableText.includes(keyword);

    const matchesClass = selectedClass === "all" || car.className === selectedClass;
    const matchesType = selectedType === "all" || car.carType === selectedType;
    const matchesDrive = selectedDrive === "all" || car.drive === selectedDrive;
    const matchesCategory = selectedCategory === "all" || car.category === selectedCategory;

    return matchesKeyword && matchesClass && matchesType && matchesDrive && matchesCategory;
  });

  const sortedCars = sortCars(filteredCars, selectedSort);

  carCount.textContent = `${sortedCars.length}대 표시 중`;

  if (sortedCars.length === 0) {
    carGrid.innerHTML = `<div class="empty">조건에 맞는 차량이 없습니다.</div>`;
    return;
  }

  carGrid.innerHTML = sortedCars
    .map(
      (car) => `
      <article
        class="car-card ${isRecentTuning(car.updatedAt) ? "recent-tuning" : ""}"
        onclick="openCarDetail('${escapeAttribute(car.id)}', 'cars')"
      >
        ${renderBadges(car)}

        <p class="manufacturer">${escapeHTML(car.manufacturer || "제조사 미입력")}</p>
        <h2>${escapeHTML(car.carName || "차량명 미입력")}</h2>

        <p class="share-code">공유 코드: ${escapeHTML(formatShareCode(car.shareCode) || "미입력")}</p>

        <p class="summary">${escapeHTML(car.summary || "주행 평가가 아직 입력되지 않았습니다.")}</p>
      </article>
    `
    )
    .join("");
}


/* =========================
   전체 차량 정렬
========================= */

function sortCars(carList, sortType) {
  const sorted = [...carList];

  if (sortType === "manufacturer") {
    return sorted.sort((a, b) => {
      const makerCompare = a.manufacturer.localeCompare(b.manufacturer, "ko");
      if (makerCompare !== 0) return makerCompare;

      return a.carName.localeCompare(b.carName, "ko");
    });
  }

  if (sortType === "pi") {
    return sorted.sort((a, b) => {
      const piCompare = sortPI(a.className) - sortPI(b.className);
      if (piCompare !== 0) return piCompare;

      return a.carName.localeCompare(b.carName, "ko");
    });
  }

  if (sortType === "updated") {
    return sorted.sort((a, b) => {
      const dateA = new Date(a.updatedAt || "1900-01-01");
      const dateB = new Date(b.updatedAt || "1900-01-01");

      return dateB - dateA;
    });
  }

  if (sortType === "trackB") {
    return sorted.sort((a, b) =>
      compareLapTimes(a.testTrackBTime, b.testTrackBTime)
    );
  }

  if (sortType === "trackC") {
    return sorted.sort((a, b) =>
      compareLapTimes(a.testTrackCTime, b.testTrackCTime)
    );
  }

  return sorted;
}


/* =========================
   랩타임 정렬용 비교
========================= */

function compareLapTimes(timeA, timeB) {
  const secondsA = lapTimeToSeconds(timeA);
  const secondsB = lapTimeToSeconds(timeB);

  if (secondsA === null && secondsB === null) return 0;
  if (secondsA === null) return 1;
  if (secondsB === null) return -1;

  return secondsA - secondsB;
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
   차량 상세창 열기
========================= */

function openCarDetail(id, source = "cars") {
  const sourceList = source === "weekly" ? weeklyCars : cars;
  const car = sourceList.find((item) => item.id === id);

  if (!car) return;

  const shareCode = normalizeShareCode(car.shareCode);
  const displayShareCode = formatShareCode(car.shareCode);

  modalBody.innerHTML = `
    ${renderBadges(car)}

    <p class="manufacturer">${escapeHTML(car.manufacturer || "제조사 미입력")}</p>
    <h2>${escapeHTML(car.carName || "차량명 미입력")}</h2>
    <p class="summary">${escapeHTML(car.concept || "빌드 콘셉트가 아직 입력되지 않았습니다.")}</p>

    <div class="share-box">
      <span class="detail-label">튜닝 공유 코드</span>

      <div class="share-code-row">
        <button
          class="copy-code-button"
          type="button"
          onclick="copyShareCode('${escapeAttribute(shareCode)}', this)"
        >
          복사
        </button>

        <strong>${escapeHTML(displayShareCode || "미입력")}</strong>
      </div>
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
      ${renderDetailItem(TRACK_B_NAME, car.testTrackBTime)}
      ${renderDetailItem(TRACK_C_NAME, car.testTrackCTime)}
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
   필터 초기화
========================= */

function resetAllFilters() {
  searchInput.value = "";
  classFilter.value = "all";
  typeFilter.value = "all";
  driveFilter.value = "all";
  categoryFilter.value = "all";

  if (sortFilter) {
    sortFilter.value = "default";
  }

  renderCars();
}


/* =========================
   데이터 새로고침
========================= */

function refreshAllData() {
  loadAllData();
}


/* =========================
   오늘 날짜 키
========================= */

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =========================
   오늘의 튜닝 저장값 가져오기
========================= */

function getSavedDailyTune() {
  try {
    const savedText = localStorage.getItem(DAILY_TUNE_STORAGE_KEY);

    if (!savedText) {
      return null;
    }

    const saved = JSON.parse(savedText);

    if (!saved || saved.date !== getTodayKey() || !saved.carId) {
      return null;
    }

    return saved;
  } catch (error) {
    return null;
  }
}


/* =========================
   오늘의 튜닝 저장
========================= */

function saveDailyTune(car) {
  const payload = {
    date: getTodayKey(),
    carId: car.id
  };

  localStorage.setItem(DAILY_TUNE_STORAGE_KEY, JSON.stringify(payload));
}


/* =========================
   오늘의 튜닝 모달 열기
========================= */

function openDailyTuneModal() {
  if (!dailyTuneModal) return;

  dailyTuneModal.classList.remove("hidden");
  renderDailyTuneModalState();
}


/* =========================
   오늘의 튜닝 모달 닫기
========================= */

function closeDailyTuneModal() {
  if (!dailyTuneModal) return;

  dailyTuneModal.classList.add("hidden");
}


/* =========================
   오늘의 튜닝 모달 상태 렌더링
========================= */

function renderDailyTuneModalState() {
  if (!dailyTuneSlotText || !spinDailyTune || !dailyTuneResult) return;

  if (cars.length === 0) {
    dailyTuneSlotText.textContent = "차량 데이터를 불러오는 중입니다...";
    spinDailyTune.disabled = true;
    dailyTuneResult.classList.add("hidden");
    dailyTuneResult.innerHTML = "";
    return;
  }

  const saved = getSavedDailyTune();

  if (saved) {
    const savedCar = cars.find((car) => car.id === saved.carId);

    if (savedCar) {
      dailyTuneSlotText.textContent = `${savedCar.manufacturer} ${savedCar.carName}`;
      spinDailyTune.textContent = "오늘은 이미 뽑았습니다";
      spinDailyTune.disabled = true;
      renderDailyTuneResult(savedCar, true);
      return;
    }
  }

  dailyTuneSlotText.textContent = "준비 완료";
  spinDailyTune.textContent = "뽑기 시작";
  spinDailyTune.disabled = false;
  dailyTuneResult.classList.add("hidden");
  dailyTuneResult.innerHTML = "";
}


/* =========================
   랜덤 차량 선택
========================= */

function pickRandomCar() {
  if (cars.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * cars.length);
  return cars[randomIndex];
}


/* =========================
   오늘의 튜닝 룰렛 시작
========================= */

function startDailyTuneSpin() {
  if (isDailyTuneSpinning || cars.length === 0) return;

  const saved = getSavedDailyTune();

  if (saved) {
    renderDailyTuneModalState();
    return;
  }

  const resultCar = pickRandomCar();

  if (!resultCar) return;

  isDailyTuneSpinning = true;
  spinDailyTune.disabled = true;
  spinDailyTune.textContent = "뽑는 중...";
  dailyTuneResult.classList.add("hidden");
  dailyTuneResult.innerHTML = "";

  const spinSteps = 28;
  let currentStep = 0;

  function spinNext() {
    const previewCar =
      currentStep === spinSteps - 1 ? resultCar : pickRandomCar();

    if (previewCar) {
      dailyTuneSlotText.textContent = `${previewCar.manufacturer} ${previewCar.carName}`;
      restartSlotAnimation();
    }

    currentStep++;

    if (currentStep >= spinSteps) {
      saveDailyTune(resultCar);
      isDailyTuneSpinning = false;
      spinDailyTune.textContent = "오늘은 이미 뽑았습니다";
      spinDailyTune.disabled = true;
      renderDailyTuneResult(resultCar, false);
      return;
    }

    const progress = currentStep / spinSteps;
    const delay = 50 + Math.floor(progress * progress * 180);

    setTimeout(spinNext, delay);
  }

  spinNext();
}


/* =========================
   슬롯머신 텍스트 애니메이션 재시작
========================= */

function restartSlotAnimation() {
  if (!dailyTuneSlotText) return;

  dailyTuneSlotText.classList.remove("spinning");

  void dailyTuneSlotText.offsetWidth;

  dailyTuneSlotText.classList.add("spinning");
}


/* =========================
   오늘의 튜닝 결과 카드 표시
========================= */

function renderDailyTuneResult(car, alreadyPicked) {
  if (!dailyTuneResult) return;

  const shareCode = normalizeShareCode(car.shareCode);
  const displayShareCode = formatShareCode(car.shareCode);

  dailyTuneResult.innerHTML = `
    <article class="daily-tune-result-card">
      <span class="daily-tune-result-label">
        ${alreadyPicked ? "TODAY'S SAVED RESULT" : "TODAY'S RESULT"}
      </span>

      <p class="manufacturer">${escapeHTML(car.manufacturer || "제조사 미입력")}</p>
      <h3>${escapeHTML(car.carName || "차량명 미입력")}</h3>

      <div class="daily-tune-result-meta">
        <span class="badge">${escapeHTML(car.className || "PI 미입력")}</span>
        <span class="badge">${escapeHTML(car.carType || "분류 미입력")}</span>
        <span class="badge">${escapeHTML(car.drive || "구동방식 미입력")}</span>
        <span class="badge">${escapeHTML(car.category || "용도 미입력")}</span>
      </div>

      <div class="daily-tune-result-code">
        <button
          class="copy-code-button"
          type="button"
          onclick="copyShareCode('${escapeAttribute(shareCode)}', this)"
        >
          복사
        </button>

        <strong>${escapeHTML(displayShareCode || "미입력")}</strong>
      </div>

      <p class="summary">${escapeHTML(car.concept || "빌드 콘셉트가 아직 입력되지 않았습니다.")}</p>
      <p class="summary">${escapeHTML(car.summary || "주행 평가가 아직 입력되지 않았습니다.")}</p>

      <div class="daily-tune-result-actions">
        <button
          class="daily-tune-action-button primary"
          type="button"
          onclick="openDailyTuneDetail('${escapeAttribute(car.id)}')"
        >
          상세 정보 보기
        </button>

        <button
          class="daily-tune-action-button"
          type="button"
          onclick="shareDailyTune('${escapeAttribute(car.id)}', this)"
        >
          공유하기
        </button>
      </div>

      <p class="daily-tune-note">
        오늘은 이미 뽑았습니다. 내일 다시 뽑을 수 있습니다.
      </p>
    </article>
  `;

  dailyTuneResult.classList.remove("hidden");
}


/* =========================
   오늘의 튜닝 상세 정보 보기
========================= */

function openDailyTuneDetail(carId) {
  closeDailyTuneModal();
  openCarDetail(carId, "cars");
}


/* =========================
   오늘의 튜닝 공유하기
========================= */

async function shareDailyTune(carId, button) {
  const car = cars.find((item) => item.id === carId);

  if (!car) return;

  const displayShareCode = formatShareCode(car.shareCode);
  const shareText =
    `오늘의 랜덤 튜닝\n\n` +
    `${car.manufacturer} ${car.carName}\n` +
    `PI: ${car.className || "PI 미입력"}\n` +
    `분류: ${car.carType || "분류 미입력"}\n` +
    `구동방식: ${car.drive || "구동방식 미입력"}\n` +
    `용도: ${car.category || "용도 미입력"}\n` +
    `공유 코드: ${displayShareCode || "미입력"}\n\n` +
    `Forza 6 Tuning Archive\n` +
    `${window.location.origin}${window.location.pathname}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "오늘의 랜덤 튜닝",
        text: shareText,
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      markButtonCopied(button, "복사됨!");
    }
  } catch (error) {
    console.error("공유 실패:", error);
  }
}


/* =========================
   공유 코드 복사
========================= */

async function copyShareCode(code, button) {
  const shareCode = normalizeShareCode(code);

  if (!shareCode) return;

  try {
    await navigator.clipboard.writeText(shareCode);
    markButtonCopied(button, "복사됨!");
  } catch (error) {
    console.error("공유 코드 복사 실패:", error);

    const originalText = button.textContent;
    button.textContent = "복사 실패";

    setTimeout(() => {
      button.textContent = originalText;
    }, 1200);
  }
}


/* =========================
   버튼 복사 완료 표시
========================= */

function markButtonCopied(button, copiedText) {
  if (!button) return;

  const originalText = button.textContent;
  button.textContent = copiedText;
  button.classList.add("copied");

  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("copied");
  }, 1200);
}


/* =========================
   HTML 특수문자 처리
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

if (sortFilter) {
  sortFilter.addEventListener("change", renderCars);
}

if (resetFilters) {
  resetFilters.addEventListener("click", resetAllFilters);
}

if (refreshData) {
  refreshData.addEventListener("click", refreshAllData);
}

if (openDailyTune) {
  openDailyTune.addEventListener("click", openDailyTuneModal);
}

if (closeDailyTune) {
  closeDailyTune.addEventListener("click", closeDailyTuneModal);
}

if (spinDailyTune) {
  spinDailyTune.addEventListener("click", startDailyTuneSpin);
}

closeModal.addEventListener("click", closeCarDetail);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeCarDetail();
  }
});

if (dailyTuneModal) {
  dailyTuneModal.addEventListener("click", (event) => {
    if (event.target === dailyTuneModal) {
      closeDailyTuneModal();
    }
  });
}


/* =========================
   최초 실행
========================= */

loadAllData();


/* =========================
   PWA Service Worker 등록
========================= */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => {
        console.log("Service Worker 등록 완료");
      })
      .catch((error) => {
        console.error("Service Worker 등록 실패:", error);
      });
  });
}

/* =========================
   관리자 페이지 입장 게이트
   - 비밀번호 원문 대신 SHA-256 해시값 비교
   - GitHub 코드에 실제 비밀번호를 남기지 않기 위한 방식
========================= */

const MANAGER_PASSWORD_SALT = "forza6-manager-gate-v1";
const MANAGER_PASSWORD_HASH = "d5609f2c4f2006ac4f8714120394872bb0780e4b533120dfd4e76d16b6179532";
const MANAGER_ACCESS_SESSION_KEY = "forzaManagerAccess";
const MANAGER_MEMO_AUTH_SALT = "forza6-manager-memo-api-v1";
const MANAGER_MEMO_AUTH_SESSION_KEY = "forzaManagerMemoAuth";

const openManagerGate = document.getElementById("openManagerGate");
const managerGateModal = document.getElementById("managerGateModal");
const closeManagerGate = document.getElementById("closeManagerGate");
const managerPasswordInput = document.getElementById("managerPasswordInput");
const enterManagerGate = document.getElementById("enterManagerGate");
const managerPasswordError = document.getElementById("managerPasswordError");

async function createSHA256Hash(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function openManagerGateModal() {
  if (!managerGateModal) return;

  managerGateModal.classList.remove("hidden");

  if (managerPasswordInput) {
    managerPasswordInput.value = "";
    managerPasswordInput.focus();
  }

  if (managerPasswordError) {
    managerPasswordError.textContent = "";
  }
}

function closeManagerGateModal() {
  if (!managerGateModal) return;

  managerGateModal.classList.add("hidden");
}

async function enterManagerPage() {
  if (!managerPasswordInput) return;

  const password = managerPasswordInput.value;

  if (!password) {
    managerPasswordError.textContent = "비밀번호를 입력해주세요.";
    return;
  }

  try {
    const inputHash = await createSHA256Hash(
      `${MANAGER_PASSWORD_SALT}:${password}`
    );

    if (inputHash === MANAGER_PASSWORD_HASH) {
  const memoAuthHash = await createSHA256Hash(
    `${MANAGER_MEMO_AUTH_SALT}:${password}`
  );

  sessionStorage.setItem(MANAGER_ACCESS_SESSION_KEY, "ok");
  sessionStorage.setItem(MANAGER_MEMO_AUTH_SESSION_KEY, memoAuthHash);

  window.location.href = "manager.html";
  return;
}

    managerPasswordError.textContent = "비밀번호가 맞지 않습니다.";
    managerPasswordInput.value = "";
    managerPasswordInput.focus();
  } catch (error) {
    console.error("관리자 비밀번호 확인 실패:", error);
    managerPasswordError.textContent = "비밀번호 확인 중 오류가 발생했습니다.";
  }
}

if (openManagerGate) {
  openManagerGate.addEventListener("click", openManagerGateModal);
}

if (closeManagerGate) {
  closeManagerGate.addEventListener("click", closeManagerGateModal);
}

if (enterManagerGate) {
  enterManagerGate.addEventListener("click", enterManagerPage);
}

if (managerPasswordInput) {
  managerPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      enterManagerPage();
    }
  });
}

if (managerGateModal) {
  managerGateModal.addEventListener("click", (event) => {
    if (event.target === managerGateModal) {
      closeManagerGateModal();
    }
  });
}