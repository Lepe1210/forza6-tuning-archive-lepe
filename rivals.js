/* =========================
   Forza 6 Tuning Archive
   Racing Rivals Exhibition

   구조
   - 처음에는 작은 전시관 카드만 표시
   - 전시관을 누르면 상세 전시가 펼쳐짐
   - 한 번에 하나의 전시관만 열림
   - 닫힌 전시관의 상세 콘텐츠는 제거해
     초기 이미지 로딩과 DOM 부담을 줄임
========================= */


/* =========================
   데이터 주소
========================= */

const CARS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbFvBegPwsW2UpUTUMyA8peYLKihKS9HJLqworTV6zC1Zxa96tT7643TsHxVWSTYEKHRtyDSdrD-C3/pub?gid=0&single=true&output=csv";

const RIVALS_API_URL =
  "https://script.google.com/macros/s/AKfycbzqX8DvEixZQdDBEhuFZfm_fJjY66ITdeqhDLuQmCvGkCRjpGVEvP3MZdFkW5uR3X4DWg/exec";


/* =========================
   테스트 트랙 표시 이름
========================= */

const TRACK_B_NAME = "레전드 섬 서킷";
const TRACK_C_NAME = "세키베 타임어택(오프로드)";


/* =========================
   HTML 요소
========================= */

const rivalSeriesCount =
  document.getElementById("rivalSeriesCount");

const rivalEntryCount =
  document.getElementById("rivalEntryCount");

const refreshRivals =
  document.getElementById("refreshRivals");

const rivalSeriesNav =
  document.getElementById("rivalSeriesNav");

const rivalsStatus =
  document.getElementById("rivalsStatus");

const rivalsMuseum =
  document.getElementById("rivalsMuseum");

const rivalImageModal =
  document.getElementById("rivalImageModal");

const closeRivalImageModal =
  document.getElementById("closeRivalImageModal");

const rivalModalImage =
  document.getElementById("rivalModalImage");

const rivalModalEra =
  document.getElementById("rivalModalEra");

const rivalModalTitle =
  document.getElementById("rivalModalTitle");

const rivalModalText =
  document.getElementById("rivalModalText");

const rivalCarModal =
  document.getElementById("rivalCarModal");

const closeRivalCarModal =
  document.getElementById("closeRivalCarModal");

const rivalCarModalBody =
  document.getElementById("rivalCarModalBody");


/* =========================
   데이터 변수
========================= */

let cars = [];
let rivalSeries = [];
let rivalEntries = [];
let rivalExhibits = [];

let openSeriesId = null;


/* =========================
   전체 데이터 불러오기
========================= */

async function loadRivalsData() {
  setRivalsLoadingState();

  try {
    const carsUrl =
      `${CARS_CSV_URL}&cacheBust=${Date.now()}`;

    const [carsResponse, rivalData] =
      await Promise.all([
        fetch(carsUrl, {
          cache: "no-store"
        }),

        callRivalsApi({
          action: "rivalDataList"
        })
      ]);

    if (!carsResponse.ok) {
      throw new Error(
        "기존 cars 시트 데이터를 불러오지 못했습니다."
      );
    }

    const carsCsvText = await carsResponse.text();

    cars = parseCars(carsCsvText);

    rivalSeries = Array.isArray(rivalData.series)
      ? rivalData.series
      : [];

    rivalEntries = Array.isArray(rivalData.entries)
      ? rivalData.entries
      : [];

    openSeriesId = null;

    buildRivalExhibits();

    renderRivalCounts();
    renderRivalSeriesNav();
    renderRivalsMuseum();
    renderRivalsStatus();
  } catch (error) {
    console.error(
      "라이벌 전시관 불러오기 실패:",
      error
    );

    renderRivalsError(error);
  } finally {
    if (refreshRivals) {
      refreshRivals.disabled = false;
      refreshRivals.textContent = "새로고침";
    }
  }
}


/* =========================
   로딩 상태
========================= */

function setRivalsLoadingState() {
  if (refreshRivals) {
    refreshRivals.disabled = true;
    refreshRivals.textContent = "불러오는 중...";
  }

  if (rivalSeriesCount) {
    rivalSeriesCount.textContent = "0개";
  }

  if (rivalEntryCount) {
    rivalEntryCount.textContent = "0대";
  }

  if (rivalsStatus) {
    rivalsStatus.textContent =
      "전시관 데이터와 기존 튜닝 DB를 불러오는 중입니다.";
  }

  if (rivalSeriesNav) {
    rivalSeriesNav.innerHTML = "";
  }

  if (rivalsMuseum) {
    rivalsMuseum.innerHTML = `
      <div class="weekly-empty">
        라이벌 전시관을 준비하고 있습니다...
      </div>
    `;
  }
}


