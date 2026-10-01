/* Shared navigation and persistent theme. Existing page scripts own their data. */
(() => {
  const root = document.documentElement;
  const header = document.createElement('header');
  header.className = 'archive-topbar';
  header.innerHTML = `<a class="archive-brand" href="./"><img src="assets/archive-icon.webp" alt="아카이브 아이콘" width="56" height="56"><span>Forza 6 <em>Archive.</em></span></a>
    <button class="archive-menu-toggle" type="button" aria-label="전체 메뉴 펼치기" aria-expanded="false" aria-controls="archiveNavigation">메뉴 ▾</button>
    <nav class="archive-navigation" id="archiveNavigation" aria-label="전체 메뉴">
      <a href="./#festival">페스티벌</a><a href="./#tuningList">전체 튜닝</a><a href="archive.html">지난 시즌</a><a href="./#records">기록</a>
      <details class="archive-exhibition"><summary>전시관 ▾</summary><div><a href="gallery.html">갤러리</a><a href="rivals.html">라이벌 전시관</a></div></details>
      <a href="guide.html">이용 가이드</a><a href="https://discord.gg/qSN32APcrd" target="_blank" rel="noopener noreferrer">업데이트 알림 ↗</a>
      <a class="archive-paddock" href="discord.html">패독 ↗</a><button class="archive-theme-toggle" type="button" aria-label="다크모드로 전환" aria-pressed="false">☾</button>
    </nav>`;
  document.body.prepend(header);
  const themeButton = header.querySelector('.archive-theme-toggle');
  function syncTheme() {
    const dark = root.dataset.theme === 'dark';
    themeButton.textContent = dark ? '☼' : '☾';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', dark ? '일반 모드로 전환' : '다크모드로 전환');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#20232b' : '#17254a');
  }
  themeButton.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('forzaArchiveTheme', root.dataset.theme); } catch {}
    syncTheme();
  });
  header.querySelector('.archive-menu-toggle').addEventListener('click', function () {
    const open = header.classList.toggle('menu-open');
    this.setAttribute('aria-expanded', String(open));
    this.textContent = open ? '메뉴 ▴' : '메뉴 ▾';
  });
  syncTheme();

  // Returning home must not switch between separately cached root/index documents.
  function returnHome(event) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const home = new URL('./', location.href);
    const atHome = location.pathname === home.pathname || location.pathname === home.pathname + 'index.html';
    if (!atHome) return;
    event.preventDefault();
    history.replaceState(history.state, '', home.pathname + location.search);
    header.classList.remove('menu-open');
    const menu = header.querySelector('.archive-menu-toggle');
    menu.setAttribute('aria-expanded', 'false');
    menu.textContent = '메뉴 ▾';
    pendingSection = null;
    setOpen(false);
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  header.querySelector('.archive-brand').addEventListener('click', returnHome);

  const dock = document.createElement('aside');
  dock.className = 'shortcut-side';
  dock.innerHTML = `<button class="shortcut-side-toggle" type="button" aria-label="바로가기 펼치기" aria-expanded="false" aria-controls="sideShortcutLinks">바로가기</button>
    <nav id="sideShortcutLinks" aria-label="고정 바로가기">
      <a class="shortcut-home" href="./">메인</a>
      <a href="./#festivalPlaylist">페스티벌 플레이리스트</a>
      <a href="./#records">타임어택 보드</a>
      <a href="./#tuningList">전체 튜닝</a>
      <a href="guide.html">이용 가이드</a>
    </nav>`;
  document.body.append(dock);
  root.classList.add('has-side-shortcuts');
  const toggle = dock.querySelector('button');
  const links = dock.querySelector('nav');
  const mobile = matchMedia('(max-width:700px)');
  function setOpen(open) {
    dock.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '바로가기 접기' : '바로가기 펼치기');
    links.hidden = mobile.matches && !open;
  }
  dock.querySelector('.shortcut-home').addEventListener('click', returnHome);
  toggle.addEventListener('click', () => setOpen(!dock.classList.contains('open')));
  dock.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dock.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!dock.contains(event.target)) setOpen(false);
  });
  mobile.addEventListener('change', () => setOpen(false));
  setOpen(false);

  // Keep the requested section aligned after asynchronous home data fills in.
  let pendingSection = null;
  const sectionIds = new Set(['festival', 'festivalPlaylist', 'records', 'tuningList']);
  function alignSection(id, smooth = false) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ block: 'start', behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' });
  }
  function requestSection(id, smooth = false) {
    if (!sectionIds.has(id) || !document.getElementById(id)) return;
    pendingSection = root.dataset.homeDataState === 'loading' ? id : null;
    alignSection(id, smooth);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    const home = new URL('./', location.href);
    const isHome = url.origin === location.origin && (url.pathname === home.pathname || url.pathname === home.pathname + 'index.html');
    const id = url.hash.slice(1);
    if (!isHome || !sectionIds.has(id) || !document.getElementById(id)) return;
    event.preventDefault();
    history.pushState(history.state, '', home.pathname + location.search + url.hash);
    header.classList.remove('menu-open');
    const menu = header.querySelector('.archive-menu-toggle');
    menu.setAttribute('aria-expanded', 'false');
    menu.textContent = '메뉴 ▾';
    setOpen(false);
    requestSection(id, true);
  });
  function cancelPendingSection() { pendingSection = null; }
  document.addEventListener('wheel', cancelPendingSection, { passive: true });
  document.addEventListener('touchstart', cancelPendingSection, { passive: true });
  document.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key) && !event.target.closest('input, textarea, select, button')) cancelPendingSection();
  });
  document.addEventListener('archive:home-data-ready', () => {
    if (!pendingSection) return;
    const id = pendingSection;
    requestAnimationFrame(() => {
      if (pendingSection !== id) return;
      alignSection(id);
      document.fonts.ready.then(() => {
        if (pendingSection === id) { alignSection(id); pendingSection = null; }
      });
    });
  });
  const syncHash = () => requestSection(location.hash.slice(1));
  window.addEventListener('hashchange', syncHash);
  window.addEventListener('popstate', syncHash);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncHash, { once: true });
  else syncHash();
})();
