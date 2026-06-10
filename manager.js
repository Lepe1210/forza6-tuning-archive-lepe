/* =========================
   Forza 6 Tuning Archive
   관리자 페이지 전용 스크립트
   - list 시트 기반 관리자 룰렛
   - Apps Script / Google Sheets 서버형 메모장
========================= */


/* =========================
   관리자 페이지 직접 접근 방지
========================= */

const MANAGER_ACCESS_SESSION_KEY = "forzaManagerAccess";
const MANAGER_MEMO_AUTH_SESSION_KEY = "forzaManagerMemoAuth";

if (sessionStorage.getItem(MANAGER_ACCESS_SESSION_KEY) !== "ok") {
  window.location.replace("index.html");
}


/* =========================
   Google Sheets / Apps Script URL
========================= */

const LIST_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbFvBegPwsW2UpUTUMyA8peYLKihKS9HJLqworTV6zC1Zxa96tT7643TsHxVWSTYEKHRtyDSdrD-C3/pub?gid=1875896272&single=true&output=csv";

const MANAGER_MEMO_API_URL =
  "https://script.google.com/macros/s/AKfycbzqX8DvEixZQdDBEhuFZfm_fJjY66ITdeqhDLuQmCvGkCRjpGVEvP3MZdFkW5uR3X4DWg/exec";


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