/* =========================
   불러오기 실패
========================= */

function renderRivalsError(error) {
  if (rivalSeriesCount) {
    rivalSeriesCount.textContent = "0개";
  }

  if (rivalEntryCount) {
    rivalEntryCount.textContent = "0대";
  }

  if (rivalsStatus) {
    rivalsStatus.textContent =
      "전시관 불러오기 실패";
  }

  if (rivalsMuseum) {
    rivalsMuseum.innerHTML = `
      <div class="weekly-empty">
        라이벌 전시관을 불러오지 못했습니다.<br>
        ${escapeHTML(error.message || String(error))}
      </div>
    `;
  }
}


/* =========================
   Apps Script JSONP 호출
========================= */

function callRivalsApi(params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName =
      `rivalsCallback_${Date.now()}_` +
      Math.random().toString(36).slice(2);

    const query = new URLSearchParams({
      ...params,
      callback: callbackName,
      cacheBust: Date.now()
    });

    const script = document.createElement("script");

    const separator =
      RIVALS_API_URL.includes("?") ? "&" : "?";

    let requestFinished = false;

    const timeoutId = setTimeout(() => {
      if (requestFinished) return;

      requestFinished = true;

      delete window[callbackName];
      script.remove();

      reject(
        new Error(
          "라이벌 데이터 요청 시간이 초과되었습니다."
        )
      );
    }, 15000);

    window[callbackName] = (data) => {
      if (requestFinished) return;

      requestFinished = true;

      clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();

      if (!data || data.ok === false) {
        reject(
          new Error(
            (data && data.message) ||
              "라이벌 데이터를 불러오지 못했습니다."
          )
        );

        return;
      }

      resolve(data);
    };

    script.onerror = () => {
      if (requestFinished) return;

      requestFinished = true;

      clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();

      reject(
        new Error(
          "Apps Script 연결에 실패했습니다."
        )
      );
    };

    script.src =
      `${RIVALS_API_URL}${separator}${query.toString()}`;

    document.body.appendChild(script);
  });
}


/* =========================
   cars CSV 변환
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
    .filter((car) => {
      return (
        car.id ||
        car.carName ||
        car.manufacturer
      );
    });
}


/* =========================
   전시 데이터와 cars 결합
========================= */

function buildRivalExhibits() {
  rivalExhibits = rivalEntries.map((entry) => {
    const car = cars.find((item) => {
      return String(item.id) ===
        String(entry.carId);
    });

    return {
      entry,
      car: car || null
    };
  });
}


/* =========================
   전시 차량 가져오기
========================= */

function getSeriesExhibits(seriesId) {
  return rivalExhibits.filter((exhibit) => {
    return (
      String(exhibit.entry.seriesId) ===
        String(seriesId) &&
      !!exhibit.car
    );
  });
}


/* =========================
   개수 표시
========================= */

function renderRivalCounts() {
  const linkedEntryCount =
    rivalExhibits.filter((exhibit) => {
      return !!exhibit.car;
    }).length;

  if (rivalSeriesCount) {
    rivalSeriesCount.textContent =
      `${rivalSeries.length}개`;
  }

  if (rivalEntryCount) {
    rivalEntryCount.textContent =
      `${linkedEntryCount}대`;
  }
}


/* =========================
   상태 표시
========================= */

function renderRivalsStatus() {
  if (!rivalsStatus) return;

  const linkedCount =
    rivalExhibits.filter((exhibit) => {
      return !!exhibit.car;
    }).length;

  const missingCount =
    rivalExhibits.length - linkedCount;

  if (rivalSeries.length === 0) {
    rivalsStatus.textContent =
      "공개된 라이벌 전시관이 아직 없습니다.";

    return;
  }

  if (missingCount > 0) {
    rivalsStatus.textContent =
      `${rivalSeries.length}개 전시관 · ` +
      `${linkedCount}대 전시 중 · ` +
      `${missingCount}개 carId 연결 확인 필요`;

    return;
  }

  rivalsStatus.textContent =
    `${rivalSeries.length}개 전시관 · ` +
    `${linkedCount}대의 라이벌 차량을 전시 중입니다.`;
}


/* =========================
   빠른 이동 메뉴
========================= */

function renderRivalSeriesNav() {
  if (!rivalSeriesNav) return;

  if (rivalSeries.length === 0) {
    rivalSeriesNav.innerHTML = "";
    return;
  }

  rivalSeriesNav.innerHTML = rivalSeries
    .map((series) => {
      return `
        <button
          class="rival-series-nav-button"
          type="button"
          data-open-rival-series-nav="${escapeAttribute(series.id)}"
        >
          ${
            series.era
              ? `<span>${escapeHTML(series.era)}</span>`
              : ""
          }

          <strong>
            ${escapeHTML(series.title)}
          </strong>
        </button>
      `;
    })
    .join("");
}


