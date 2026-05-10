const carGrid = document.getElementById("carGrid");
const carCount = document.getElementById("carCount");

const searchInput = document.getElementById("searchInput");
const classFilter = document.getElementById("classFilter");
const typeFilter = document.getElementById("typeFilter");
const driveFilter = document.getElementById("driveFilter");
const categoryFilter = document.getElementById("categoryFilter");

const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

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
      ${car.shareCode}
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
      <article class="car-card" onclick="openCarDetail('${car.id}')">
        <div class="meta">
          <span class="badge">${car.className}</span>
          <span class="badge">${car.carType || "분류 미입력"}</span>
          <span class="badge">${car.drive}</span>
          <span class="badge">${car.category}</span>
        </div>
        <h2>${car.carName}</h2>
        <p class="share-code">공유 코드: ${car.shareCode || "미입력"}</p>
        <p class="summary">${car.summary}</p>
        <div class="rating">${car.rating}</div>
      </article>
    `
    )
    .join("");
}

function openCarDetail(id) {
  const car = cars.find((item) => item.id === id);

  if (!car) return;

  modalBody.innerHTML = `
    <div class="meta">
      <span class="badge">${car.className}</span>
      <span class="badge">${car.carType || "분류 미입력"}</span>
      <span class="badge">${car.drive}</span>
      <span class="badge">${car.category}</span>
    </div>

    <h2>${car.carName}</h2>
    <p class="summary">${car.concept}</p>

    <div class="share-box">
      <span class="detail-label">튜닝 공유 코드</span>
      <strong>${car.shareCode || "미입력"}</strong>
    </div>

    <div class="detail-grid">
      <div class="detail-item">
        <span class="detail-label">제조사</span>
        <span class="detail-value">${car.manufacturer}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">차량 분류</span>
        <span class="detail-value">${car.carType || "미입력"}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">최고속</span>
        <span class="detail-value">${car.topSpeed}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">출력</span>
        <span class="detail-value">${car.power}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">중량</span>
        <span class="detail-value">${car.weight}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">최근 수정일</span>
        <span class="detail-value">${car.updatedAt}</span>
      </div>
    </div>

    <h3>주행 평가</h3>
    <p class="summary">${car.summary}</p>

    <h3>튜닝 메모</h3>
    <p class="summary">${car.tuneNotes}</p>
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

renderCars();