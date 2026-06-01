/* =========================
   0. Google Sheets CSV 링크
   archive = 지난 시즌 페스티벌 튜닝 보관용 시트
========================= */

const ARCHIVE_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbFvBegPwsW2UpUTUMyA8peYLKihKS9HJLqworTV6zC1Zxa96tT7643TsHxVWSTYEKHRtyDSdrD-C3/pub?gid=1744538673&single=true&output=csv";


/* =========================
   1. 테스트 트랙 표시 이름
   - 메인 script.js와 동일하게 유지
========================= */

const TRACK_B_NAME = "레전드 섬 서킷";
const TRACK_C_NAME = "세키베 타임어택(오프로드)";


/* =========================
   2. HTML 요소 가져오기
========================= */

const archiveList = document.getElementById("archiveList");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");


/* =========================
   3. 지난 시즌 차량 데이터 저장 배열
========================= */

let archiveCars = [];


/* =========================
   4. archive 시트 데이터 불러오기
========================= */

async function loadArchiveData() {
  try {
    archiveList.innerHTML = `
      <div class="weekly-empty">
        지난 시즌 튜닝 데이터를 불러오는 중입니다...
      </div>
    `;

    const archiveResponse = await fetch(ARCHIVE_CSV_URL);

    if (!archiveResponse.ok) {
      throw new Error("archive CSV 데이터를 불러오지 못했습니다.");
    }

    const archiveCsvText = await archiveResponse.text();

    archiveCars = parseCars(archiveCsvText);

    renderArchive();
  } catch (error) {
    console.error(error);

    archiveList.innerHTML = `
      <div class="weekly-empty">
        지난 시즌 튜닝 데이터를 불러오지 못했습니다.<br>
        archive 시트 게시 상태 또는 gid 값을 확인해주세요.
      </div>
    `;
  }
}


/* =========================
   5. CSV 텍스트를 차량 객체 배열로 변환
   - eventTitle을 시즌 제목으로 사용
   - shareCode는 붙여쓴 9자리 기준으로 정리
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
   6. 기본 텍스트 정리
========================= */

function cleanValue(value) {
  return value ? String(value).trim() : "";
}


/* =========================
   7. 공유 코드 정리
   - 시트 입력값: 123456789
   - 표시값/복사값: 123456789
   - 실수로 공백이 들어가도 제거
========================= */

function normalizeShareCode(code) {
  return cleanValue(code).replace(/\s+/g, "");
}


/* =========================
   8. CSV 파서
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
   9. 시즌 제목별로 차량 묶기
   - eventTitle 기준
   - eventTitle이 비어 있으면 "시즌명 미입력"으로 묶음
========================= */

function groupCarsBySeason(cars) {
  const groups = {};

  cars.forEach((car) => {
    const seasonTitle = car.eventTitle || "시즌명 미입력";

    if (!groups[seasonTitle]) {
      groups[seasonTitle] = [];
    }

    groups[seasonTitle].push(car);
  });

  return Object.entries(groups).map(([seasonTitle, seasonCars]) => ({
    seasonTitle,
    cars: seasonCars
  }));
}


/* =========================
   10. 지난 시즌 아카이브 렌더링
   - 기본 상태는 접힘
   - 시즌 제목 버튼 클릭 시 해당 시즌 차량 카드 펼침
========================= */

function renderArchive() {
  if (archiveCars.length === 0) {
    archiveList.innerHTML = `
      <div class="weekly-empty">
        저장된 지난 시즌 튜닝이 없습니다.
      </div>
    `;
    return;
  }

  const seasonGroups = groupCarsBySeason(archiveCars);

  archiveList.innerHTML = seasonGroups
    .map((group, index) => renderSeasonGroup(group, index))
    .join("");
}


/* =========================
   11. 시즌 그룹 하나 생성
========================= */