/* =========================
   전시관 카드 목록 출력
========================= */

function renderRivalsMuseum() {
  if (!rivalsMuseum) return;

  if (rivalSeries.length === 0) {
    rivalsMuseum.innerHTML = `
      <div class="weekly-empty">
        공개된 라이벌 전시관이 아직 없습니다.
      </div>
    `;

    return;
  }

  rivalsMuseum.innerHTML = rivalSeries
    .map((series, index) => {
      return renderRivalSeriesAccordion(
        series,
        index
      );
    })
    .join("");
}


/* =========================
   접힌 전시관 카드
========================= */

function renderRivalSeriesAccordion(
  series,
  index
) {
  const exhibits =
    getSeriesExhibits(series.id);

  const sectionNumber =
    String(index + 1).padStart(2, "0");

  const previewUrl =
    cleanValue(series.previewUrl) ||
    cleanValue(series.heroImageUrl);

  const sectionId =
    getRivalSeriesSectionId(series.id);

  const detailId =
    getRivalSeriesDetailId(series.id);

  return `
    <article
      id="${escapeAttribute(sectionId)}"
      class="rival-series-accordion"
      data-rival-series-id="${escapeAttribute(series.id)}"
    >
      <button
        class="rival-series-summary-card"
        type="button"
        data-toggle-rival-series="${escapeAttribute(series.id)}"
        aria-expanded="false"
        aria-controls="${escapeAttribute(detailId)}"
      >
        ${renderRivalSummaryImage(
          series,
          previewUrl
        )}

        <div class="rival-series-summary-content">
          <div class="rival-series-summary-top">
            <span class="rival-series-summary-number">
              EXHIBITION ${sectionNumber}
            </span>

            ${
              series.era
                ? `
                  <span class="rival-series-summary-era">
                    ${escapeHTML(series.era)}
                  </span>
                `
                : ""
            }
          </div>

          <h2>${escapeHTML(series.title)}</h2>

          ${
            series.subtitle
              ? `
                <p class="rival-series-summary-subtitle">
                  ${escapeHTML(series.subtitle)}
                </p>
              `
              : ""
          }

          <p class="rival-series-summary-description">
            ${escapeHTML(
              series.description ||
                "전시관 소개가 아직 입력되지 않았습니다."
            )}
          </p>

          <div class="rival-series-summary-meta">
            <span>${exhibits.length}대 전시</span>
            <span>전시 보기</span>
          </div>
        </div>

        <span
          class="rival-series-toggle-icon"
          aria-hidden="true"
        >
          ↓
        </span>
      </button>

      <div
        id="${escapeAttribute(detailId)}"
        class="rival-series-detail"
        aria-hidden="true"
      >
        <div class="rival-series-detail-shell">
          <div
            class="rival-series-detail-content"
            data-rival-series-detail-content="${escapeAttribute(series.id)}"
          ></div>
        </div>
      </div>
    </article>
  `;
}


/* =========================
   접힌 카드 썸네일
========================= */

function renderRivalSummaryImage(
  series,
  previewUrl
) {
  if (!previewUrl) {
    return `
      <div class="rival-series-summary-image-placeholder">
        <span>RACING RIVALS</span>

        <strong>
          ${escapeHTML(series.title)}
        </strong>
      </div>
    `;
  }

  return `
    <div class="rival-series-summary-image-wrap">
      <img
        class="rival-series-summary-image"
        src="${escapeAttribute(previewUrl)}"
        alt="${escapeAttribute(series.title)}"
        loading="lazy"
        decoding="async"
      />
    </div>
  `;
}


/* =========================
   전시관 열기/닫기
========================= */

function toggleRivalSeries(seriesId) {
  if (
    String(openSeriesId || "") ===
    String(seriesId)
  ) {
    closeRivalSeries(seriesId);
    return;
  }

  openRivalSeries(seriesId);
}


/* =========================
   전시관 열기
========================= */