let serverMemos = [];


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
      if (managerSlotVehicle) managerSlotVehicle.textContent = "후보 없음";
      if (managerSlotPI) managerSlotPI.textContent = "-";
      if (managerSlotCategory) managerSlotCategory.textContent = "-";

      if (spinManagerRoulette) {
        spinManagerRoulette.textContent = "룰렛 후보 없음";
        spinManagerRoulette.disabled = true;
      }

      if (managerRouletteResult) {
        managerRouletteResult.classList.remove("hidden");
        managerRouletteResult.innerHTML = `
          <article class="manager-result-card">
            <span class="daily-tune-result-label">NO CANDIDATE</span>
            <h3>룰렛 후보 없음</h3>
            <p class="summary">allowedPI와 category가 입력된 차량만 후보로 사용됩니다.</p>
          </article>
        `;
      }

      return;
    }

    resetRouletteView();

    if (spinManagerRoulette) {
      spinManagerRoulette.textContent = "룰렛 돌리기";
      spinManagerRoulette.disabled = false;
    }
  } catch (error) {
    console.error("관리자 데이터 불러오기 실패:", error);

    setManagerStatus("불러오기 실패", "0대");

    if (managerSlotVehicle) managerSlotVehicle.textContent = "불러오기 실패";
    if (managerSlotPI) managerSlotPI.textContent = "-";
    if (managerSlotCategory) managerSlotCategory.textContent = "-";

    if (spinManagerRoulette) {
      spinManagerRoulette.textContent = "불러오기 실패";
      spinManagerRoulette.disabled = true;
    }

    if (managerRouletteResult) {
      managerRouletteResult.classList.remove("hidden");
      managerRouletteResult.innerHTML = `
        <article class="manager-result-card">
          <span class="daily-tune-result-label">LOAD ERROR</span>
          <h3>list 시트 불러오기 실패</h3>
          <p class="summary">${escapeHTML(error.message || String(error))}</p>
        </article>
      `;
    }
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
========================= */

function isValidRouletteCandidate(vehicle) {
  return (
    vehicle.vehicle &&
    splitMultiValue(vehicle.allowedPI).length > 0 &&
    splitMultiValue(vehicle.category).length > 0
  );
}


/* =========================
   쉼표 구분값 분리
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

  if (managerSlotVehicle) managerSlotVehicle.textContent = "준비 완료";
  if (managerSlotPI) managerSlotPI.textContent = "-";
  if (managerSlotCategory) managerSlotCategory.textContent = "-";

  if (managerRouletteResult) {
    managerRouletteResult.classList.add("hidden");
    managerRouletteResult.innerHTML = "";
  }

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

  if (spinManagerRoulette) {
    spinManagerRoulette.disabled = true;
    spinManagerRoulette.textContent = "돌리는 중...";
  }

  if (addRouletteResultToMemo) {
    addRouletteResultToMemo.disabled = true;
  }

  if (managerRouletteResult) {
    managerRouletteResult.classList.add("hidden");
    managerRouletteResult.innerHTML = "";
  }

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

      if (spinManagerRoulette) {
        spinManagerRoulette.disabled = false;
        spinManagerRoulette.textContent = "다시 돌리기";
      }

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

  if (managerSlotVehicle) {
    managerSlotVehicle.textContent = formatVehicleName(vehicle);
  }

  if (managerSlotPI) {
    managerSlotPI.textContent = result.pi || "-";
  }

  if (managerSlotCategory) {
    managerSlotCategory.textContent = result.category || "-";
  }
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
  if (!managerRouletteResult) return;

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

  if (memoTitle) memoTitle.value = title;
  if (memoBody) memoBody.value = body;
  if (memoTag) {
    memoTag.value = `${currentRouletteResult.pi}, ${currentRouletteResult.category}`;
  }

  if (memoTitle) memoTitle.focus();
}


/* =========================
   서버형 메모 API 인증값 가져오기
========================= */

function getManagerMemoAuth() {
  return sessionStorage.getItem(MANAGER_MEMO_AUTH_SESSION_KEY) || "";
}


/* =========================
   Apps Script 메모 API 호출
   - JSONP 방식
========================= */

function callManagerMemoApi(params = {}) {
  return new Promise((resolve, reject) => {
    const auth = getManagerMemoAuth();

    if (!auth) {
      reject(new Error("memo auth missing"));
      return;
    }

    const callbackName = `managerMemoCallback_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;

    const query = new URLSearchParams({
      ...params,
      auth,
      callback: callbackName
    });

    const script = document.createElement("script");
    const separator = MANAGER_MEMO_API_URL.includes("?") ? "&" : "?";

    window[callbackName] = (data) => {
      delete window[callbackName];
      script.remove();

      if (!data || data.ok === false) {
        reject(new Error((data && data.message) || "memo api error"));
        return;
      }

      resolve(data);
    };

    script.onerror = () => {
      delete window[callbackName];
      script.remove();
      reject(new Error("memo api load failed"));
    };

    script.src = `${MANAGER_MEMO_API_URL}${separator}${query.toString()}`;
    document.body.appendChild(script);
  });
}

window.callManagerMemoApi = callManagerMemoApi;


/* =========================
   서버 메모 불러오기
========================= */

async function loadServerMemos() {
  if (memoCountText) {
    memoCountText.textContent = "불러오는 중";
  }

  if (managerMemoList) {
    managerMemoList.innerHTML = `
      <div class="weekly-empty">
        메모 불러오는 중...
      </div>
    `;
  }

  try {
    const data = await callManagerMemoApi({
      action: "list"
    });

    serverMemos = Array.isArray(data.memos) ? data.memos : [];
    renderServerMemos();
  } catch (error) {
    console.error("서버 메모 불러오기 실패:", error);

    if (memoCountText) {
      memoCountText.textContent = "불러오기 실패";
    }

    if (managerMemoList) {
      managerMemoList.innerHTML = `
        <div class="weekly-empty">
          메모 불러오기 실패
        </div>
      `;
    }
  }
}


/* =========================
   서버 메모 저장
========================= */

async function saveServerMemo() {
  const title = cleanValue(memoTitle && memoTitle.value);
  const body = cleanValue(memoBody && memoBody.value);
  const tag = cleanValue(memoTag && memoTag.value);

  if (!title && !body) {
    alert("제목이나 메모 내용을 입력해줘.");
    if (memoBody) memoBody.focus();
    return;
  }

  if (saveManagerMemo) {
    saveManagerMemo.disabled = true;
    saveManagerMemo.textContent = "저장 중...";
  }

  try {
    await callManagerMemoApi({
      action: "add",
      title,
      body,
      tag,
      source: "manager"
    });

    clearMemoInputs();
    await loadServerMemos();

    markButtonCopied(saveManagerMemo, "저장됨!");
  } catch (error) {
    console.error("서버 메모 저장 실패:", error);
    alert("메모 저장 실패");
  } finally {
    if (saveManagerMemo) {
      saveManagerMemo.disabled = false;
    }
  }
}


/* =========================
   메모 입력창 비우기
========================= */

function clearMemoInputs() {
  if (memoTitle) memoTitle.value = "";
  if (memoBody) memoBody.value = "";
  if (memoTag) memoTag.value = "";
}


/* =========================
   서버 메모 목록 표시
========================= */

function renderServerMemos() {
  if (memoCountText) {
    memoCountText.textContent = `${serverMemos.length}개 저장됨`;
  }

  if (!managerMemoList) return;

  if (serverMemos.length === 0) {
    managerMemoList.innerHTML = `
      <div class="weekly-empty">
        아직 저장된 메모가 없습니다.
      </div>
    `;
    return;
  }

  managerMemoList.innerHTML = serverMemos
    .map((memo) => {
      const title = memo.title || "제목 없는 메모";
      const body = memo.body || "내용 없음";
      const tag = memo.tag || "";
      const createdAt = formatMemoDate(memo.createdAt);

      return `
        <article class="manager-memo-item">
          <div class="manager-memo-item-header">
            <div>
              <h4>${escapeHTML(title)}</h4>
              <p>${escapeHTML(createdAt)}</p>
            </div>

            <button
              class="daily-tune-action-button danger"
              type="button"
              data-delete-server-memo="${escapeAttribute(memo.id)}"
            >
              삭제
            </button>
          </div>

          ${
            tag
              ? `<p class="manager-memo-tag">${escapeHTML(tag)}</p>`
              : ""
          }

          <p class="summary">${escapeHTML(body).replaceAll("\n", "<br />")}</p>
        </article>
      `;
    })
    .join("");
}


/* =========================
   서버 메모 삭제
========================= */

async function deleteServerMemo(memoId) {
  if (!memoId) return;

  const confirmed = confirm("이 메모를 삭제할까?");

  if (!confirmed) return;

  try {
    await callManagerMemoApi({
      action: "delete",
      id: memoId
    });

    await loadServerMemos();
  } catch (error) {
    console.error("서버 메모 삭제 실패:", error);
    alert("메모 삭제 실패");
  }
}


/* =========================
   서버 메모 전체 삭제
========================= */

async function clearAllServerMemos() {
  const confirmed = confirm("저장된 메모를 전부 삭제할까?");

  if (!confirmed) return;

  try {
    await callManagerMemoApi({
      action: "clear"
    });

    await loadServerMemos();
  } catch (error) {
    console.error("서버 메모 전체 삭제 실패:", error);
    alert("전체 삭제 실패");
  }
}


/* =========================
   서버 메모 전체 복사
========================= */

async function copyAllServerMemos() {
  if (serverMemos.length === 0) {
    alert("복사할 메모가 없어.");
    return;
  }

  const text = serverMemos
    .map((memo) => {
      const lines = [];

      lines.push(`[${formatMemoDate(memo.createdAt)}]`);
      if (memo.title) lines.push(memo.title);
      if (memo.tag) lines.push(`태그: ${memo.tag}`);
      if (memo.body) lines.push(memo.body);

      return lines.join("\n");
    })
    .join("\n\n--------------------\n\n");

  try {
    await navigator.clipboard.writeText(text);
    markButtonCopied(copyAllManagerMemos, "복사됨!");
  } catch (error) {
    console.error("메모 복사 실패:", error);
    alert("메모 복사 실패");
  }
}


/* =========================
   날짜/시간 표시
========================= */

function formatMemoDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}


/* =========================
   버튼 상태 표시
========================= */

function markButtonCopied(button, copiedText) {
  if (!button) return;

  const originalText = button.dataset.originalText || button.textContent;
  button.dataset.originalText = originalText;

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
  saveManagerMemo.addEventListener("click", saveServerMemo);
}

if (clearMemoForm) {
  clearMemoForm.addEventListener("click", clearMemoInputs);
}

if (copyAllManagerMemos) {
  copyAllManagerMemos.addEventListener("click", copyAllServerMemos);
}

if (clearAllManagerMemos) {
  clearAllManagerMemos.addEventListener("click", clearAllServerMemos);
}

if (managerMemoList) {
  managerMemoList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-server-memo]");

    if (!deleteButton) return;

    deleteServerMemo(deleteButton.dataset.deleteServerMemo);
  });
}


/* =========================
   최초 실행
========================= */

loadManagerData();
loadServerMemos();