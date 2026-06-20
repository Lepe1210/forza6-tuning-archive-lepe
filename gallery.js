/* =========================
   Forza 6 Tuning Archive
   Gallery Page
   - Apps Script galleryList 읽기
   - ImgBB 직접 링크 이미지 표시
========================= */

const GALLERY_API_URL =
  "https://script.google.com/macros/s/AKfycbzqX8DvEixZQdDBEhuFZfm_fJjY66ITdeqhDLuQmCvGkCRjpGVEvP3MZdFkW5uR3X4DWg/exec";


/* =========================
   HTML 요소 가져오기
========================= */

const galleryGrid = document.getElementById("galleryGrid");
const galleryCount = document.getElementById("galleryCount");
const galleryGroupFilter = document.getElementById("galleryGroupFilter");
const refreshGallery = document.getElementById("refreshGallery");

const galleryModal = document.getElementById("galleryModal");
const closeGalleryModal = document.getElementById("closeGalleryModal");
const galleryModalImage = document.getElementById("galleryModalImage");
const galleryModalGroup = document.getElementById("galleryModalGroup");
const galleryModalTitle = document.getElementById("galleryModalTitle");
const galleryModalDate = document.getElementById("galleryModalDate");
const galleryModalPhotographer = document.getElementById("galleryModalPhotographer");


/* =========================
   데이터 저장용 변수
========================= */

let galleryItems = [];


/* =========================
   Apps Script JSONP 호출
========================= */

