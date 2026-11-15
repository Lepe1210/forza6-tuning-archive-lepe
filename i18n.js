/* Display-only Korean/English localization. Sheet values and identifiers stay intact. */
(() => {
  'use strict';
  const EN = {
  "이번 주의": "This week's",
  "출전 차량.": "starting grid.",
  "주간 페스티벌을 위한 튜닝을 한눈에.": "Festival-ready tunes, all in one place.",
  "고를 차가 정해졌다면 공유 코드만 챙기면 됩니다.": "Pick your car, then grab its share code.",
  "✦ 오늘의 튜닝 뽑기": "✦ Pick today's tune",
  "바로가기": "Shortcuts",
  "페스티벌 플레이리스트": "Festival Playlist",
  "타임어택 보드": "Time Attack Board",
  "PI별 평균 기록": "Average times by PI",
  "전체 튜닝": "All Tunes",
  "이용 가이드": "Site Guide",
  "페스티벌 튜닝차량": "Festival Tunes",
  "페스티벌 플레이리스트 진행용으로 추천하는 튜닝 차량입니다.": "Recommended tunes for the current Festival Playlist.",
  "지난 시즌 튜닝 보기": "Browse past seasons",
  "전체 차량 DB 기준으로 테스트 트랙별 평균 기록을 계산합니다.": "Average test-track times across the archive's recorded tunes.",
  "전체 차량 목록.": "The complete garage.",
  "차량 검색": "Search cars",
  "차량명, 제조사, 콘셉트, 공유 코드 검색": "Search car, manufacturer, concept or share code",
  "필터 ▾": "Filters ▾",
  "PI: 전체": "PI: All",
  "전체 PI": "All PI",
  "PI · 다중 선택": "PI · Select multiple",
  "전체로 보기": "Clear selection",
  "PI 선택": "Select PI",
  "차량 분류: 전체": "Car type: All",
  "전체 차량 분류": "All car types",
  "차량 분류 · 다중 선택": "Car type · Select multiple",
  "차량 분류 선택": "Select car types",
  "버기": "Buggies",
  "클래식 머슬": "Classic Muscle",
  "클래식 레이스카": "Classic Racers",
  "클래식 랠리": "Classic Rally",
  "클래식 스포츠카": "Classic Sports Cars",
  "컬트 자동차": "Cult Cars",
  "드리프트 자동차": "Drift Cars",
  "대중 국산차": "Eclectic Domestics",
  "익스트림 트랙토이": "Extreme Track Toys",
  "GT 자동차": "GT Cars",
  "핫 해치": "Hot Hatch",
  "하이퍼카": "Hypercars",
  "모던 머슬": "Modern Muscle",
  "모던 랠리": "Modern Rally",
  "모던 스포츠카": "Modern Sports Cars",
  "모던 슈퍼 세단": "Modern Super Saloons",
  "모던 슈퍼카": "Modern Supercars",
  "오프로드": "Offroad",
  "픽업 및 4*4": "Pickups & 4x4's",
  "랠리 몬스터": "Rally Monsters",
  "희귀 클래식": "Rare Classics",
  "레트로 핫 해치": "Retro Hot Hatch",
  "레트로 머슬": "Retro Muscle",
  "레트로 레이서": "Retro Racers",
  "레트로 랠리": "Retro Rally",
  "레트로 스포츠카": "Retro Sports Cars",
  "레트로 슈퍼 세단": "Retro Super Saloons",
  "레트로 슈퍼카": "Retro Supercars",
  "로드 및 커스텀": "Rods and Customs",
  "스포츠 유틸리티 영웅": "Sports Utility Heroes",
  "슈퍼 GT": "Super GT",
  "슈퍼 핫 해치": "Super Hot Hatch",
  "트랙 토이": "Track Toys",
  "언리미티드 버기": "Unlimited Buggies",
  "언리미티드 오프로드": "Unlimited Offroad",
  "유틸리티 히어로": "Utility Heroes",
  "구동방식: 전체": "Drivetrain: All",
  "전체 구동방식": "All drivetrains",
  "구동방식 · 다중 선택": "Drivetrain · Select multiple",
  "구동방식 선택": "Select drivetrains",
  "용도: 전체": "Use: All",
  "전체 용도": "All uses",
  "용도 · 다중 선택": "Use · Select multiple",
  "용도 선택": "Select uses",
  "온로드": "Road",
  "혼합": "Mixed Surface",
  "페스티벌 시즌 숙제": "Festival Playlist",
  "연대: 전체": "Decade: All",
  "전체 연대": "All decades",
  "연대 · 다중 선택": "Decade · Select multiple",
  "연대 선택": "Select decades",
  "60년대": "1960s",
  "70년대": "1970s",
  "80년대": "1980s",
  "90년대": "1990s",
  "00년대": "2000s",
  "10년대": "2010s",
  "20년대": "2020s",
  "기타": "Other",
  "기본 정렬": "Default order",
  "제조사순": "Manufacturer",
  "PI순": "PI",
  "최근 수정순": "Recently updated",
  "레전드 섬 서킷 빠른 순": "Legend Island · Fastest first",
  "세키베(오프로드) 빠른 순": "Sekibe (Offroad) · Fastest first",
  "0대 표시 중": "Showing 0 cars",
  "필터 초기화": "Reset filters",
  "데이터 새로고침": "Refresh data",
  "전체 튜닝 목록": "All tunes",
  "튜닝 목록 페이지": "Tune catalogue pages",
  "이전": "Previous",
  "다음": "Next",
  "영상으로 먼저 달려봐.": "See the tunes in action.",
  "아카이브의 튜닝을 실제 주행 영상으로 만나보세요.": "Watch how the archive's tunes drive in actual gameplay.",
  "YouTube 채널 ↗": "YouTube channel ↗",
  "오늘의 튜닝 룰렛": "Today's Random Tune",
  "오늘 탈 차량을 하나 뽑아보세요. 하루에 한 번만 뽑을 수 있습니다.": "Pick a car to drive today. One pick per day.",
  "준비 완료": "Ready",
  "뽑기 시작": "Start",
  "지난 시즌 튜닝 | Forza 6 Tuning Archive": "Past Seasons | Forza 6 Tuning Archive",
  "지난 시즌 튜닝": "Past Seasons",
  "이전 페스티벌 시즌 숙제용 튜닝을 주차별로 접어서 보관하는 아카이브입니다.": "Previous Festival Playlist tunes, grouped by week.",
  "메인 튜닝 아카이브로 돌아가기": "Back to the tuning archive",
  "시즌별 튜닝 기록": "Tunes by season",
  "시즌 제목을 누르면 해당 주차의 튜닝 차량 목록이 펼쳐집니다.": "Select a season title to expand that week's tunes.",
  "지난 시즌 튜닝 데이터를 불러오는 중입니다...": "Loading past seasons...",
  "갤러리": "Gallery",
  "모임 사진, 포토모드, 예쁜 스크린샷을 모아두는 공간입니다.": "Meetup photos, Photo Mode shots and moments worth keeping.",
  "메인으로 돌아가기": "Back to home",
  "사진 목록": "Photos",
  "불러오는 중": "Loading",
  "전체 분류": "All categories",
  "새로고침": "Refresh",
  "갤러리 데이터를 불러오는 중입니다...": "Loading gallery...",
  "실제 모터스포츠 무대에서 맞붙었던 라이벌들을 포르자 6 튜닝으로 재해석한 특별 전시관입니다.": "Historic motorsport rivalries, recreated as Forza 6 tuning builds.",
  "갤러리 보기": "View gallery",
  "모터스포츠 라이벌 컬렉션": "Motorsport Rival Collection",
  "시대와 경기장을 대표했던 라이벌 차량의 특징을 살려 게임 안에서 다시 제작한 전시형 튜닝 컬렉션입니다.": "Exhibition builds that capture the character of iconic rivals from different eras and racing series.",
  "전시관": "Exhibitions",
  "0개": "0 exhibitions",
  "전시 차량": "Exhibition cars",
  "0대": "0 cars",
  "라이벌 전시관 목록": "Rival exhibitions",
  "전시관 데이터를 불러오는 중입니다.": "Loading exhibition data.",
  "라이벌 전시관을 준비하고 있습니다...": "Preparing rival exhibitions...",
  "이미지 닫기": "Close image",
  "차량 상세 닫기": "Close car details",
  "사이트 이용 가이드 | Forza 6 Tuning Archive": "Site Guide | Forza 6 Tuning Archive",
  "어서 와.": "Welcome.",
  "내 아카이브를 소개할게.": "Let me show you around.",
  "이번 주에 탈 차를 찾고 있어?": "Looking for a car for this week's events?",
  "아니면 마음에 드는 튜닝을 골라보고 싶어?": "Or a tune you'll enjoy driving?",
  "찾는 법부터 공유 코드를 가져가는 방법까지, 같이 둘러보자.": "Let's go through finding a tune and taking its share code into the game.",
  "LEPE · 아카이브 주인": "LEPE · Archive owner",
  "남색 조끼를 입고 기록장을 든 레페가 안내하는 모습": "Lepe, wearing a navy waistcoat and holding a notebook, guides you through the archive",
  "가이드 목차": "Guide contents",
  "이번 주 추천 찾기 ↘": "Find this week's picks ↘",
  "원하는 튜닝 찾기 ↘": "Find your next tune ↘",
  "기록 이해하기 ↘": "Understand the times ↘",
  "앱처럼 설치하기 ↘": "Install as an app ↘",
  "이번 주에 탈 차부터 찾자.": "Start with this week's picks.",
  "레페의 한마디": "A word from Lepe",
  "메인의 페스티벌 추천에서 도전·메인1·메인2·PR 스턴트에 맞는 튜닝을 찾아봐. 추천 카드에는 공유 코드가 바로 보여서 펼치지 않고도 복사할 수 있어.": "The home page has picks for The Trial, Seasonal Championships 1–3 and PR Stunts. Share codes are visible on the cards, so you can copy them without opening the details.",
  "튜닝을 가져가는 세 단계.": "Get a tune in three steps.",
  "1. 찾기": "1. Find",
  "차량명·제조사·콘셉트·공유 코드 검색": "Search car, manufacturer, concept or share code",
  "예: Honda S800": "Example: Honda S800",
  "전체 차량 목록에서 검색해봐. PI·분류·구동·용도·연대 필터로 후보를 좁힐 수도 있어.": "Search the complete car list. Use PI, car type, drivetrain, use and decade filters to narrow it down.",
  "2. 확인하기": "2. Check",
  "PI · 구동방식 · 용도": "PI · Drivetrain · Use",
  "상세 ↗": "Details ↗",
  "차량명이나 상세 버튼을 누르면 성능 수치, 빌드 콘셉트, 주행 평가와 튜닝 메모를 볼 수 있어.": "Select the car name or Details to see performance figures, the build concept, driving impressions and tuning notes.",
  "3. 코드 복사": "3. Copy",
  "공유 코드": "Share code",
  "코드 복사": "Copy code",
  "공유 코드를 복사해서 게임의 튜닝 검색에 입력해. 모바일 전체 목록에서는 화살표로 코드 영역을 펼치면 돼.": "Copy the share code and enter it in the game's tuning search. On mobile, use the arrow to expand the code area in the complete list.",
  "위의 작은 패널은 사용 순서를 설명하는 예시야.": "These small panels are examples of the steps.",
  "레페의 팁": "Lepe's tip",
  "같은 차량에도 튜닝이 여러 개 있을 수 있어. 이름만 보지 말고 PI와 용도, 주행 평가도 같이 확인해줘.": "One car can have several tunes. Check the PI, intended use and driving impressions as well as the name.",
  "기록은 같은 조건끼리 비교해.": "Compare times under the same conditions.",
  "순위표에서 먼저 볼 숫자": "The first number to look for",
  "평균 대비 -2.534%": "vs. average -2.534%",
  "기록 아래의 음수는 같은 PI·같은 테스트 코스의 아카이브 평균보다 시간이 짧다는 뜻이야. 이 예시는 평균보다 약 2.53% 빠른 기록이지.": "A negative percentage means the lap took less time than the archive average for the same PI and test track. This example is about 2.53% faster than that average.",
  "PI · 코스 · 차량 성격": "PI · Track · Car character",
  "온로드와 오프로드 테스트 기록은 각각의 코스 안에서 비교해. 평균 대비 %는 아카이브에 등록된 기록을 기준으로 계산해.": "Compare road and offroad times within their own test tracks. The percentage is calculated from recorded times in this archive.",
  "전체 게임 이용자 중 상위 몇 %라는 뜻은 아니야. 실제 이벤트에 맞는지는 차량의 용도와 메모도 함께 보자.": "This is not a percentile of all players. Check each tune's use and notes to judge whether it suits your event.",
  "설치도 하나씩 따라 해보자.": "Let's install it, step by step.",
  "지금 쓰는 기기와 브라우저를 골라봐. 앱스토어를 찾을 필요 없이, 아카이브 사이트를 앱처럼 추가하는 방법이야.": "Choose your device and browser. You can add this website as an app without visiting an app store.",
  "설치할 기기와 브라우저": "Device and browser for installation",
  "총 4단계 · 아래 순서대로 따라 해줘.": "Four steps · Follow them in order.",
  "아카이브 주소 열기 ↗": "Open the archive ↗",
  "Chrome으로 아카이브 열기": "Open the archive in Chrome",
  "디코나 메신저 안의 화면에서 보고 있다면 링크를 복사한 뒤 Chrome 주소창에 붙여넣어 열어줘.": "If you're viewing this inside Discord or a messaging app, copy the link and open it in Chrome.",
  "버튼 위치를 보여주는 간략 예시": "Simplified example showing the button's location",
  "오른쪽 위 점 세 개 누르기": "Open the three-dot menu",
  "주소창 오른쪽의 세로 점 세 개(⋮)를 눌러 메뉴를 열어줘.": "Tap the three vertical dots (⋮) to the right of the address bar.",
  "⋮ ← 여기": "⋮ ← here",
  "홈 화면에 추가 → 설치": "Add to Home screen → Install",
  "메뉴에서 ‘홈 화면에 추가’를 찾아 눌러줘. ‘설치’가 표시되면 선택하고, 확인창에서도 설치를 진행해. 환경에 따라 ‘앱 설치’가 바로 보일 수 있어.": "Choose Add to Home screen. Select Install if it appears, then confirm. Some versions show Install app directly.",
  "새 탭": "New tab",
  "홈 화면에 추가": "Add to Home screen",
  "설치": "Install",
  "홈 화면에서 실행하기": "Launch from your Home screen",
  "설치가 끝나면 홈 화면이나 앱 목록에서 Forza 아카이브 아이콘을 찾아 눌러줘.": "Once installed, find the Forza Archive icon on your Home screen or in your app list.",
  "Forza 아카이브": "Forza Archive",
  "아이콘을 눌러 실행": "Tap the icon to launch",
  "설치 완료!": "Installed!",
  "다음부터는 추가한 아이콘이나 브라우저 앱 목록에서 아카이브를 열면 돼.": "You can now open the archive from its new icon or your browser's app list.",
  "버튼 그림은 위치를 설명하는 간략 예시야. 실제 모양과 메뉴 이름은 기기·버전에 따라 달라질 수 있어.": "These button diagrams are simplified examples. Appearance and menu names may vary by device and version.",
  "Chrome 공식 설치 안내 ↗": "Chrome installation help ↗",
  "Safari로 아카이브 열기": "Open the archive in Safari",
  "먼저 Safari에서 아카이브를 열어줘. 화면 아래나 위에 Safari 주소창이 보이는지 확인하면 돼.": "Open the archive in Safari first. Check that Safari's address bar is visible at the top or bottom.",
  "공유 버튼 누르기": "Tap Share",
  "네모에서 위쪽 화살표가 나오는 공유 버튼을 눌러줘. 배치에 따라 페이지 메뉴 안에서 ‘공유’를 찾아야 할 수도 있어.": "Tap the square with an upward arrow. Depending on your layout, Share may be inside the page menu.",
  "Safari · 주소창": "Safari · Address bar",
  "공유 ↑": "Share ↑",
  "홈 화면에 추가 찾기": "Find Add to Home Screen",
  "공유 목록을 아래로 내려 ‘홈 화면에 추가’를 눌러줘. 항목이 없으면 목록 아래 ‘동작 편집’에서 추가할 수 있어.": "Scroll down the share sheet and tap Add to Home Screen. If it is missing, check Edit Actions at the bottom.",
  "복사": "Copy",
  "＋ 홈 화면에 추가": "＋ Add to Home Screen",
  "추가한 뒤 아이콘으로 실행": "Add it, then launch from the icon",
  "‘웹 앱으로 열기’ 선택이 보이면 켜고, ‘추가’를 눌러줘. 홈 화면에 생긴 아카이브 아이콘을 눌러 실행하면 끝이야.": "Enable Open as Web App if that option appears, then tap Add. Launch the archive from its new Home screen icon.",
  "웹 앱으로 열기 켜짐": "Open as Web App · On",
  "추가": "Add",
  "Safari 공식 설치 안내 ↗": "Safari installation help ↗",
  "PC의 Chrome에서 아카이브를 열어줘. 휴대폰 Chrome과 메뉴 위치가 다르니 아래 순서를 따라가면 돼.": "Open the archive in Chrome on your PC. Its menus differ from mobile Chrome, so follow the steps below.",
  "주소창의 설치 아이콘 찾기": "Find the install icon",
  "주소창 오른쪽에 설치 아이콘이 보이면 클릭해줘. 보이지 않아도 다음 단계의 메뉴 경로로 설치할 수 있어.": "Select the install icon on the right of the address bar, if shown. If not, use the menu in the next step.",
  "설치 ↓": "Install ↓",
  "메뉴에서 설치하기": "Install from the menu",
  "오른쪽 위 ⋮ → ‘전송, 저장, 공유’ → ‘페이지를 앱으로 설치’를 선택해줘. 표시 문구는 Chrome 버전과 언어에 따라 조금 달라질 수 있어.": "Open ⋮ → Cast, save, and share → Install page as app. The wording may vary by Chrome version and language.",
  "⋮ 메뉴": "⋮ Menu",
  "전송, 저장, 공유 →": "Cast, save, and share →",
  "페이지를 앱으로 설치": "Install page as app",
  "확인창에서 설치 후 실행": "Confirm installation and launch",
  "이름을 확인하고 설치를 눌러줘. 설치된 앱은 Chrome의 앱 목록(chrome://apps)에서 열 수 있어. 바탕화면 바로가기는 앱 목록에서 별도로 만들 수도 있어.": "Check the name and select Install. Find installed apps at chrome://apps. You can also create a desktop shortcut there.",
  "Edge로 아카이브 열기": "Open the archive in Edge",
  "PC의 Microsoft Edge에서 아카이브를 열어줘. 오른쪽 위 점 세 개는 가로 방향(…)으로 표시돼.": "Open the archive in Microsoft Edge on your PC. Its three-dot menu (…) is in the top-right corner.",
  "주소창의 앱 설치 아이콘 찾기": "Find the app install icon",
  "주소창에 앱 설치 아이콘이 보이면 눌러줘. 아이콘을 찾기 어렵다면 다음 단계의 메뉴를 이용하면 돼.": "Select the app install icon in the address bar, if shown. Otherwise, use the menu in the next step.",
  "앱 설치": "Install app",
  "메뉴에서 앱 설치 선택": "Choose app installation from the menu",
  "오른쪽 위 … → ‘기타 도구’ → ‘앱’ → ‘이 사이트를 앱으로 설치’를 찾아줘. 버전에 따라 … 메뉴 안에 ‘앱’이 바로 표시될 수도 있어.": "Open … → More tools → Apps → Install this site as an app. Some versions show Apps directly in the … menu.",
  "… 메뉴 → 기타 도구 → 앱": "… Menu → More tools → Apps",
  "이 사이트를 앱으로 설치": "Install this site as an app",
  "설치 후 실행 위치 정하기": "Choose where to launch it",
  "설치를 확인한 뒤 필요하면 시작 메뉴나 작업 표시줄에 고정해줘. Edge 앱 목록(edge://apps)에서도 실행하거나 바로가기를 만들 수 있어.": "After installation, you can pin it to Start or your taskbar. You can also launch it or create shortcuts from edge://apps.",
  "Edge 공식 설치 안내 ↗": "Edge installation help ↗",
  "설치 메뉴가 안 보여요.": "I can't find the install option.",
  "디코·메신저 안의 화면이라면 주소를 복사해 위에서 선택한 브라우저로 다시 열어봐. PC에서는 주소창 아이콘 대신 메뉴 경로를 이용할 수 있어. iPhone·iPad는 공유 목록 아래까지 내려보고, ‘홈 화면에 추가’가 없으면 ‘동작 편집’을 확인해줘. 이미 설치되어 있는지도 홈 화면이나 브라우저 앱 목록에서 찾아봐.": "If you're inside Discord or a messaging app, copy the URL and open it in the browser selected above. On PC, use the menu if the install icon is missing. On iPhone or iPad, scroll down the share sheet and check Edit Actions if needed. Also check whether the app is already installed.",
  "설치했는데 아이콘이 어디 있는지 모르겠어요.": "Where is the installed app?",
  "휴대폰은 홈 화면과 앱 목록에서 Forza 아카이브를 찾아봐. PC Chrome은 chrome://apps, Edge는 edge://apps를 주소창에 입력하면 설치된 앱을 확인할 수 있어. 필요하면 거기서 바로가기를 만들거나 고정해줘.": "On mobile, look for Forza Archive on your Home screen or in your app list. On PC, enter chrome://apps or edge://apps to find installed apps and create shortcuts or pin them.",
  "필요할 때 펼쳐봐.": "Open these when you need them.",
  "차가 너무 많아서 찾기 어려워.": "There are too many cars to find what I want.",
  "검색과 필터를 함께 써봐. 전체 목록은 30개씩 페이지로 나뉘고, 조건을 바꾸면 첫 페이지부터 보여줘. 모바일에서는 코드를 접어둬서 목록을 짧게 훑을 수 있어.": "Combine search with filters. The complete list shows 30 tunes per page and returns to page one when you change a filter. On mobile, share codes start collapsed so the list is easier to browse.",
  "이번 주 차량이 ‘미분류’에 보여.": "This week's car is under Unclassified.",
  "이벤트 그룹 값이 없는 차량도 빠뜨리지 않도록 미분류에 표시해. 차량 상세와 이벤트 이름을 함께 확인해줘.": "Tunes without an event group are listed under Unclassified so they are not omitted. Check the car details and event name together.",
  "더 자세한 질문이나 튜닝 피드백은?": "More questions or tuning feedback?",
  "상단 패독에서 디스코드 소개를 볼 수 있어. 튜닝 피드백과 주행 이야기는 그쪽에서 함께 나누자.": "Select Paddock in the top menu for our Discord introduction. Join us there to discuss tunes and driving.",
  "기록은 아카이브에, 사람은 패독에.": "Records in the archive. People in the paddock.",
  "관리자 로그인": "Manager login",
  "Discord 패독 | Forza 6 Tuning Archive": "Discord Paddock | Forza 6 Tuning Archive",
  "기록은 아카이브에,": "Records in the archive.",
  "사람은 패독에.": "People in the paddock.",
  "차량 데이터만 보고 갈 거면 여기까지. 같이 달리고, 물어보고, 차도 사람도 손볼 거면 패독으로.": "Here for car data? You're in the right place. For driving together, questions and tuning help, head to the paddock.",
  "아카이브로 돌아가기": "Back to the archive",
  "사이트 밖에서는 조금 더 많은 걸 할 수 있습니다": "There's more beyond the website",
  "Forza 6 Tuning Archive가 차량과 튜닝을 기록하는 공간이라면, Discord 패독은 그 데이터를 실제로 써먹고 함께 달리는 공간입니다.": "The archive keeps the cars and tunes on record. Our Discord paddock is where we use them, drive together and talk.",
  "🤖 레이레": "🤖 Leire",
  "차량 검색, 튜닝 비교, 이번 주 차량과 검수된 페스티벌 추천을 Discord에서 바로 확인할 수 있습니다.": "Search cars, compare tunes and see this week's cars and reviewed Festival picks directly in Discord.",
  "🏁 6인 주간숙제": "🏁 Six-player Festival team",
  "랜덤 매칭 팀원 때문에 스트레스 받을 필요 없이, 최대 6명이 시간을 맞춰 주간숙제를 함께 진행합니다.": "Coordinate a team of up to six players for the weekly events, without relying on random matchmaking.",
  "🔧 맞춤 튜닝": "🔧 Custom tunes",
  "아카이브에 없는 차량이나 특정 용도에 필요한 세팅이 있다면 원하는 조건에 맞춘 튜닝을 요청할 수 있습니다.": "Request a tune for a car or purpose that isn't covered in the archive.",
  "🛠️ 튜닝 피드백": "🛠️ Tuning feedback",
  "직접 만든 튜닝이 뭔가 애매하다면 가져오세요. 차량의 거동과 세팅 방향을 함께 확인하고 피드백합니다.": "Bring a tune that isn't quite right. We'll look at the handling and settings together.",
  "🏎️ 운전연수": "🏎️ Driving coaching",
  "차만 고쳐도 안 빨라지면 이제 운전자도 봅니다. 라인, 브레이킹, 코너 진입과 탈출 등 실제 주행을 함께 연습합니다.": "If a tune alone isn't enough, let's work on the driving: lines, braking, corner entry and exit.",
  "📢 업데이트와 공지": "📢 Updates and announcements",
  "아카이브 업데이트, 레이레 기능과 주간 운영 관련 소식을 Discord에서 확인할 수 있습니다.": "Keep up with archive updates, Leire features and community news in Discord.",
  "레이레에게 바로 물어보세요": "Ask Leire directly",
  "사이트를 직접 찾아다니지 않아도 Discord 안에서 필요한 정보를 빠르게 확인할 수 있습니다.": "Find what you need inside Discord without browsing the website each time.",
  "/차량": "/차량",
  "원하는 차량을 검색하고 공유 코드, 성능, 빌드 콘셉트, 평가와 테스트 기록을 확인합니다.": "Search a car and see its share code, performance, build concept, review and test times.",
  "/비교": "/비교",
  "두 개의 튜닝을 나란히 놓고 성능과 기록, 세팅 성격을 비교할 수 있습니다.": "Compare two tunes side by side: performance, lap times and setup character.",
  "/이번주": "/이번주",
  "현재 페스티벌 시즌에 준비된 주간 추천 차량을 빠르게 확인합니다.": "See the recommended cars prepared for the current Festival season.",
  "/추천": "/추천",
  "코스와 차량 데이터를 바탕으로 분석한 뒤 직접 검수한 페스티벌 추천을 확인할 수 있습니다.": "Get reviewed Festival picks based on the course and archive data.",
  "/오늘운세": "/오늘운세",
  "필요는 없는데 있습니다. 오늘 운이 안 좋으면 레이레가 알려줍니다. 그래도 사고 나면 본인 책임입니다.": "Not essential, but it's here. Leire will warn you if today's luck looks bad. You're still responsible for any crashes.",
  "레이레가 살아 있는지 확인합니다. 대답이 없으면 누군가 서버를 고치러 가야 합니다.": "Check that Leire is awake. If there's no reply, someone may need to fix the server.",
  "랜덤 매칭 말고, 6명 꽉 채워서.": "A full team of six.",
  "협동 주간숙제를 랜덤 인원에게 맡기지 않고 Discord 멤버끼리 시간을 맞춰 함께 진행합니다.": "Coordinate with Discord members for weekly co-op events rather than relying on random matchmaking.",
  "6인 풀파티": "A full six-player party",
  "최대 6명이 한 파티로 모여 주간숙제를 함께 진행할 수 있습니다.": "Bring up to six players together for the weekly events.",
  "주간 출석 투표": "Weekly availability poll",
  "매주 월요일 레이레가 자동으로 출석 투표를 올립니다. 금요일과 토요일 중 가능한 시간을 미리 맞춥니다.": "Every Monday, Leire posts a poll to coordinate Friday and Saturday availability.",
  "랜덤 팀원 스트레스 감소": "Less random-team stress",
  "팀원이 갑자기 사라지거나, 서로 다른 방향으로 달리는 광경을 보며 기도할 필요가 줄어듭니다.": "Spend less time wondering why teammates vanished or drove off in different directions.",
  "같이 끝내고 끝": "Finish the events together",
  "필요한 숙제를 함께 처리하고 각자 하고 싶은 콘텐츠로 돌아가면 됩니다.": "Complete the events as a group, then get back to whatever you want to play.",
  "원하는 차가 없다면 만들어봅니다": "Can't find your car? Let's build it.",
  "아카이브에 있는 튜닝만 사용하는 공간은 아닙니다. 필요한 차량이나 목적이 있다면 직접 요청할 수 있습니다.": "You're not limited to the tunes already in the archive. Ask about a specific car or purpose.",
  "맞춤 튜닝 요청": "Request a custom tune",
  "원하는 차량, 클래스, 용도와 주행 성격을 알려주면 그 조건에 맞는 튜닝 제작을 요청할 수 있습니다.": "Tell us the car, class, intended use and handling character you want.",
  "기존 튜닝 피드백": "Feedback on your own tune",
  "직접 만든 세팅도 괜찮습니다. 언더스티어, 오버스티어, 기어비, 제동과 같은 문제점을 함께 확인할 수 있습니다.": "Bring your own setup. We can look at understeer, oversteer, gearing, braking and other handling issues.",
  "차가 아니라 사람이 문제일 수도 있습니다": "Sometimes it's the driving, not the car.",
  "그래서 운전연수도 시작했습니다. 기록을 줄이고 싶거나 특정 구간이 계속 어렵다면 실제 주행을 함께 보면서 연습합니다.": "That's why we offer driving coaching. We'll look at your runs together and work on difficult sections or improving your time.",
  "레이싱 라인": "Racing lines",
  "코너에서 어디로 들어가고 어디로 빠져나와야 하는지 함께 확인합니다.": "Work on where to enter a corner and where to exit.",
  "브레이킹": "Braking",
  "너무 일찍 또는 너무 늦게 제동하는 구간을 찾고 안정적으로 속도를 줄이는 방법을 연습합니다.": "Identify braking points that are too early or too late, then practise slowing down consistently.",
  "코너 진입과 탈출": "Corner entry and exit",
  "진입 속도와 가속 시점을 조정해 코너 하나하나에서 잃는 시간을 줄여봅니다.": "Adjust entry speed and throttle timing to improve each corner.",
  "차량에 맞는 주행": "Driving to suit the car",
  "FWD, RWD, 4WD와 차량 특성에 따라 달라지는 주행법도 함께 익힙니다.": "Learn how technique changes with FWD, RWD, AWD and each car's character.",
  "같이 달릴 생각이라면 들어오세요": "Join us for a drive",
  "사이트는 가입 없이 그대로 이용할 수 있습니다. 같이 주간숙제를 하고, 튜닝을 요청하고, 주행 이야기를 나누고 싶을 때 패독에 합류하면 됩니다.": "The website needs no account. Join the paddock when you want to run weekly events together, ask about tunes or chat about driving.",
  "Discord 패독 참여하기": "Join the Discord paddock",
  "차량 데이터만 필요하다면 아카이브로": "Just need the car data? Back to the archive.",
  "Forza 6 Tuning Archive로 돌아가기": "Back to Forza 6 Tuning Archive",
  "페스티벌": "Festival",
  "지난 시즌": "Past Seasons",
  "기록": "Records",
  "전시관 ▾": "Exhibitions ▾",
  "라이벌 전시관": "Rival Exhibitions",
  "업데이트 알림 ↗": "Update alerts ↗",
  "패독 ↗": "Paddock ↗",
  "메인": "Home",
  "전체 메뉴": "Main navigation",
  "전체 메뉴 펼치기": "Open menu",
  "메뉴 ▾": "Menu ▾",
  "메뉴 ▴": "Menu ▴",
  "다크모드로 전환": "Switch to dark mode",
  "일반 모드로 전환": "Switch to light mode",
  "고정 바로가기": "Quick navigation",
  "바로가기 펼치기": "Open shortcuts",
  "바로가기 접기": "Close shortcuts",
  "아카이브 아이콘": "Archive icon",
  "필터 ▴": "Filters ▴",
  "PI": "PI",
  "차량 분류": "Car type",
  "구동방식": "Drivetrain",
  "용도": "Use",
  "연대": "Decade",
  "전체": "All",
  "4WD": "AWD",
  "레전드 섬 서킷": "Legend Island Circuit",
  "세키베 타임어택(오프로드)": "Sekibe Time Attack (Offroad)",
  "도전": "The Trial",
  "메인1": "Championship 1",
  "메인2": "Championship 2",
  "메인3": "Championship 3",
  "PR 스턴트": "PR Stunts",
  "미분류": "Unclassified",
  "이번 주 추천": "This week's picks",
  "최근 튜닝": "Recent tune",
  "튜닝 공유 코드": "Tune share code",
  "빌드 콘셉트": "Build concept",
  "주행 평가": "Driving impressions",
  "튜닝 메모": "Tuning notes",
  "제조사": "Manufacturer",
  "출력": "Power",
  "중량": "Weight",
  "횡G": "Lateral G",
  "토크": "Torque",
  "최근 수정일": "Last updated",
  "최고 기록": "Best time",
  "기록 없음": "No time recorded",
  "아직 기록이 없습니다.": "No times recorded yet.",
  "미입력": "Not recorded",
  "제조사 미입력": "Manufacturer not recorded",
  "차량명 미입력": "Car name not recorded",
  "PI 미입력": "PI not recorded",
  "분류 미입력": "Type not recorded",
  "구동방식 미입력": "Drivetrain not recorded",
  "용도 미입력": "Use not recorded",
  "빌드 콘셉트가 아직 입력되지 않았습니다.": "No build concept recorded yet.",
  "주행 평가가 아직 입력되지 않았습니다.": "No driving impressions recorded yet.",
  "튜닝 메모가 아직 입력되지 않았습니다.": "No tuning notes recorded yet.",
  "지난 시즌 튜닝 설명이 아직 입력되지 않았습니다.": "No description recorded for this past-season tune.",
  "순위표 보기 ▼": "Show rankings ▼",
  "순위표 접기 ▲": "Hide rankings ▲",
  "펼치기 ▼": "Expand ▼",
  "접기 ▲": "Collapse ▲",
  "복사됨!": "Copied!",
  "복사 실패": "Copy failed",
  "불러오는 중...": "Loading...",
  "불러오기 실패": "Could not load",
  "차량 데이터를 불러오는 중입니다...": "Loading cars...",
  "전체 차량 데이터를 불러오는 중입니다...": "Loading the car catalogue...",
  "페스티벌 튜닝차량 데이터를 불러오는 중입니다...": "Loading Festival tunes...",
  "PI별 평균 기록을 계산하는 중입니다...": "Calculating average times by PI...",
  "전체 차량 데이터를 불러오지 못했습니다.": "Could not load the car catalogue.",
  "페스티벌 튜닝차량 데이터를 불러오지 못했습니다.": "Could not load Festival tunes.",
  "PI별 평균 기록을 불러오지 못했습니다.": "Could not load average times by PI.",
  "데이터 새로고침 버튼을 눌러 다시 시도해주세요.": "Select Refresh data to try again.",
  "구글 시트 게시 상태 또는 CSV 링크를 확인해주세요.": "Please check the published spreadsheet or try again later.",
  "페스티벌 튜닝차량이 아직 등록되지 않았습니다.": "No Festival tunes have been added yet.",
  "페스티벌 추천 튜닝": "Festival pick",
  "조건에 맞는 차량이 없습니다.": "No cars match these filters.",
  "저장된 지난 시즌 튜닝이 없습니다.": "No past-season tunes have been saved yet.",
  "지난 시즌 튜닝 데이터를 불러오지 못했습니다.": "Could not load past-season tunes.",
  "archive 시트 게시 상태 또는 gid 값을 확인해주세요.": "Please check the published archive sheet or try again later.",
  "시즌명 미입력": "Unnamed season",
  "갤러리 데이터를 불러오지 못했습니다.": "Could not load the gallery.",
  "Apps Script 배포 상태와 gallery 시트를 확인해주세요.": "Please check the gallery service or try again later.",
  "표시할 사진이 없습니다.": "No photos to show.",
  "제목 없는 사진": "Untitled photo",
  "오늘은 이미 뽑았습니다": "Today's pick is saved",
  "오늘은 이미 뽑았습니다. 내일 다시 뽑을 수 있습니다.": "Today's pick is saved. Come back tomorrow for another car.",
  "뽑는 중...": "Picking...",
  "상세 정보 보기": "View details",
  "공유하기": "Share",
  "오늘의 랜덤 튜닝": "Today's random tune",
  "튜닝 정보 펼치기": "Expand tune information",
  "튜닝 정보 접기": "Collapse tune information",
  "YouTube에서 보기 ↗": "Watch on YouTube ↗",
  "한·영 CC": "Korean / English CC",
  "이 튜닝으로 달린 영상": "Watch this tune in action",
  "수도고 세계관": "Shutoko Universe",
  "완간 미드나이트 · C1 러너 · 은회색 스피드스터 · 수도고 SPL": "Wangan Midnight · C1 Runner · Silver Gray Speedster · Shutoko SPL",
  "원작 차량의 개성과 기계적 특징을 Forza Horizon 6에서 재현한 제작 컬렉션입니다.": "A collection recreating the character and mechanical details of the original cars in Forza Horizon 6.",
  "전시관 데이터와 기존 튜닝 DB를 불러오는 중입니다.": "Loading exhibitions and the tuning catalogue.",
  "전시관 불러오기 실패": "Could not load exhibitions",
  "라이벌 데이터 요청 시간이 초과되었습니다.": "The exhibition request timed out.",
  "라이벌 데이터를 불러오지 못했습니다.": "Could not load exhibition data.",
  "라이벌 전시관을 불러오지 못했습니다.": "Could not load rival exhibitions.",
  "Apps Script 연결에 실패했습니다.": "Could not connect to the data service.",
  "공개된 라이벌 전시관이 아직 없습니다.": "No rival exhibitions are public yet.",
  "전시관 소개가 아직 입력되지 않았습니다.": "No exhibition introduction recorded yet.",
  "전시 설명이 아직 입력되지 않았습니다.": "No exhibition notes recorded yet.",
  "전시 이미지": "Exhibition image",
  "전시 소개 준비 중": "Exhibition introduction coming soon",
  "재현 포인트": "Recreation details",
  "표시된 수치는 실제 게임 제작 결과입니다.": "These figures are from the completed in-game build.",
  "전시관 전체 접기": "Collapse all exhibitions",
  "전시관 전체 펼치기": "Expand all exhibitions",
  "새로고침으로 재시도": "Refresh to retry"
};
  const normalize = text => String(text).replace(/\s+/g, ' ').trim();
  const reverse = new Map();
  for (const [ko, en] of Object.entries(EN)) if (!reverse.has(en)) reverse.set(en, ko);
  let language = 'ko';
  function english(text) {
    const s = normalize(text);
    if (Object.hasOwn(EN, s)) return EN[s];
    if (s === '메인의 페스티벌 추천에서 도전·메인1·메인2·메인3·PR 스턴트에 맞는 튜닝을 찾아봐. 추천 카드에는 공유 코드가 바로 보여서 펼치지 않고도 복사할 수 있어.') return 'The home page has picks for The Trial, Seasonal Championships 1–3 and PR Stunts. Share codes are visible on the cards, so you can copy them without opening the details.';
    if (s === 'CSV 링크 또는 cars 시트 게시 상태를 확인해주세요.' || s === 'CSV 링크 또는 weekly 시트 게시 상태를 확인해주세요.') return 'Please check the published spreadsheet or try again later.';
    if (s === 'PI별 평균 기록을 계산하지 못했습니다.') return 'Could not calculate average times by PI.';
    let m;
    if ((m = s.match(/^(.*) · 한·영 CC$/))) return `${m[1]} · Korean / English CC`;
    if ((m = s.match(/^촬영: (.+)$/))) return `Photo: ${m[1]}`;
    if ((m = s.match(/^(.*) · 수도고 차량 연결 실패 · 새로고침으로 재시도$/))) return `${english(m[1])} · Could not load Shutoko cars · Refresh to retry`;
    if ((m = s.match(/^(\d+)개 전시관 · (\d+)대의 라이벌 차량을 전시 중입니다\.$/))) return `${m[1]} exhibitions · ${m[2]} rival cars on display.`;
    if ((m = s.match(/^(\d+)개 전시관 · (\d+)대 전시 중 · (\d+)개 carId 연결 확인 필요$/))) return `${m[1]} exhibitions · ${m[2]} cars on display · ${m[3]} car links need checking`;
    if ((m = s.match(/^(\d+)대 중 (\d+)[–-](\d+) 표시$/))) return `Showing ${m[2]}–${m[3]} of ${m[1]} tunes`;
    if ((m = s.match(/^(\d+)대 표시 중$/))) return `Showing ${m[1]} cars`;
    if ((m = s.match(/^(\d+)장 표시 중$/))) return `Showing ${m[1]} photos`;
    if ((m = s.match(/^(\d+)대 전시$/))) return `${m[1]} cars on display`;
    if ((m = s.match(/^(\d+)대$/))) return `${m[1]} ${m[1] === '1' ? 'car' : 'cars'}`;
    if ((m = s.match(/^(\d+)개$/))) return `${m[1]} ${m[1] === '1' ? 'exhibition' : 'exhibitions'}`;
    if ((m = s.match(/^(\d+)위$/))) return `#${m[1]}`;
    if ((m = s.match(/^(.+) 평균 · (\d+)대$/))) return `${m[1]} average · ${m[2]} cars`;
    if ((m = s.match(/^평균 대비 ([+-]?[\d.]+%)$/))) return `vs. average ${m[1]}`;
    if ((m = s.match(/^(.+) 외 (\d+)개$/))) return `${english(m[1])} +${m[2]} more`;
    if ((m = s.match(/^전체 (.+)$/))) return `All ${english(m[1]).toLowerCase()}`;
    if ((m = s.match(/^(PI|차량 분류|구동방식|용도|연대): (.+)$/))) return `${english(m[1])}: ${m[2].split(', ').map(english).join(', ')}`;
    if ((m = s.match(/^공유 코드: (.+)$/))) return `Share code: ${english(m[1])}`;
    if ((m = s.match(/^(.+) 튜닝 정보 펼치기$/))) return `Expand tune information: ${m[1]}`;
    if ((m = s.match(/^(.+) (대표 이미지 크게 보기|이미지 크게 보기|전시 일러스트)$/))) return `${m[1]} · ${m[2] === '전시 일러스트' ? 'exhibition illustration' : 'Enlarge image'}`;
    if ((m = s.match(/^PI 평균 대비 ([+-]?[\d.]+%)\. (.+)$/))) return `vs. PI average ${m[1]}. ${english(m[2])}`;
    if ((m = s.match(/^(.+) \/ (.+) \/ 아카이브 (\d+)대 평균 (.+) 기준$/))) return `${m[1]} / ${english(m[2])} / archive average ${m[4]} across ${m[3]} cars`;
    return text;
  }
  function t(text, lang = language) {
    const original = reverse.get(normalize(text)) || text;
    return lang === 'en' ? english(original) : original;
  }
  function searchTerms(car) {
    return [car.carType, car.category, car.drive].map(v => t(v || '', 'en')).join(' ') +
      ({'4WD':' all-wheel drive AWD', 'FWD':' front-wheel drive', 'RWD':' rear-wheel drive'}[car.drive] || '');
  }
  const api = {t, searchTerms, get language() { return language; }};
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  const STORAGE_KEY = 'forzaArchiveLanguage';
  const valid = value => value === 'ko' || value === 'en';
  const query = new URL(location.href).searchParams.get('lang');
  let saved;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
  language = valid(query) ? query : valid(saved) ? saved : 'ko';
  if (valid(query)) { try { localStorage.setItem(STORAGE_KEY, language); } catch {} }
  document.documentElement.lang = language;
  if (language === 'en' && !new URL(location.href).searchParams.has('lang')) {
    const url = new URL(location.href);
    url.searchParams.set('lang', 'en');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }
  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  const attributes = ['placeholder', 'aria-label', 'title', 'alt'];
  const ignored = element => !element || element.closest('script,style,textarea,[contenteditable], [data-i18n-ignore], [data-i18n-original="true"]');
  function convert(node) {
    if (node.nodeType === 3) {
      if (ignored(node.parentElement) || !node.nodeValue.trim()) return;
      let state = originalText.get(node);
      if (!state || node.nodeValue !== state.last) state = {source: reverse.get(normalize(node.nodeValue)) || node.nodeValue};
      const localized = language === 'en' ? english(state.source) : state.source;
      const translated = language === 'en' && localized !== state.source
        ? state.source.match(/^\s*/)[0] + localized + state.source.match(/\s*$/)[0]
        : localized;
      if (node.nodeValue !== translated) node.nodeValue = translated;
      state.last = translated;
      originalText.set(node, state);
    } else if (node.nodeType === 1 && !ignored(node)) {
      if (node.tagName === 'A' && node.hasAttribute('href')) {
        const url = new URL(node.getAttribute('href'), location.href);
        const page = url.pathname.split('/').pop();
        if (url.origin === location.origin && ['', 'index.html', 'archive.html', 'gallery.html', 'rivals.html', 'guide.html', 'discord.html'].includes(page)) {
          url.searchParams.set('lang', language);
          const href = url.pathname + url.search + url.hash;
          if (node.getAttribute('href') !== href) node.setAttribute('href', href);
        }
      }
      let states = originalAttrs.get(node);
      if (!states) { states = {}; originalAttrs.set(node, states); }
      for (const name of attributes) {
        if (!node.hasAttribute(name)) continue;
        const value = node.getAttribute(name);
        let state = states[name];
        if (!state || value !== state.last) state = {source: reverse.get(normalize(value)) || value};
        const translated = language === 'en' ? english(state.source) : state.source;
        if (value !== translated) node.setAttribute(name, translated);
        state.last = translated;
        states[name] = state;
      }
    }
  }
  function scan(root) {
    convert(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) convert(walker.currentNode);
  }
  const options = {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:attributes};
  const observer = new MutationObserver(records => {
    observer.disconnect();
    const roots = new Set();
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(node => roots.add(node));
      else roots.add(record.target);
    }
    for (const root of roots) if (root.isConnected) scan(root);
    observer.observe(document.body, options);
  });
  function updateButton() {
    document.querySelectorAll('.archive-language-toggle').forEach(button => {
      button.textContent = language === 'en' ? '한국어' : 'EN';
      button.setAttribute('aria-label', language === 'en' ? '한국어로 전환' : 'Switch to English');
      button.title = language === 'en' ? '한국어로 전환' : 'Switch to English';
    });
  }
  function refresh() {
    observer.disconnect();
    scan(document.documentElement);
    updateButton();
    observer.observe(document.body, options);
  }
  function setLanguage(next, persist = true) {
    if (!valid(next)) return;
    language = next;
    document.documentElement.lang = language;
    if (persist) { try { localStorage.setItem(STORAGE_KEY, language); } catch {} }
    const url = new URL(location.href);
    url.searchParams.set('lang', language);
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    refresh();
    document.dispatchEvent(new CustomEvent('archive:language-change', {detail: {language}}));
  }
  api.setLanguage = setLanguage;
  api.refresh = refresh;
  window.ArchiveI18n = api;
  function start() {
    document.addEventListener('click', event => {
      if (event.target.closest('.archive-language-toggle')) setLanguage(language === 'ko' ? 'en' : 'ko');
    });
    refresh();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
