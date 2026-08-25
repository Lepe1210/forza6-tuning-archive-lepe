# 레이레 시즌 추천

## 운영 지침

- 이 파일은 Discord `/추천`이 읽을 **확정 추천 답안지**다. 분석 중간 결과나 임시 후보는 실제 운영 데이터로 기록하지 않는다.
- 목요일 주간 Festival 자동화는 공식 Playlist 확인과 1차 브리핑/초안 생성까지만 담당한다. 자동화가 이 파일을 직접 확정·수정하지 않는다.
- 자동화 결과가 나온 뒤 주간 페스티벌 전문 채팅에서 사용자와 GPT가 이벤트별 제한, 코스, 최신 차량 아카이브와 코스 DB를 다시 검수한다.
- 최종 확정 직전에는 필요한 경우 최신 `cars`와 `courses`를 다시 읽어 오전 자동화 시점 이후의 차량 추가·수정이나 코스 변경을 반영한다.
- 이벤트별 추천은 **최대 1~3픽**의 순위형으로 정한다. 1픽이 최우선 추천이며 2픽·3픽은 추천 가치가 있을 때만 추가한다. 후보가 부족하거나 추천 가치가 낮으면 억지로 3대를 채우지 않는다.
- 각 픽은 단순 기록 순위가 아니라 이벤트 제한, 실제 코스 성격, 차량 성능, `concept`/`summary`/`tuneNotes`까지 검수한 최종 실전 추천으로 본다.
- 사용자와 GPT의 검수가 끝나고 사용자가 최종 확정을 명시한 뒤에만 실제 운영용 현재 시즌 추천을 갱신한다.
- 게시 뒤 새 튠이 추가되거나 기존 추천을 재검토할 필요가 생기면 영향받는 이벤트만 다시 검수하고, 다시 합의한 뒤 갱신한다. 자동으로 추천 순위를 뒤집지 않는다.
- Discord Worker는 추천 판단을 재구현하지 않고 이 파일의 확정 결과만 읽어 표시한다.

## 현재 시즌 메타

- 상태: test
- 기준 주차: 2026-08-20
- 갱신: 2026-08-25 19:10 KST
- 용도: `/추천` parser/Embed 개발을 위한 임시 데이터. 아래 추천은 기존에 확보한 주간 1차 추천을 형식 테스트용으로 옮긴 것이며 새 최종 판정을 의미하지 않는다.

## 현재 시즌 추천

### 도전 — Modern Sports Cars

- 제한: Modern Sports Cars / A 700
- 종목: Road
- 코스:
  - Coastline Sprint | Road | Bias 4 | 마지막에 긴 직선이 있음
  - Edamame Circuit | Road | 코스 DB 미확인
  - Festival Sprint | Road | Bias 3 | 중간에 급브레이크 구간이 있음

#### 1픽

- Tune ID: 4c14-a700
- 차량: Alfa Romeo 4C 2014
- className: A 700
- shareCode: 176374405
- 이유: 기존 주간 1차 추천값을 parser 테스트용으로 이식. 최종 시즌 추천 확정 전 임시 데이터.

### 메인 — Total AWD

- 제한: Total AWD / B 600
- 종목: Cross Country
- 코스:
  - Naruo Cross Country Circuit | Cross Country | Bias 없음
  - Wind Farm Cross Country | Cross Country | Bias 없음
  - Takashiro Cross Country | Cross Country | Bias 없음

#### 1픽

- Tune ID: 4runner19-b600
- 차량: Toyota 4Runner TRD Pro 2019
- className: B 600
- shareCode: 104341261
- 이유: 기존 주간 1차 추천값을 parser 테스트용으로 이식. 최종 시즌 추천 확정 전 임시 데이터.

### 메인 — Hot Hatch

- 제한: Hot Hatch / B 600
- 종목: Street
- 코스:
  - Okishinaimura Run | Street | Bias 1 | 시작부터 아키나 5연속 헤어핀 내려가야함
  - Hokubu Ascent | Street | Bias 4 | 중반에 코스 절반이 오르막 직선이고 직선 끝에 하드 브레이킹 헤어핀이 있음
  - Sunflower Charge | Street | Bias 5 | 대부분 가속 위주이며 중반에 약간의 코너 구간이 있음

#### 1픽

- Tune ID: integra23-b600
- 차량: Acura Integra A-Spec 2023
- className: B 600
- shareCode: 124746623
- 이유: 기존 주간 1차 추천값을 parser 테스트용으로 이식. 최종 시즌 추천 확정 전 임시 데이터.

## 테스트 메모

- 현재 샘플은 각 이벤트에 1픽만 넣어 **2픽·3픽이 없어도 파서가 정상 동작하는지** 확인하기 위한 형태다.
- 실제 운영에서는 추천 가치가 있을 때만 2픽·3픽을 추가하고, 최대 3대까지만 기록한다.
- `상태: test` 데이터는 실전 최종 추천으로 간주하지 않는다.
