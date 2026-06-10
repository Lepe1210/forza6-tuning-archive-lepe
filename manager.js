/* =========================
   Forza 6 Tuning Archive
   관리자 페이지 전용 스크립트
========================= */

/* =========================
   관리자 페이지 직접 접근 방지
   - index.html에서 비밀번호 통과 후 들어온 경우만 허용
========================= */

const MANAGER_ACCESS_SESSION_KEY = "forzaManagerAccess";

if (sessionStorage.getItem(MANAGER_ACCESS_SESSION_KEY) !== "ok") {
  window.location.replace("index.html");
}

/* =========================
   list 시트 CSV 링크
   - Google Sheets의 list 시트 데이터를 읽음
   - gid: 1875896272
========================= */

const LIST_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbFvBegPwsW2UpUTUMyA8peYLKihKS9HJLqworTV6zC1Zxa96tT7643TsHxVWSTYEKHRtyDSdrD-C3/pub?gid=1875896272&single=true&output=csv";

  /* =========================
   localStorage 저장 키
========================= */

const MANAGER_MEMO_STORAGE_KEY = "forzaManagerMemos";


/* =========================
   HTML 요소 가져오기
========================= */

const reloadManagerData = document.getElementById("reloadManagerData");

const managerDataStatus = document.getElementById("managerDataStatus");
const managerCandidateCount = document.getElementById("managerCandidateCount");

const managerSlotVehicle = document.getElementById("managerSlotVehicle");
const managerSlotPI = document.getElementById("managerSlotPI");
const managerSlotCategory = document.getElementById("managerSlotCategory");

const spinManagerRoulette = document.getElementById("spinManagerRoulette");
const addRouletteResultToMemo = document.getElementById("addRouletteResultToMemo");
const managerRouletteResult = document.getElementById("managerRouletteResult");

const memoTitle = document.getElementById("memoTitle");
const memoBody = document.getElementById("memoBody");
const memoTag = document.getElementById("memoTag");

const saveManagerMemo = document.getElementById("saveManagerMemo");
const clearMemoForm = document.getElementById("clearMemoForm");
const copyAllManagerMemos = document.getElementById("copyAllManagerMemos");
const clearAllManagerMemos = document.getElementById("clearAllManagerMemos");

const managerMemoList = document.getElementById("managerMemoList");
const memoCountText = document.getElementById("memoCountText");


/* =========================
   데이터 저장용 변수
========================= */

let managerVehicles = [];
let rouletteCandidates = [];
let currentRouletteResult = null;
let isManagerRouletteSpinning = false;


/* =========================
   관리자 데이터 불러오기
========================= */

async function loadManagerData() {
  try {
    setManagerStatus("불러오는 중", "0대");

    if (spinManagerRoulette) {
      spinManagerRoulette.disabled = true;
      spinManagerRoulette.textContent = "불러오는 중...";
    }

    const response = await fetch(LIST_CSV_URL);

    if (!response.ok) {
      throw new Error("list 시트 CSV를 불러오지 못했습니다.");
    }

    const csvText = await response.text();

    managerVehicles = parseManagerVehicles(csvText);
    rouletteCandidates = managerVehicles.filter(isValidRouletteCandidate);

    setManagerStatus("불러오기 완료", `${rouletteCandidates.length}대`);

    if (rouletteCandidates.length === 0) {
      managerSlotVehicle.textContent = "후보 없음";
      managerSlotPI.textContent = "-";
      managerSlotCategory.textContent = "-";

      if (spinManagerRoulette) {
        spinManagerRoulette.textContent = "룰렛 후보 없음";
        spinManagerRoulette.disabled = true;
      }

      managerRouletteResult.classList.remove("hidden");
      managerRouletteResult.innerHTML = `
        <article class="manager-result-card">
          <span class="daily-tune-result-label">NO CANDIDATE</span>
          <h3>룰렛 후보가 없습니다.</h3>
          <p class="summary">
            list 시트에서 allowedPI와 category가 모두 입력된 차량만 룰렛 후보로 사용됩니다.
          </p>
        </article>
      `;

      return;
    }

    resetRouletteView();

    if (spinManagerRoulette) {
      spinManagerRoulette.textContent = "룰렛 돌리기";
      spinManagerRoulette.disabled = false;
    }
  } catch (error) {
    console.error(error);

    setManagerStatus("불러오기 실패", "0대");

    managerSlotVehicle.textContent = "불러오기 실패";
    managerSlotPI.textContent = "-";
    managerSlotCategory.textContent = "-";

    if (spinManagerRoulette) {
      spinManagerRoulette.textContent = "불러오기 실패";
      spinManagerRoulette.disabled = true;
    }

    managerRouletteResult.classList.remove("hidden");
    managerRouletteResult.innerHTML = `
      <article class="manager-result-card">
        <span class="daily-tune-result-label">LOAD ERROR</span>
        <h3>list 시트 데이터를 불러오지 못했습니다.</h3>
        <p class="summary">
          list 시트가 웹에 게시되어 있는지, CSV 주소의 gid가 맞는지 확인해주세요.
        </p>
      </article>
    `;
  }
}