function openRivalSeries(
  seriesId,
  shouldScroll = false
) {
  const series = rivalSeries.find((item) => {
    return String(item.id) ===
      String(seriesId);
  });

  if (!series) return;

  if (
    openSeriesId &&
    String(openSeriesId) !== String(seriesId)
  ) {
    closeRivalSeries(openSeriesId);
  }

  const article = document.querySelector(
    `[data-rival-series-id="${cssEscapeValue(seriesId)}"]`
  );

  if (!article) return;

  const summaryButton = article.querySelector(
    "[data-toggle-rival-series]"
  );

  const detail = article.querySelector(
    ".rival-series-detail"
  );

  const detailContent = article.querySelector(
    "[data-rival-series-detail-content]"
  );

  if (!detail || !detailContent) return;

  detailContent.innerHTML =
    renderRivalSeriesDetail(series);

  article.classList.add("open");

  if (summaryButton) {
    summaryButton.setAttribute(
      "aria-expanded",
      "true"
    );
  }

  detail.setAttribute(
    "aria-hidden",
    "false"
  );

  openSeriesId = seriesId;

  if (shouldScroll) {
    setTimeout(() => {
      article.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 80);
  }
}


/* =========================
   전시관 닫기
========================= */

function closeRivalSeries(seriesId) {
  const article = document.querySelector(
    `[data-rival-series-id="${cssEscapeValue(seriesId)}"]`
  );

  if (!article) return;

  const summaryButton = article.querySelector(
    "[data-toggle-rival-series]"
  );

  const detail = article.querySelector(
    ".rival-series-detail"
  );

  const detailContent = article.querySelector(
    "[data-rival-series-detail-content]"
  );

  article.classList.remove("open");

  if (summaryButton) {
    summaryButton.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  if (detail) {
    detail.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  if (
    String(openSeriesId || "") ===
    String(seriesId)
  ) {
    openSeriesId = null;
  }

  /*
   닫힌 전시관 상세 콘텐츠 제거.
   여러 시리즈를 봐도 DOM이 계속 무거워지는 것을 줄임.
  */
  setTimeout(() => {
    if (
      detailContent &&
      !article.classList.contains("open")
    ) {
      detailContent.innerHTML = "";
    }
  }, 420);
}


/* =========================
   펼쳐진 전시관 상세
========================= */

function renderRivalSeriesDetail(series) {
  const exhibits =
    getSeriesExhibits(series.id);

  const heroImageUrl =
    cleanValue(series.heroImageUrl);

  const previewUrl =
    cleanValue(series.previewUrl) ||
    heroImageUrl;

  return `
    <section class="rival-series-expanded-panel">
      <div class="rival-series-hero">
        ${renderSeriesHeroImage(
          series,
          previewUrl,
          heroImageUrl
        )}

        <div class="rival-series-description">
          <div>
            <p class="eyebrow">
              ${
                series.era
                  ? escapeHTML(series.era)
                  : "RACING EXHIBITION"
              }
            </p>

            <h3>
              ${escapeHTML(series.title)}
            </h3>

            ${
              series.subtitle
                ? `
                  <p class="rival-series-expanded-subtitle">
                    ${escapeHTML(series.subtitle)}
                  </p>
                `
                : ""
            }

            <p>
              ${formatMultilineText(
                series.description ||
                  "전시관 소개가 아직 입력되지 않았습니다."
              )}
            </p>
          </div>

          <div class="rival-series-stats">
            <span>${exhibits.length}대 전시</span>

            ${
              series.era
                ? `
                  <span>
                    ${escapeHTML(series.era)}
                  </span>
                `
                : ""
            }
          </div>
        </div>
      </div>

      <section class="rival-entry-grid">
        ${
          exhibits.length > 0
            ? exhibits
                .map(
                  (
                    exhibit,
                    entryIndex
                  ) => {
                    return renderRivalEntryCard(
                      series,
                      exhibit,
                      entryIndex
                    );
                  }
                )
                .join("")
            : `
              <div class="weekly-empty">
                이 전시관에 연결된 차량이 아직 없습니다.
              </div>
            `
        }
      </section>
    </section>
  `;
}


/* =========================
   전시관 대형 이미지
========================= */

function renderSeriesHeroImage(
  series,
  previewUrl,
  originalUrl
) {
  if (!previewUrl && !originalUrl) {
    return `
      <div class="rival-series-image-placeholder">
        <span>EXHIBITION IMAGE</span>

        <strong>
          ${escapeHTML(series.title)}
        </strong>
      </div>
    `;
  }

  return `
    <button
      class="rival-series-image-button"
      type="button"
      data-open-rival-series-image="${escapeAttribute(series.id)}"
      aria-label="${escapeAttribute(series.title)} 대표 이미지 크게 보기"
    >
      <img
        class="rival-series-image"
        src="${escapeAttribute(previewUrl || originalUrl)}"
        alt="${escapeAttribute(series.title)}"
        loading="lazy"
        decoding="async"
      />

      <span class="rival-image-open-label">
        이미지 크게 보기
      </span>
    </button>
  `;
}


/* =========================
   전시 차량 카드
========================= */

function renderRivalEntryCard(
  series,
  exhibit,
  entryIndex
) {
  const entry = exhibit.entry;
  const car = exhibit.car;

  const originalImageUrl =
    cleanValue(entry.imageUrl);

  const previewUrl =
    cleanValue(entry.previewUrl) ||
    originalImageUrl;

  const entryNumber =
    String(entryIndex + 1).padStart(2, "0");

  return `
    <article class="rival-entry-card">
      <div class="rival-entry-number">
        ${entryNumber}
      </div>

      ${renderRivalEntryImage(
        entry,
        car,
        previewUrl,
        originalImageUrl
      )}

      <div class="rival-entry-body">
        <div class="rival-entry-title-row">
          <div>
            <p class="manufacturer">
              ${escapeHTML(
                car.manufacturer ||
                  "제조사 미입력"
              )}
            </p>

            <h3>
              ${escapeHTML(
                car.carName ||
                  "차량명 미입력"
              )}
            </h3>
          </div>

          <span class="rival-entry-pi">
            ${escapeHTML(
              car.className ||
                "PI 미입력"
            )}
          </span>
        </div>

        <div class="rival-entry-badges">
          <span class="badge">
            ${escapeHTML(
              car.drive ||
                "구동방식 미입력"
            )}
          </span>

          <span class="badge">
            ${escapeHTML(
              car.carType ||
                "분류 미입력"
            )}
          </span>

          <span class="badge">
            ${escapeHTML(
              car.category ||
                "용도 미입력"
            )}
          </span>
        </div>

        ${
          entry.role
            ? `
              <div class="rival-entry-role">
                <span class="detail-label">
                  EXHIBIT ROLE
                </span>

                <strong>
                  ${escapeHTML(entry.role)}
                </strong>
              </div>
            `
            : ""
        }

        <p class="rival-entry-description">
          ${formatMultilineText(
            entry.exhibitText ||
              car.concept ||
              "전시 설명이 아직 입력되지 않았습니다."
          )}
        </p>

        <div class="rival-entry-share-code">
          <span class="detail-label">
            공유 코드
          </span>

          <strong>
            ${escapeHTML(
              formatShareCode(
                car.shareCode
              ) || "미입력"
            )}
          </strong>
        </div>

        <div class="rival-entry-actions">
          ${
            originalImageUrl ||
            previewUrl
              ? `
                <button
                  class="daily-tune-action-button"
                  type="button"
                  data-open-rival-entry-image="${escapeAttribute(entry.id)}"
                >
                  사진 크게 보기
                </button>
              `
              : ""
          }

          <button
            class="daily-tune-action-button primary"
            type="button"
            data-open-rival-entry-detail="${escapeAttribute(entry.id)}"
          >
            튜닝 상세 보기
          </button>
        </div>
      </div>
    </article>
  `;
}


/* =========================
   전시 차량 이미지
========================= */

function renderRivalEntryImage(
  entry,
  car,
  previewUrl,
  originalUrl
) {
  if (!previewUrl && !originalUrl) {
    return `
      <div class="rival-entry-image-placeholder">
        <span>RIVAL MACHINE</span>

        <strong>
          ${escapeHTML(
            `${car.manufacturer} ${car.carName}`.trim()
          )}
        </strong>
      </div>
    `;
  }

  return `
    <button
      class="rival-entry-image-button"
      type="button"
      data-open-rival-entry-image="${escapeAttribute(entry.id)}"
      aria-label="${escapeAttribute(car.carName)} 이미지 크게 보기"
    >
      <img
        class="rival-entry-image"
        src="${escapeAttribute(previewUrl || originalUrl)}"
        alt="${escapeAttribute(
          `${car.manufacturer} ${car.carName}`.trim()
        )}"
        loading="lazy"
        decoding="async"
      />

      <span class="rival-image-open-label">
        원본 이미지
      </span>
    </button>
  `;
}


/* =========================
   전시관 HTML ID
========================= */

function getRivalSeriesSectionId(seriesId) {
  return (
    "rival-series-" +
    String(seriesId || "")
      .replace(/[^A-Za-z0-9_-]/g, "-")
  );
}

function getRivalSeriesDetailId(seriesId) {
  return (
    "rival-series-detail-" +
    String(seriesId || "")
      .replace(/[^A-Za-z0-9_-]/g, "-")
  );
}


/* =========================
   CSS 선택자용 문자열
========================= */

function cssEscapeValue(value) {
  if (
    window.CSS &&
    typeof window.CSS.escape === "function"
  ) {
    return window.CSS.escape(
      String(value || "")
    );
  }

  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll('"', '\\"');
}


/* =========================
   전시관 대표 이미지 모달
========================= */

function openRivalSeriesImage(seriesId) {
  const series = rivalSeries.find((item) => {
    return String(item.id) ===
      String(seriesId);
  });

  if (!series) return;

  const imageUrl =
    cleanValue(series.heroImageUrl) ||
    cleanValue(series.previewUrl);

  if (!imageUrl) return;

  openRivalImageModal({
    imageUrl,
    era: series.era,
    title: series.title,
    text: series.description
  });
}


/* =========================
   전시 차량 이미지 모달
========================= */

function openRivalEntryImage(entryId) {
  const exhibit = rivalExhibits.find((item) => {
    return String(item.entry.id) ===
      String(entryId);
  });

  if (!exhibit || !exhibit.car) return;

  const entry = exhibit.entry;
  const car = exhibit.car;

  const series = rivalSeries.find((item) => {
    return String(item.id) ===
      String(entry.seriesId);
  });

  const imageUrl =
    cleanValue(entry.imageUrl) ||
    cleanValue(entry.previewUrl);

  if (!imageUrl) return;

  openRivalImageModal({
    imageUrl,
    era: series ? series.era : "",
    title:
      `${car.manufacturer || ""} ` +
      `${car.carName || ""}`,
    text:
      entry.exhibitText ||
      entry.role ||
      car.concept ||
      ""
  });
}


/* =========================
   이미지 모달 열기
========================= */

function openRivalImageModal({
  imageUrl,
  era,
  title,
  text
}) {
  if (
    !rivalImageModal ||
    !rivalModalImage
  ) {
    return;
  }

  rivalModalImage.src = imageUrl;
  rivalModalImage.alt =
    title || "전시 이미지";

  if (rivalModalEra) {
    rivalModalEra.textContent =
      era || "";
  }

  if (rivalModalTitle) {
    rivalModalTitle.textContent =
      title || "";
  }

  if (rivalModalText) {
    rivalModalText.textContent =
      text || "";
  }

  rivalImageModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}


/* =========================
   이미지 모달 닫기
========================= */

function closeRivalImageViewer() {
  if (!rivalImageModal) return;

  rivalImageModal.classList.add("hidden");

  if (rivalModalImage) {
    rivalModalImage.src = "";
    rivalModalImage.alt = "";
  }

  document.body.classList.remove("modal-open");
}


/* =========================
   차량 상세 모달
========================= */

function openRivalCarDetail(entryId) {
  const exhibit = rivalExhibits.find((item) => {
    return String(item.entry.id) ===
      String(entryId);
  });

  if (
    !exhibit ||
    !exhibit.car ||
    !rivalCarModalBody
  ) {
    return;
  }

  const entry = exhibit.entry;
  const car = exhibit.car;

  const series = rivalSeries.find((item) => {
    return String(item.id) ===
      String(entry.seriesId);
  });

  const shareCode =
    normalizeShareCode(car.shareCode);

  const displayShareCode =
    formatShareCode(car.shareCode);

  rivalCarModalBody.innerHTML = `
    <div class="rival-car-modal-heading">
      <p class="eyebrow">
        ${escapeHTML(
          series
            ? series.title
            : "RACING RIVALS"
        )}
      </p>

      ${
        entry.role
          ? `
            <p class="rival-car-modal-role">
              ${escapeHTML(entry.role)}
            </p>
          `
          : ""
      }

      <p class="manufacturer">
        ${escapeHTML(
          car.manufacturer ||
            "제조사 미입력"
        )}
      </p>

      <h2>
        ${escapeHTML(
          car.carName ||
            "차량명 미입력"
        )}
      </h2>

      <p class="summary">
        ${formatMultilineText(
          entry.exhibitText ||
            car.concept ||
            "빌드 콘셉트가 아직 입력되지 않았습니다."
        )}
      </p>
    </div>

    ${renderCarBadges(car)}

    <div class="share-box">
      <span class="detail-label">
        튜닝 공유 코드
      </span>

      <div class="share-code-row">
        <button
          class="copy-code-button"
          type="button"
          data-copy-rival-share-code="${escapeAttribute(shareCode)}"
        >
          복사
        </button>

        <strong>
          ${escapeHTML(
            displayShareCode ||
              "미입력"
          )}
        </strong>
      </div>
    </div>

    <div class="detail-grid">
      ${renderDetailItem(
        "제조사",
        car.manufacturer
      )}

      ${renderDetailItem(
        "PI",
        car.className
      )}

      ${renderDetailItem(
        "차량 분류",
        car.carType
      )}

      ${renderDetailItem(
        "구동방식",
        car.drive
      )}

      ${renderDetailItem(
        "용도",
        car.category
      )}

      ${renderDetailItem(
        "출력",
        car.power
      )}

      ${renderDetailItem(
        "중량",
        car.weight
      )}

      ${renderDetailItem(
        "횡G",
        car.lateralG
      )}

      ${renderDetailItem(
        "최근 수정일",
        car.updatedAt
      )}

      ${renderDetailItem(
        TRACK_B_NAME,
        car.testTrackBTime
      )}

      ${renderDetailItem(
        TRACK_C_NAME,
        car.testTrackCTime
      )}
    </div>

    <h3>빌드 콘셉트</h3>

    <p class="summary">
      ${formatMultilineText(
        car.concept ||
          "빌드 콘셉트가 아직 입력되지 않았습니다."
      )}
    </p>

    <h3>주행 평가</h3>

    <p class="summary">
      ${formatMultilineText(
        car.summary ||
          "주행 평가가 아직 입력되지 않았습니다."
      )}
    </p>

    <h3>튜닝 메모</h3>

    <p class="summary">
      ${formatMultilineText(
        car.tuneNotes ||
          "튜닝 메모가 아직 입력되지 않았습니다."
      )}
    </p>
  `;

  if (rivalCarModal) {
    rivalCarModal.classList.remove("hidden");
    document.body.classList.add("modal-open");
  }
}


/* =========================
   차량 상세 닫기
========================= */

function closeRivalCarDetail() {
  if (!rivalCarModal) return;

  rivalCarModal.classList.add("hidden");

  if (rivalCarModalBody) {
    rivalCarModalBody.innerHTML = "";
  }

  document.body.classList.remove("modal-open");
}


/* =========================
   차량 배지
========================= */

function renderCarBadges(car) {
  return `
    <div class="meta">
      <span class="badge">
        ${escapeHTML(
          car.className ||
            "PI 미입력"
        )}
      </span>

      <span class="badge">
        ${escapeHTML(
          car.carType ||
            "분류 미입력"
        )}
      </span>

      <span class="badge">
        ${escapeHTML(
          car.drive ||
            "구동방식 미입력"
        )}
      </span>

      <span class="badge">
        ${escapeHTML(
          car.category ||
            "용도 미입력"
        )}
      </span>
    </div>
  `;
}


/* =========================
   상세 정보 칸
========================= */

function renderDetailItem(label, value) {
  return `
    <div class="detail-item">
      <span class="detail-label">
        ${escapeHTML(label)}
      </span>

      <span class="detail-value">
        ${escapeHTML(
          value || "미입력"
        )}
      </span>
    </div>
  `;
}


/* =========================
   공유 코드
========================= */

function normalizeShareCode(code) {
  return cleanValue(code)
    .replace(/\s+/g, "");
}

function formatShareCode(code) {
  const normalized =
    normalizeShareCode(code);

  if (!normalized) {
    return "";
  }

  if (normalized.length !== 9) {
    return normalized;
  }

  return (
    `${normalized.slice(0, 3)} ` +
    `${normalized.slice(3, 6)} ` +
    `${normalized.slice(6, 9)}`
  );
}


/* =========================
   공유 코드 복사
========================= */

async function copyRivalShareCode(
  code,
  button
) {
  const normalizedCode =
    normalizeShareCode(code);

  if (!normalizedCode) return;

  try {
    await copyTextToClipboard(
      normalizedCode
    );

    markButtonCopied(
      button,
      "복사됨!"
    );
  } catch (error) {
    console.error(
      "공유 코드 복사 실패:",
      error
    );

    markButtonCopied(
      button,
      "복사 실패"
    );
  }
}


/* =========================
   클립보드 복사
========================= */

async function copyTextToClipboard(text) {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText ===
      "function"
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea =
    document.createElement("textarea");

  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);

  textarea.focus();
  textarea.select();

  const successful =
    document.execCommand("copy");

  textarea.remove();

  if (!successful) {
    throw new Error(
      "clipboard copy failed"
    );
  }
}


/* =========================
   버튼 상태
========================= */

function markButtonCopied(
  button,
  copiedText
) {
  if (!button) return;

  const originalText =
    button.dataset.originalText ||
    button.textContent;

  button.dataset.originalText =
    originalText;

  button.textContent = copiedText;
  button.classList.add("copied");

  setTimeout(() => {
    button.textContent =
      originalText;

    button.classList.remove("copied");
  }, 1200);
}


/* =========================
   CSV 파서
========================= */

function parseCSV(text) {
  const rows = [];

  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (
    let i = 0;
    i < text.length;
    i++
  ) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (
      char === '"' &&
      insideQuotes &&
      nextChar === '"'
    ) {
      currentValue += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (
      char === "," &&
      !insideQuotes
    ) {
      currentRow.push(currentValue);
      currentValue = "";
    } else if (
      (char === "\n" ||
        char === "\r") &&
      !insideQuotes
    ) {
      if (
        char === "\r" &&
        nextChar === "\n"
      ) {
        i++;
      }

      currentRow.push(currentValue);

      if (
        currentRow.some((value) => {
          return value.trim() !== "";
        })
      ) {
        rows.push(currentRow);
      }

      currentRow = [];
      currentValue = "";
    } else {
      currentValue += char;
    }
  }

  currentRow.push(currentValue);

  if (
    currentRow.some((value) => {
      return value.trim() !== "";
    })
  ) {
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map(
    (header) => {
      return header.trim();
    }
  );

  return rows.slice(1).map((row) => {
    const rowObject = {};

    headers.forEach(
      (header, index) => {
        rowObject[header] =
          row[index] || "";
      }
    );

    return rowObject;
  });
}


/* =========================
   문자열 정리
========================= */

function cleanValue(value) {
  return (
    value === null ||
    value === undefined
  )
    ? ""
    : String(value).trim();
}

function formatMultilineText(value) {
  return escapeHTML(
    cleanValue(value)
  ).replaceAll(
    "\n",
    "<br />"
  );
}


/* =========================
   특수문자 처리
========================= */

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value)
    .replaceAll(
      "`",
      "&#096;"
    );
}


/* =========================
   이미지 오류
========================= */

function handleRivalImageError(event) {
  const image = event.target;

  if (
    !(image instanceof HTMLImageElement)
  ) {
    return;
  }

  const imageContainer =
    image.parentElement;

  if (imageContainer) {
    imageContainer.classList.add(
      "image-load-error"
    );
  }
}


/* =========================
   이벤트 연결
========================= */

if (refreshRivals) {
  refreshRivals.addEventListener(
    "click",
    loadRivalsData
  );
}

if (rivalSeriesNav) {
  rivalSeriesNav.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest(
        "[data-open-rival-series-nav]"
      );

      if (!button) return;

      openRivalSeries(
        button.dataset.openRivalSeriesNav,
        true
      );
    }
  );
}

