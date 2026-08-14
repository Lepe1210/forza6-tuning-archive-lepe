from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path


# ============================================================
# Forza 6 Tuning Archive
# Google Sheets -> GitHub static data mirror
# ============================================================

SOURCE_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/e/"
    "2PACX-1vSbFvBegPwsW2UpUTUMyA8peYLKihKS9HJLqworTV6zC1Zxa96tT7643TsHxVWSTYEKHRtyDSdrD-C3/"
    "pub?gid=0&single=true&output=csv"
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"

CSV_PATH = DATA_DIR / "cars.csv"
JSON_PATH = DATA_DIR / "cars.json"
META_PATH = DATA_DIR / "archive-meta.json"


# 현재 script.js의 parseCars()가 실제로 사용하는 필드명.
# 임의로 이름을 바꾸지 않는다.
CAR_FIELDS = [
    "id",
    "manufacturer",
    "carName",
    "className",
    "carType",
    "drive",
    "category",
    "concept",
    "power",
    "weight",
    "lateralG",
    "shareCode",
    "summary",
    "tuneNotes",
    "updatedAt",
    "testTrackBTime",
    "testTrackCTime",
]


def download_csv() -> bytes:
    """
    Google Sheets 공개 CSV를 메모리로 내려받는다.
    기존 cars.csv에 직접 덮어쓰지 않는다.
    """

    request = urllib.request.Request(
        SOURCE_CSV_URL,
        headers={
            "User-Agent": "Forza6-Tuning-Archive-Mirror/1.0",
            "Accept": "text/csv,text/plain,*/*",
        },
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        status = getattr(response, "status", 200)

        if status != 200:
            raise RuntimeError(
                f"Google Sheets CSV 다운로드 실패: HTTP {status}"
            )

        data = response.read()

    if not data:
        raise RuntimeError(
            "Google Sheets가 빈 응답을 반환했습니다."
        )

    return data


def decode_csv(csv_bytes: bytes) -> str:
    """
    UTF-8 CSV 텍스트로 변환한다.
    Google Sheets가 BOM을 붙여도 처리한다.
    """

    try:
        return csv_bytes.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise RuntimeError(
            "CSV를 UTF-8로 해석하지 못했습니다."
        ) from exc


def clean_value(value: object) -> str:
    if value is None:
        return ""

    return str(value).strip()


def normalize_share_code(value: object) -> str:
    """
    script.js의 normalizeShareCode()와 동일하게
    공유 코드 내부 공백을 제거한다.
    """

    return "".join(clean_value(value).split())


def parse_and_validate_csv(csv_text: str) -> list[dict[str, str]]:
    """
    CSV 구조를 검사한 뒤 cars JSON용 객체 배열로 변환한다.
    """

    reader = csv.DictReader(io.StringIO(csv_text))

    headers = reader.fieldnames

    if not headers:
        raise RuntimeError(
            "CSV 헤더를 찾지 못했습니다."
        )

    headers = [
        clean_value(header)
        for header in headers
        if header is not None
    ]

    missing_fields = [
        field
        for field in CAR_FIELDS
        if field not in headers
    ]

    if missing_fields:
        raise RuntimeError(
            "필수 CSV 컬럼이 없습니다: "
            + ", ".join(missing_fields)
        )

    cars: list[dict[str, str]] = []

    for raw_row in reader:
        row = {
            clean_value(key): value
            for key, value in raw_row.items()
            if key is not None
        }

        car = {
            "eventTitle": clean_value(
                row.get("eventTitle")
            ),
            "id": clean_value(
                row.get("id")
            ),
            "manufacturer": clean_value(
                row.get("manufacturer")
            ),
            "carName": clean_value(
                row.get("carName")
            ),
            "className": clean_value(
                row.get("className")
            ),
            "carType": clean_value(
                row.get("carType")
            ),
            "drive": clean_value(
                row.get("drive")
            ),
            "category": clean_value(
                row.get("category")
            ),
            "concept": clean_value(
                row.get("concept")
            ),
            "power": clean_value(
                row.get("power")
            ),
            "weight": clean_value(
                row.get("weight")
            ),
            "lateralG": clean_value(
                row.get("lateralG")
            ),
            "shareCode": normalize_share_code(
                row.get("shareCode")
            ),
            "summary": clean_value(
                row.get("summary")
            ),
            "tuneNotes": clean_value(
                row.get("tuneNotes")
            ),
            "updatedAt": clean_value(
                row.get("updatedAt")
            ),
            "testTrackBTime": clean_value(
                row.get("testTrackBTime")
            ),
            "testTrackCTime": clean_value(
                row.get("testTrackCTime")
            ),
        }

        # script.js의 parseCars() 필터와 동일
        if (
            car["id"]
            or car["carName"]
            or car["manufacturer"]
        ):
            cars.append(car)

    if not cars:
        raise RuntimeError(
            "유효한 차량 데이터가 0행입니다. "
            "기존 파일을 갱신하지 않습니다."
        )

    return cars


def normalize_csv_bytes(csv_text: str) -> bytes:
    """
    저장할 CSV를 UTF-8 + LF 줄바꿈으로 통일한다.
    """

    normalized = csv_text.replace(
        "\r\n",
        "\n"
    ).replace(
        "\r",
        "\n"
    )

    if not normalized.endswith("\n"):
        normalized += "\n"

    return normalized.encode("utf-8")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def existing_file_matches(
    path: Path,
    new_data: bytes
) -> bool:
    if not path.exists():
        return False

    try:
        current_data = path.read_bytes()
    except OSError:
        return False

    return current_data == new_data


def atomic_write_bytes(
    path: Path,
    data: bytes
) -> None:
    """
    임시 파일에 먼저 기록한 뒤 교체한다.
    기록 중 실패해도 기존 정상 파일을 최대한 보존한다.
    """

    temp_path = path.with_name(
        path.name + ".tmp"
    )

    try:
        temp_path.write_bytes(data)
        os.replace(temp_path, path)
    finally:
        if temp_path.exists():
            temp_path.unlink()


def atomic_write_text(
    path: Path,
    text: str
) -> None:
    atomic_write_bytes(
        path,
        text.encode("utf-8")
    )


def main() -> int:
    DATA_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    print(
        "Google Sheets cars CSV를 확인합니다..."
    )

    raw_csv_bytes = download_csv()
    csv_text = decode_csv(raw_csv_bytes)

    cars = parse_and_validate_csv(csv_text)

    normalized_csv = normalize_csv_bytes(
        csv_text
    )

    # CSV 원본 내용이 이전과 완전히 동일하면
    # JSON/meta도 건드리지 않는다.
    # 따라서 GitHub Actions가 매시간 불필요하게 commit하지 않는다.
    if existing_file_matches(
        CSV_PATH,
        normalized_csv
    ):
        print(
            "변경된 차량 데이터가 없습니다."
        )
        print(
            f"현재 유효 차량 수: {len(cars)}"
        )
        return 0

    json_text = json.dumps(
        cars,
        ensure_ascii=False,
        indent=2
    ) + "\n"

    now = datetime.now(
        timezone.utc
    ).isoformat().replace(
        "+00:00",
        "Z"
    )

    metadata = {
        "source": "Forza 6 Tuning Archive cars",
        "updatedAt": now,
        "rowCount": len(cars),
        "sha256": sha256_bytes(
            normalized_csv
        ),
        "files": {
            "csv": "cars.csv",
            "json": "cars.json",
        },
    }

    meta_text = json.dumps(
        metadata,
        ensure_ascii=False,
        indent=2
    ) + "\n"

    # 모든 검증이 끝난 뒤에만 실제 파일 교체
    atomic_write_bytes(
        CSV_PATH,
        normalized_csv
    )

    atomic_write_text(
        JSON_PATH,
        json_text
    )

    atomic_write_text(
        META_PATH,
        meta_text
    )

    print(
        "아카이브 미러를 갱신했습니다."
    )
    print(
        f"유효 차량 수: {len(cars)}"
    )
    print(
        f"CSV:  {CSV_PATH}"
    )
    print(
        f"JSON: {JSON_PATH}"
    )
    print(
        f"META: {META_PATH}"
    )

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())

    except Exception as exc:
        print(
            f"ERROR: {exc}",
            file=sys.stderr
        )

        # 오류 발생 시 기존 data 파일을 삭제하거나
        # 빈 파일로 덮어쓰지 않고 실패 처리한다.
        sys.exit(1)