/* =========================
   상태 카드 표시
========================= */

function setManagerStatus(statusText, countText) {
  if (managerDataStatus) {
    managerDataStatus.textContent = statusText;
  }

  if (managerCandidateCount) {
    managerCandidateCount.textContent = countText;
  }
}


/* =========================
   list CSV → 차량 객체 배열 변환
========================= */

function parseManagerVehicles(csvText) {
  return parseCSV(csvText)
    .map((row) => ({
      id: cleanValue(row.id),
      vehicle: cleanValue(row.vehicle),
      year: cleanValue(row.year),
      stockPI: cleanValue(row.stockPI),
      allowedPI: cleanValue(row.allowedPI),
      category: cleanValue(row.category),
      memo: cleanValue(row.memo)
    }))
    .filter((vehicle) => vehicle.id || vehicle.vehicle);
}


/* =========================
   룰렛 후보 유효성
   - allowedPI와 category 둘 다 있어야 후보로 사용
========================= */

function isValidRouletteCandidate(vehicle) {
  return (
    vehicle.vehicle &&
    splitMultiValue(vehicle.allowedPI).length > 0 &&
    splitMultiValue(vehicle.category).length > 0
  );
}


/* =========================
   쉼표 구분 다중 선택값 분리
   예: "A 700,S1 800" → ["A 700", "S1 800"]
========================= */