if (rivalsMuseum) {
  rivalsMuseum.addEventListener(
    "click",
    (event) => {
      const toggleButton =
        event.target.closest(
          "[data-toggle-rival-series]"
        );

      if (toggleButton) {
        toggleRivalSeries(
          toggleButton.dataset.toggleRivalSeries
        );

        return;
      }

      const seriesImageButton =
        event.target.closest(
          "[data-open-rival-series-image]"
        );

      if (seriesImageButton) {
        openRivalSeriesImage(
          seriesImageButton.dataset
            .openRivalSeriesImage
        );

        return;
      }

      const entryImageButton =
        event.target.closest(
          "[data-open-rival-entry-image]"
        );

      if (entryImageButton) {
        openRivalEntryImage(
          entryImageButton.dataset
            .openRivalEntryImage
        );

        return;
      }

      const entryDetailButton =
        event.target.closest(
          "[data-open-rival-entry-detail]"
        );

      if (entryDetailButton) {
        openRivalCarDetail(
          entryDetailButton.dataset
            .openRivalEntryDetail
        );
      }
    }
  );

  rivalsMuseum.addEventListener(
    "error",
    handleRivalImageError,
    true
  );
}

if (rivalCarModalBody) {
  rivalCarModalBody.addEventListener(
    "click",
    (event) => {
      const copyButton =
        event.target.closest(
          "[data-copy-rival-share-code]"
        );

      if (!copyButton) return;

      copyRivalShareCode(
        copyButton.dataset
          .copyRivalShareCode,
        copyButton
      );
    }
  );
}

if (closeRivalImageModal) {
  closeRivalImageModal.addEventListener(
    "click",
    closeRivalImageViewer
  );
}

if (closeRivalCarModal) {
  closeRivalCarModal.addEventListener(
    "click",
    closeRivalCarDetail
  );
}

if (rivalImageModal) {
  rivalImageModal.addEventListener(
    "click",
    (event) => {
      if (
        event.target ===
        rivalImageModal
      ) {
        closeRivalImageViewer();
      }
    }
  );
}

if (rivalCarModal) {
  rivalCarModal.addEventListener(
    "click",
    (event) => {
      if (
        event.target ===
        rivalCarModal
      ) {
        closeRivalCarDetail();
      }
    }
  );
}

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key !== "Escape") {
      return;
    }

    closeRivalImageViewer();
    closeRivalCarDetail();
  }
);


/* =========================
   최초 실행
========================= */

loadRivalsData();