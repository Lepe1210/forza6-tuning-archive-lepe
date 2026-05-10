const CARS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbFvBegPwsW2UpUTUMyA8peYLKihKS9HJLqworTV6zC1Zxa96tT7643TsHxVWSTYEKHRtyDSdrD-C3/pub?gid=0&single=true&output=csv";

const WEEKLY_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbFvBegPwsW2UpUTUMyA8peYLKihKS9HJLqworTV6zC1Zxa96tT7643TsHxVWSTYEKHRtyDSdrD-C3/pub?gid=620032495&single=true&output=csv";

const carGrid = document.getElementById("carGrid");
const weeklyGrid = document.getElementById("weeklyGrid");
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

let cars = [];
let weeklyCars = [];

async function loadAllData() {
  try {
    carGrid.innerHTML = `<div class="empty">전체 차량 데이터를 불러오는 중입니다...</div>`;
    weeklyGrid.innerHTML = `<div class="weekly-empty">페스티벌 튜닝차량 데이터를 불러오는 중입니다...</div>`;
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
    renderCars();
  } catch (error) {
    console.error(error);
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
  }
}

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
      updatedAt: cleanValue(row.updatedAt)
    }))
    .filter((car) => car.id || car.carName || car.manufacturer);
}

function cleanValue(value) {
  return value ? value.trim() : "";
}

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
      <article class="weekly-card" onclick="openCarDetail('${car.id}', 'weekly')">
        <div class="meta">
          <span class="badge">${car.className || "클래스 미입력"}</span>
          <span class="badge">${car.carType || "분류 미입력"}</span>
          <span class="badge">${car.drive || "구동방식 미입력"}</span>
          <span class="badge">${car.category || "용도 미입력"}</span>
        </div>

        <p class="manufacturer">${car.manufacturer || "제조사 미입력"}</p>
        <h3>${car.carName || "차량명 미입력"}</h3>

        <p class="share-code">공유 코드: ${car.shareCode || "미입력"}</p>
        <p class="summary">${car.summary || "페스티벌용 설명이 아직 입력되지 않았습니다."}</p>
      </article>
    `
    )
    .join("");
}

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
      <article class="car-card" onclick="openCarDetail('${car.id}', 'cars')">
        <div class="meta">
          <span class="badge">${car.className || "클래스 미입력"}</span>
          <span class="badge">${car.carType || "분류 미입력"}</span>
          <span class="badge">${car.drive || "구동방식 미입력"}</span>
          <span class="badge">${car.category || "용도 미입력"}</span>
        </div>

        <p class="manufacturer">${car.manufacturer || "제조사 미입력"}</p>
        <h2>${car.carName || "차량명 미입력"}</h2>

        <p class="share-code">공유 코드: ${car.shareCode || "미입력"}</p>
        <p class="summary">${car.summary || "주행 평가가 아직 입력되지 않았습니다."}</p>
      </article>
    `
    )
    .join("");
}

function openCarDetail(id, source = "cars") {
  const sourceList = source === "weekly" ? weeklyCars : cars;
  const car = sourceList.find((item) => item.id === id);

  if (!car) return;

  modalBody.innerHTML = `
    <div class="meta">
      <span class="badge">${car.className || "클래스 미입력"}</span>
      <span class="badge">${car.carType || "분류 미입력"}</span>
      <span class="badge">${car.drive || "구동방식 미입력"}</span>
      <span class="badge">${car.category || "용도 미입력"}</span>
    </div>

    <p class="manufacturer">${car.manufacturer || "제조사 미입력"}</p>
    <h2>${car.carName || "차량명 미입력"}</h2>
    <p class="summary">${car.concept || "빌드 콘셉트가 아직 입력되지 않았습니다."}</p>

    <div class="share-box">
      <span class="detail-label">튜닝 공유 코드</span>
      <strong>${car.shareCode || "미입력"}</strong>
    </div>

    <div class="detail-grid">
      <div class="detail-item">
        <span class="detail-label">제조사</span>
        <span class="detail-value">${car.manufacturer || "미입력"}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">차량 분류</span>
        <span class="detail-value">${car.carType || "미입력"}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">구동방식</span>
        <span class="detail-value">${car.drive || "미입력"}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">용도</span>
        <span class="detail-value">${car.category || "미입력"}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">출력</span>
        <span class="detail-value">${car.power || "미입력"}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">중량</span>
        <span class="detail-value">${car.weight || "미입력"}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">횡G</span>
        <span class="detail-value">${car.lateralG || "미입력"}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">최근 수정일</span>
        <span class="detail-value">${car.updatedAt || "미입력"}</span>
      </div>
    </div>

    <h3>주행 평가</h3>
    <p class="summary">${car.summary || "주행 평가가 아직 입력되지 않았습니다."}</p>

    <h3>튜닝 메모</h3>
    <p class="summary">${car.tuneNotes || "튜닝 메모가 아직 입력되지 않았습니다."}</p>
  `;

  modal.classList.remove("hidden");
}

function closeCarDetail() {
  modal.classList.add("hidden");
}

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

loadAllData();