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
# Google Sheets courses -> GitHub static data mirror
# ============================================================

SOURCE_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/e/"
    "2PACX-1vSbFvBegPwsW2UpUTUMyA8peYLKihKS9HJLqworTV6zC1Zxa96tT7643TsHxVWSTYEKHRtyDSdrD-C3/"
    "pub?gid=348221267&single=true&output=csv"
)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"

CSV_PATH = DATA_DIR / "courses.csv"
JSON_PATH = DATA_DIR / "courses.json"
META_PATH = DATA_DIR / "courses-meta.json"

REQUIRED_HEADERS = [
    "courseName",
    "routeType",
    "courseBias",
    "notes",
]

VALID_ROUTE_TYPES = {
    "Road",
    "Dirt",
    "Cross Country",
    "Street",
}


def download_csv() -> bytes:
    request = urllib.request.Request(
        SOURCE_CSV_URL,
        headers={
            "User-Agent": "Forza6-Course-Mirror/1.0",
            "Accept": "text/csv,text/plain,*/*",
        },
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        status = getattr(response, "status", 200)

        if status != 200:
            raise RuntimeError(
                f"Google Sheets courses CSV 다운로드 실패: HTTP {status}"
            )

        data = response.read()

    if not data:
        raise RuntimeError(
            "Google Sheets가 빈 응답을 반환했습니다."
        )

    return data


def decode_csv(csv_bytes: bytes) -> str:
    try:
        return csv_bytes.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        raise RuntimeError(
            "courses CSV를 UTF-8로 해석하지 못했습니다."
        ) from exc


def clean_value(value: object) -> str:
    if value is None:
        return ""

    return str(value).strip()


def parse_and_validate_csv(
    csv_text: str,
) -> list[dict[str, object]]:
    reader = csv.DictReader(io.StringIO(csv_text))

    headers = reader.fieldnames

    if not headers:
        raise RuntimeError(
            "courses CSV 헤더를 찾지 못했습니다."
        )

    headers = [
        clean_value(header)
        for header in headers
        if header is not None
    ]

    missing_fields = [
        field
        for field in REQUIRED_HEADERS
        if field not in headers
    ]

    if missing_fields:
        raise RuntimeError(
            "필수 courses 컬럼이 없습니다: "
            + ", ".join(missing_fields)
        )

    courses: list[dict[str, object]] = []
    seen_names: set[str] = set()

    for line_number, raw_row in enumerate(reader, start=2):
        row = {
            clean_value(key): value
            for key, value in raw_row.items()
            if key is not None
        }

        # 완전히 빈 행은 무시
        if not any(
            clean_value(value)
            for value in row.values()
        ):
            continue

        course_name = clean_value(
            row.get("courseName")
        )
        route_type = clean_value(
            row.get("routeType")
        )
        bias_text = clean_value(
            row.get("courseBias")
        )
        notes = clean_value(
            row.get("notes")
        )

        # courseName 필수
        if not course_name:
            raise RuntimeError(
                f"{line_number}행: courseName이 비어 있습니다."
            )

        # courseName 중복 검사
        normalized_name = course_name.casefold()

        if normalized_name in seen_names:
            raise RuntimeError(
                f"{line_number}행: 중복 courseName입니다: {course_name}"
            )

        seen_names.add(normalized_name)

        # routeType 검사
        if route_type not in VALID_ROUTE_TYPES:
            raise RuntimeError(
                f"{line_number}행: 잘못된 routeType입니다: "
                f"{route_type or '(빈 값)'}"
            )

        # ====================================================
        # courseBias 검사
        #
        # Cross Country:
        # - 빈칸 허용
        # - JSON에서는 null
        #
        # Road / Dirt / Street:
        # - 1~5 정수 필수
        # ====================================================

        if route_type == "Cross Country" and not bias_text:
            course_bias = None

        else:
            try:
                course_bias = int(bias_text)

            except ValueError as exc:
                raise RuntimeError(
                    f"{line_number}행: courseBias가 정수가 아닙니다: "
                    f"{bias_text or '(빈 값)'}"
                ) from exc

            if not 1 <= course_bias <= 5:
                raise RuntimeError(
                    f"{line_number}행: courseBias는 1~5여야 합니다: "
                    f"{course_bias}"
                )

        courses.append(
            {
                "courseName": course_name,
                "routeType": route_type,
                "courseBias": course_bias,
                "notes": notes,
            }
        )

    if not courses:
        raise RuntimeError(
            "유효한 코스 데이터가 0행입니다. "
            "기존 파일을 갱신하지 않습니다."
        )

    return courses


def normalize_csv_bytes(csv_text: str) -> bytes:
    normalized = csv_text.replace(
        "\r\n",
        "\n",
    ).replace(
        "\r",
        "\n",
    )

    if not normalized.endswith("\n"):
        normalized += "\n"

    return normalized.encode("utf-8")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def existing_file_matches(
    path: Path,
    new_data: bytes,
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
    data: bytes,
) -> None:
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
    text: str,
) -> None:
    atomic_write_bytes(
        path,
        text.encode("utf-8"),
    )


def main() -> int:
    DATA_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    print(
        "Google Sheets courses CSV를 확인합니다..."
    )

    raw_csv_bytes = download_csv()
    csv_text = decode_csv(raw_csv_bytes)

    courses = parse_and_validate_csv(
        csv_text
    )

    normalized_csv = normalize_csv_bytes(
        csv_text
    )

    # 원본 CSV가 이전과 동일하면
    # JSON/meta도 수정하지 않는다.
    if existing_file_matches(
        CSV_PATH,
        normalized_csv,
    ):
        print(
            "변경된 코스 데이터가 없습니다."
        )
        print(
            f"현재 유효 코스 수: {len(courses)}"
        )
        return 0

    json_text = json.dumps(
        courses,
        ensure_ascii=False,
        indent=2,
    ) + "\n"

    now = datetime.now(
        timezone.utc
    ).isoformat().replace(
        "+00:00",
        "Z",
    )

    metadata = {
        "source": "Forza 6 Course Master",
        "updatedAt": now,
        "rowCount": len(courses),
        "sha256": sha256_bytes(
            normalized_csv
        ),
        "files": {
            "csv": "courses.csv",
            "json": "courses.json",
        },
    }

    meta_text = json.dumps(
        metadata,
        ensure_ascii=False,
        indent=2,
    ) + "\n"

    # 모든 검증이 끝난 뒤에만 실제 파일 교체
    atomic_write_bytes(
        CSV_PATH,
        normalized_csv,
    )

    atomic_write_text(
        JSON_PATH,
        json_text,
    )

    atomic_write_text(
        META_PATH,
        meta_text,
    )

    print(
        "코스 마스터 미러를 갱신했습니다."
    )
    print(
        f"유효 코스 수: {len(courses)}"
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
            file=sys.stderr,
        )

        # 오류 발생 시 기존 정상 데이터는 보존
        sys.exit(1)