function splitMultiValue(value) {
  return cleanValue(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}


/* =========================
   빈 값 정리
========================= */

function cleanValue(value) {
  return value ? String(value).trim() : "";
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
   룰렛 화면 초기화
========================= */

function resetRouletteView() {
  currentRouletteResult = null;

  managerSlotVehicle.textContent = "준비 완료";
  managerSlotPI.textContent = "-";
  managerSlotCategory.textContent = "-";

  managerRouletteResult.classList.add("hidden");
  managerRouletteResult.innerHTML = "";

  if (addRouletteResultToMemo) {
    addRouletteResultToMemo.disabled = true;
  }
}


/* =========================
   랜덤 선택
========================= */

function pickRandomItem(list) {
  if (!list || list.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}


/* =========================
   유효한 룰렛 결과 생성
   - 차량 먼저 선택
   - 해당 차량의 allowedPI 중 랜덤
   - 해당 차량의 category 중 랜덤
========================= */

function createRouletteResult() {
  const vehicle = pickRandomItem(rouletteCandidates);

  if (!vehicle) {
    return null;
  }

  const piOptions = splitMultiValue(vehicle.allowedPI);
  const categoryOptions = splitMultiValue(vehicle.category);

  return {
    vehicle,
    pi: pickRandomItem(piOptions),
    category: pickRandomItem(categoryOptions)
  };
}


/* =========================
   관리자 룰렛 시작
========================= */

function startManagerRoulette() {
  if (isManagerRouletteSpinning || rouletteCandidates.length === 0) return;

  const finalResult = createRouletteResult();

  if (!finalResult) return;

  isManagerRouletteSpinning = true;
  currentRouletteResult = null;

  spinManagerRoulette.disabled = true;
  spinManagerRoulette.textContent = "돌리는 중...";

  if (addRouletteResultToMemo) {
    addRouletteResultToMemo.disabled = true;
  }

  managerRouletteResult.classList.add("hidden");
  managerRouletteResult.innerHTML = "";

  const spinSteps = 32;
  let currentStep = 0;

  function spinNext() {
    const previewResult =
      currentStep === spinSteps - 1 ? finalResult : createRouletteResult();

    if (previewResult) {
      renderRouletteSlots(previewResult);
      restartManagerSlotAnimation();
    }

    currentStep++;

    if (currentStep >= spinSteps) {
      isManagerRouletteSpinning = false;
      currentRouletteResult = finalResult;

      spinManagerRoulette.disabled = false;
      spinManagerRoulette.textContent = "다시 돌리기";

      if (addRouletteResultToMemo) {
        addRouletteResultToMemo.disabled = false;
      }

      renderRouletteResult(finalResult);
      return;
    }

    const progress = currentStep / spinSteps;
    const delay = 45 + Math.floor(progress * progress * 190);

    setTimeout(spinNext, delay);
  }

  spinNext();
}


/* =========================
   룰렛 슬롯 표시
========================= */

function renderRouletteSlots(result) {
  const vehicle = result.vehicle;

  managerSlotVehicle.textContent = formatVehicleName(vehicle);
  managerSlotPI.textContent = result.pi || "-";
  managerSlotCategory.textContent = result.category || "-";
}


/* =========================
   차량명 표시
========================= */

function formatVehicleName(vehicle) {
  const year = vehicle.year ? `${vehicle.year} ` : "";
  return `${year}${vehicle.vehicle || "차량명 미입력"}`;
}


/* =========================
   슬롯 애니메이션 재시작
========================= */

function restartManagerSlotAnimation() {
  const slots = [managerSlotVehicle, managerSlotPI, managerSlotCategory];

  slots.forEach((slot) => {
    if (!slot) return;

    slot.classList.remove("spinning");

    void slot.offsetWidth;

    slot.classList.add("spinning");
  });
}


/* =========================
   룰렛 결과 카드 출력
========================= */

function renderRouletteResult(result) {
  const vehicle = result.vehicle;

  managerRouletteResult.innerHTML = `
    <article class="manager-result-card">
      <span class="daily-tune-result-label">MANAGER RESULT</span>

      <p class="manufacturer">${escapeHTML(vehicle.stockPI || "순정 PI 미입력")}</p>
      <h3>${escapeHTML(formatVehicleName(vehicle))}</h3>

      <div class="daily-tune-result-meta">
        <span class="badge">${escapeHTML(result.pi || "PI 미입력")}</span>
        <span class="badge">${escapeHTML(result.category || "용도 미입력")}</span>
      </div>

      <div class="detail-grid">
        ${renderDetailItem("순정 PI", vehicle.stockPI)}
        ${renderDetailItem("선택 PI", result.pi)}
        ${renderDetailItem("선택 용도", result.category)}
        ${renderDetailItem("후보 ID", vehicle.id)}
      </div>

      <h3>메모</h3>
      <p class="summary">${escapeHTML(vehicle.memo || "등록된 메모가 없습니다.")}</p>
    </article>
  `;

  managerRouletteResult.classList.remove("hidden");
}


/* =========================
   상세 정보 한 칸 출력
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
   룰렛 결과를 메모 입력창에 추가
========================= */

function addCurrentResultToMemoForm() {
  if (!currentRouletteResult) return;

  const vehicle = currentRouletteResult.vehicle;
  const title = `${formatVehicleName(vehicle)} / ${currentRouletteResult.pi} / ${currentRouletteResult.category}`;

  const body =
    `룰렛 결과\n\n` +
    `차량: ${formatVehicleName(vehicle)}\n` +
    `순정 PI: ${vehicle.stockPI || "미입력"}\n` +
    `추천 PI: ${currentRouletteResult.pi || "미입력"}\n` +
    `용도: ${currentRouletteResult.category || "미입력"}\n\n` +
    `기존 메모:\n${vehicle.memo || "없음"}`;

  memoTitle.value = title;
  memoBody.value = body;
  memoTag.value = `${currentRouletteResult.pi}, ${currentRouletteResult.category}`;

  memoTitle.focus();
}


/* =========================
   메모 전체 불러오기
========================= */

function getManagerMemos() {
  try {
    const savedText = localStorage.getItem(MANAGER_MEMO_STORAGE_KEY);

    if (!savedText) {
      return [];
    }

    const memos = JSON.parse(savedText);

    if (!Array.isArray(memos)) {
      return [];
    }

    return memos;
  } catch (error) {
    console.error("메모 불러오기 실패:", error);
    return [];
  }
}


/* =========================
   메모 전체 저장
========================= */

function saveManagerMemos(memos) {
  localStorage.setItem(MANAGER_MEMO_STORAGE_KEY, JSON.stringify(memos));
}


/* =========================
   새 메모 저장
========================= */

function saveNewManagerMemo() {
  const title = cleanValue(memoTitle.value);
  const body = cleanValue(memoBody.value);
  const tag = cleanValue(memoTag.value);

  if (!title && !body) {
    alert("제목이나 메모 내용을 입력해줘.");
    return;
  }

  const memos = getManagerMemos();

  const newMemo = {
    id: `memo-${Date.now()}`,
    title: title || "제목 없는 메모",
    body,
    tag,
    createdAt: formatDateTime(new Date())
  };

  memos.unshift(newMemo);
  saveManagerMemos(memos);

  clearMemoInputs();
  renderManagerMemos();

  markButtonCopied(saveManagerMemo, "저장됨!");
}


/* =========================
   메모 입력창 비우기
========================= */

function clearMemoInputs() {
  memoTitle.value = "";
  memoBody.value = "";
  memoTag.value = "";
}


/* =========================
   메모 목록 표시
========================= */

function renderManagerMemos() {
  const memos = getManagerMemos();

  if (memoCountText) {
    memoCountText.textContent = `${memos.length}개 저장됨`;
  }

  if (memos.length === 0) {
    managerMemoList.innerHTML = `
      <div class="weekly-empty">
        아직 저장된 메모가 없습니다.
      </div>
    `;
    return;
  }

  managerMemoList.innerHTML = memos
    .map(
      (memo) => `
        <article class="manager-memo-item">
          <div class="manager-memo-item-header">
            <div>
              <h4>${escapeHTML(memo.title || "제목 없는 메모")}</h4>
              <p>${escapeHTML(memo.createdAt || "")}</p>
            </div>

            <button
              class="daily-tune-action-button danger"
              type="button"
              onclick="deleteManagerMemo('${escapeAttribute(memo.id)}')"
            >
              삭제
            </button>
          </div>

          ${
            memo.tag
              ? `<p class="manager-memo-tag">${escapeHTML(memo.tag)}</p>`
              : ""
          }

          <p class="summary">${escapeHTML(memo.body || "내용 없음")}</p>
        </article>
      `
    )
    .join("");
}


/* =========================
   메모 삭제
========================= */

function deleteManagerMemo(memoId) {
  const confirmed = confirm("이 메모를 삭제할까?");

  if (!confirmed) return;

  const memos = getManagerMemos().filter((memo) => memo.id !== memoId);

  saveManagerMemos(memos);
  renderManagerMemos();
}


/* =========================
   메모 전체 초기화
========================= */

function clearAllMemos() {
  const confirmed = confirm("저장된 메모를 전부 삭제할까?");

  if (!confirmed) return;

  saveManagerMemos([]);
  renderManagerMemos();
}


/* =========================
   메모 전체 복사
========================= */

async function copyAllMemos() {
  const memos = getManagerMemos();

  if (memos.length === 0) {
    alert("복사할 메모가 없어.");
    return;
  }

  const text = memos
    .map(
      (memo) =>
        `[${memo.createdAt}]\n` +
        `${memo.title}\n` +
        `${memo.tag ? `태그: ${memo.tag}\n` : ""}` +
        `${memo.body || ""}`
    )
    .join("\n\n--------------------\n\n");

  try {
    await navigator.clipboard.writeText(text);
    markButtonCopied(copyAllManagerMemos, "복사됨!");
  } catch (error) {
    console.error("메모 복사 실패:", error);
    alert("메모 복사에 실패했어.");
  }
}


/* =========================
   날짜/시간 표시
========================= */

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}


/* =========================
   버튼 상태 표시
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

if (reloadManagerData) {
  reloadManagerData.addEventListener("click", loadManagerData);
}

if (spinManagerRoulette) {
  spinManagerRoulette.addEventListener("click", startManagerRoulette);
}

if (addRouletteResultToMemo) {
  addRouletteResultToMemo.addEventListener("click", addCurrentResultToMemoForm);
}

if (saveManagerMemo) {
  saveManagerMemo.addEventListener("click", saveNewManagerMemo);
}

if (clearMemoForm) {
  clearMemoForm.addEventListener("click", clearMemoInputs);
}

if (copyAllManagerMemos) {
  copyAllManagerMemos.addEventListener("click", copyAllMemos);
}

if (clearAllManagerMemos) {
  clearAllManagerMemos.addEventListener("click", clearAllMemos);
}


/* =========================
   최초 실행
========================= */

loadManagerData();
renderManagerMemos();