function callGalleryApi(params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `galleryCallback_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;

    const query = new URLSearchParams({
      ...params,
      callback: callbackName
    });

    const script = document.createElement("script");
    const separator = GALLERY_API_URL.includes("?") ? "&" : "?";

    window[callbackName] = (data) => {
      delete window[callbackName];
      script.remove();

      if (!data || data.ok === false) {
        reject(new Error((data && data.message) || "gallery api error"));
        return;
      }

      resolve(data);
    };

    script.onerror = () => {
      delete window[callbackName];
      script.remove();
      reject(new Error("gallery api load failed"));
    };

    script.src = `${GALLERY_API_URL}${separator}${query.toString()}`;
    document.body.appendChild(script);
  });
}


/* =========================
   갤러리 데이터 불러오기
========================= */

async function loadGallery() {
  try {
    showGalleryLoading();

    const data = await callGalleryApi({
      action: "galleryList"
    });

    galleryItems = Array.isArray(data.items) ? data.items : [];

    buildGalleryGroupFilter();
    renderGallery();
  } catch (error) {
    console.error("갤러리 불러오기 실패:", error);
    renderGalleryError(error);
  }
}


/* =========================
   로딩 표시
========================= */

function showGalleryLoading() {
  if (galleryCount) {
    galleryCount.textContent = "불러오는 중";
  }

  if (galleryGrid) {
    galleryGrid.innerHTML = `
      <div class="weekly-empty">
        갤러리 데이터를 불러오는 중입니다...
      </div>
    `;
  }

  if (refreshGallery) {
    refreshGallery.disabled = true;
    refreshGallery.textContent = "불러오는 중...";
  }
}


/* =========================
   불러오기 실패 표시
========================= */

function renderGalleryError(error) {
  if (galleryCount) {
    galleryCount.textContent = "불러오기 실패";
  }

  if (galleryGrid) {
    galleryGrid.innerHTML = `
      <div class="weekly-empty">
        갤러리 데이터를 불러오지 못했습니다.<br>
        Apps Script 배포 상태와 gallery 시트를 확인해주세요.
      </div>
    `;
  }

  if (refreshGallery) {
    refreshGallery.disabled = false;
    refreshGallery.textContent = "새로고침";
  }
}


/* =========================
   분류 필터 생성
========================= */

function buildGalleryGroupFilter() {
  if (!galleryGroupFilter) return;

  const selectedValue = galleryGroupFilter.value || "all";

  const groups = [...new Set(
    galleryItems
      .map((item) => cleanValue(item.group))
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "ko"));

  galleryGroupFilter.innerHTML = `
    <option value="all">전체 분류</option>
    ${groups
      .map((group) => `
        <option value="${escapeAttribute(group)}">
          ${escapeHTML(group)}
        </option>
      `)
      .join("")}
  `;

  const hasSelectedValue = [...galleryGroupFilter.options].some(
    (option) => option.value === selectedValue
  );

  galleryGroupFilter.value = hasSelectedValue ? selectedValue : "all";
}


/* =========================
   갤러리 렌더링
========================= */

function renderGallery() {
  if (!galleryGrid) return;

  const selectedGroup = galleryGroupFilter ? galleryGroupFilter.value : "all";

  const filteredItems = galleryItems.filter((item) => {
    if (selectedGroup === "all") return true;
    return cleanValue(item.group) === selectedGroup;
  });

  if (galleryCount) {
    galleryCount.textContent = `${filteredItems.length}장 표시 중`;
  }

  if (refreshGallery) {
    refreshGallery.disabled = false;
    refreshGallery.textContent = "새로고침";
  }

  if (filteredItems.length === 0) {
    galleryGrid.innerHTML = `
      <div class="weekly-empty">
        표시할 사진이 없습니다.
      </div>
    `;
    return;
  }

  galleryGrid.innerHTML = filteredItems
    .map((item) => renderGalleryCard(item))
    .join("");
}


/* =========================
   갤러리 카드 렌더링
========================= */

function renderGalleryCard(item) {
  const title = cleanValue(item.title) || "제목 없는 사진";
  const group = cleanValue(item.group) || "기타";
  const imageUrl = cleanValue(item.imageUrl);
  const date = formatGalleryDate(item.date);
  const photographer = cleanValue(item.photographer);

  return `
    <article
      class="gallery-card"
      onclick="openGalleryModal('${escapeAttribute(item.id)}')"
    >
      <div class="gallery-image-wrap">
        <img
          class="gallery-image"
          src="${escapeAttribute(imageUrl)}"
          alt="${escapeAttribute(title)}"
          loading="lazy"
          onerror="this.closest('.gallery-card').classList.add('image-load-error')"
        />
      </div>

      <div class="gallery-card-body">
        <span class="gallery-group-badge">${escapeHTML(group)}</span>
        <h3>${escapeHTML(title)}</h3>

        <div class="gallery-card-meta">
          ${date ? `<span>${escapeHTML(date)}</span>` : ""}
          ${photographer ? `<span>촬영: ${escapeHTML(photographer)}</span>` : ""}
        </div>
      </div>
    </article>
  `;
}


/* =========================
   갤러리 모달 열기
========================= */

function openGalleryModal(itemId) {
  const item = galleryItems.find((entry) => entry.id === itemId);

  if (!item || !galleryModal) return;

  const title = cleanValue(item.title) || "제목 없는 사진";
  const group = cleanValue(item.group) || "기타";
  const imageUrl = cleanValue(item.imageUrl);
  const date = formatGalleryDate(item.date);
  const photographer = cleanValue(item.photographer);

  if (galleryModalImage) {
    galleryModalImage.src = imageUrl;
    galleryModalImage.alt = title;
  }

  if (galleryModalGroup) {
    galleryModalGroup.textContent = group;
  }

  if (galleryModalTitle) {
    galleryModalTitle.textContent = title;
  }

  if (galleryModalDate) {
    galleryModalDate.textContent = date || "";
  }

  if (galleryModalPhotographer) {
    galleryModalPhotographer.textContent = photographer
      ? `촬영: ${photographer}`
      : "";
  }

  galleryModal.classList.remove("hidden");
}


/* =========================
   갤러리 모달 닫기
========================= */

function closeGalleryImageModal() {
  if (!galleryModal) return;

  galleryModal.classList.add("hidden");

  if (galleryModalImage) {
    galleryModalImage.src = "";
    galleryModalImage.alt = "";
  }
}


/* =========================
   빈 값 정리
========================= */

function cleanValue(value) {
  return value ? String(value).trim() : "";
}

/* =========================
   갤러리 날짜 표시 정리
========================= */

function formatGalleryDate(value) {
  const rawValue = cleanValue(value);

  if (!rawValue) {
    return "";
  }

  // 이미 yyyy-MM-dd 형태면 그대로 사용
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    return rawValue;
  }

  const date = new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return rawValue;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

if (galleryGroupFilter) {
  galleryGroupFilter.addEventListener("change", renderGallery);
}

if (refreshGallery) {
  refreshGallery.addEventListener("click", loadGallery);
}

if (closeGalleryModal) {
  closeGalleryModal.addEventListener("click", closeGalleryImageModal);
}

if (galleryModal) {
  galleryModal.addEventListener("click", (event) => {
    if (event.target === galleryModal) {
      closeGalleryImageModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeGalleryImageModal();
  }
});


/* =========================
   최초 실행
========================= */

loadGallery();