function renderSeasonGroup(group, index) {
  const panelId = `archive-season-${index}`;

  return `
    <article class="archive-season">
      <button
        class="archive-season-toggle"
        type="button"
        onclick="toggleArchiveSeason('${panelId}', this)"
      >
        <span>${escapeHTML(group.seasonTitle)}</span>
        <small>${group.cars.length}대</small>
        <strong>펼치기 ▼</strong>
      </button>

      <div id="${panelId}" class="archive-season-panel">
        <div class="archive-card-grid">
          ${group.cars.map((car) => renderArchiveCard(car)).join("")}
        </div>
      </div>
    </article>
  `;
}


/* =========================
   12. 지난 시즌 차량 카드 생성
========================= */

function renderArchiveCard(car) {
  return `
    <article class="weekly-card archive-card" onclick="openCarDetail('${escapeAttribute(car.id)}')">
      ${renderBadges(car)}

      <p class="manufacturer">${escapeHTML(car.manufacturer || "제조사 미입력")}</p>
      <h3>${escapeHTML(car.carName || "차량명 미입력")}</h3>

      <p class="share-code">공유 코드: ${escapeHTML(car.shareCode || "미입력")}</p>

      <p class="summary">${escapeHTML(car.summary || "지난 시즌 튜닝 설명이 아직 입력되지 않았습니다.")}</p>
    </article>
  `;
}


/* =========================
   13. 시즌 접기 / 펼치기
========================= */

function toggleArchiveSeason(panelId, button) {
  const panel = document.getElementById(panelId);

  if (!panel) return;

  const isOpen = panel.classList.toggle("open");

  const toggleText = button.querySelector("strong");

  if (toggleText) {
    toggleText.textContent = isOpen ? "접기 ▲" : "펼치기 ▼";
  }
}


/* =========================
   14. 카드 배지 렌더링
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
   15. 차량 상세창 열기
========================= */

function openCarDetail(id) {
  const car = archiveCars.find((item) => item.id === id);

  if (!car) return;

  const shareCode = normalizeShareCode(car.shareCode);

  modalBody.innerHTML = `
    ${renderBadges(car)}

    <p class="manufacturer">${escapeHTML(car.manufacturer || "제조사 미입력")}</p>
    <h2>${escapeHTML(car.carName || "차량명 미입력")}</h2>
    <p class="summary">${escapeHTML(car.concept || "빌드 콘셉트가 아직 입력되지 않았습니다.")}</p>

    <div class="share-box">
      <span class="detail-label">튜닝 공유 코드</span>

      <div class="share-code-row">
        <strong>${escapeHTML(shareCode || "미입력")}</strong>

        <button
          class="copy-code-button"
          type="button"
          onclick="copyShareCode('${escapeAttribute(shareCode)}', this)"
        >
          복사
        </button>
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
   16. 상세 정보 한 칸 렌더링
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
   17. 차량 상세창 닫기
========================= */

function closeCarDetail() {
  modal.classList.add("hidden");
}


/* =========================
   18. 공유 코드 복사
========================= */

async function copyShareCode(code, button) {
  const shareCode = normalizeShareCode(code);

  if (!shareCode) return;

  try {
    await navigator.clipboard.writeText(shareCode);

    const originalText = button.textContent;
    button.textContent = "복사됨!";
    button.classList.add("copied");

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove("copied");
    }, 1200);
  } catch (error) {
    console.error("공유 코드 복사 실패:", error);

    button.textContent = "복사 실패";

    setTimeout(() => {
      button.textContent = "복사";
    }, 1200);
  }
}


/* =========================
   19. HTML 특수문자 처리
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
   20. HTML 속성용 특수문자 처리
========================= */

function escapeAttribute(value) {
  return escapeHTML(value).replaceAll("`", "&#096;");
}


/* =========================
   21. 이벤트 연결
========================= */

closeModal.addEventListener("click", closeCarDetail);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeCarDetail();
  }
});


/* =========================
   22. 최초 실행
========================= */

loadArchiveData();