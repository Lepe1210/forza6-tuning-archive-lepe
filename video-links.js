/* Public driving videos: exact codes plus verified stable-ID/vehicle code history. */
(() => {
  'use strict';
  const CHANNEL = 'https://www.youtube.com/@ko_tbclan';
  const SOURCES = [
    // Actions data commits do not need a Pages rebuild: read the current mirror.
    'https://raw.githubusercontent.com/Lepe1210/forza6-tuning-archive-lepe/main/data/videos.json',
    'data/videos.json'
  ];
  const HISTORY_SOURCES = [
    'https://raw.githubusercontent.com/Lepe1210/forza6-tuning-archive-lepe/main/data/share-code-history.json',
    'data/share-code-history.json'
  ];
  let pending;
  let historyPending;
  const mounts = new WeakMap();
  const identity = value => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const codeOf = value => String(value || '').replace(/[\s-]/g, '');
  function validate(data) {
    if (data.schemaVersion !== 1 || data.channelId !== 'UCKYhJ5TvLEwq-uDHBHflLgQ' || !Array.isArray(data.videos)) throw new Error('Invalid video catalogue');
    const seen = new Set();
    return data.videos.filter(v => {
      if (!/^[A-Za-z0-9_-]{11}$/.test(v.id) || seen.has(v.id) || typeof v.title !== 'string' || !Array.isArray(v.shareCodes)) return false;
      seen.add(v.id);
      return true;
    }).map(v => ({...v, shareCodes: v.shareCodes.filter(c => typeof c === 'string' && /^\d{9}$/.test(c))}));
  }
  function load() {
    if (!pending) pending = (async () => {
      for (const source of SOURCES) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch(source, {cache: 'no-store', signal: controller.signal});
          if (!response.ok) throw new Error('Video catalogue unavailable');
          return validate(await response.json());
        } catch (error) {
          console.warn('Driving video source unavailable:', source);
        } finally { clearTimeout(timer); }
      }
      return [];
    })();
    return pending;
  }
  function validateHistory(data) {
    if (data.schemaVersion !== 1 || !Array.isArray(data.entries)) throw new Error('Invalid tune history');
    return data.entries.filter(entry => typeof entry.carId === 'string' &&
      typeof entry.manufacturer === 'string' && typeof entry.carName === 'string' &&
      /^\d{9}$/.test(entry.currentCode) && Array.isArray(entry.codes) &&
      entry.codes.every(code => typeof code === 'string' && /^\d{9}$/.test(code)) &&
      entry.codes.includes(entry.currentCode));
  }
  function loadHistory() {
    if (!historyPending) historyPending = (async () => {
      for (const source of HISTORY_SOURCES) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch(source, {cache:'no-store', signal:controller.signal});
          if (!response.ok) throw new Error('Tune history unavailable');
          return validateHistory(await response.json());
        } catch { console.warn('Tune history source unavailable:', source); }
        finally { clearTimeout(timer); }
      }
      return [];
    })();
    return historyPending;
  }
  function previousCodes(car, code, entries) {
    if (!car || typeof car !== 'object' || !car.id || !car.manufacturer || !car.carName) return [];
    const matches = entries.filter(entry => entry.carId === car.id &&
      identity(entry.manufacturer) === identity(car.manufacturer) && identity(entry.carName) === identity(car.carName));
    if (matches.length !== 1) return [];
    const entry = matches[0];
    // An archived old-code detail should not show a newer tune as an older one.
    // A just-edited live Sheet may already have a new code ahead of the mirror.
    if (entry.codes.includes(code) && code !== entry.currentCode) return [];
    return entry.codes.filter(old => old !== code && entries.filter(owner => owner.codes.includes(old)).length === 1);
  }
  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  function card(video, previous = false) {
    const link = element('a', 'driving-video-card');
    link.href = 'https://www.youtube.com/watch?v=' + video.id;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const thumbnail = element('div', 'driving-video-thumbnail');
    const img = element('img');
    img.src = 'https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg';
    img.alt = '';
    img.loading = 'lazy';
    img.width = 480;
    img.height = 360;
    thumbnail.append(img, element('span', 'driving-video-play', '▶'));
    const body = element('div', 'driving-video-body');
    const title = element('strong', '', video.title);
    title.setAttribute('data-i18n-original', 'true');
    if (previous) body.append(element('span', 'driving-video-version', '리메이크 이전 튜닝'));
    body.append(title);
    const meta = [];
    if (video.carLabel) meta.push(video.carLabel);
    if (video.classLabel) meta.push(video.classLabel);
    if (video.hasBilingualCC === true) meta.push('한·영 CC');
    if (meta.length) body.append(element('span', 'driving-video-meta', meta.join(' · ')));
    body.append(element('span', 'driving-video-action', 'YouTube에서 보기 ↗'));
    link.append(thumbnail, body);
    return link;
  }
  async function mount(car, target) {
    if (!target) return;
    const token = {};
    mounts.set(target, token);
    target.hidden = true;
    target.replaceChildren();
    const code = codeOf(typeof car === 'object' && car ? car.shareCode : car);
    if (!/^\d{9}$/.test(code)) return;
    const [videos, history] = await Promise.all([load(), typeof car === 'object' ? loadHistory() : Promise.resolve([])]);
    const oldCodes = previousCodes(car, code, history);
    const current = videos.filter(video => video.shareCodes.includes(code));
    const previous = videos.filter(video => !video.shareCodes.includes(code) && video.shareCodes.some(old => oldCodes.includes(old)));
    if (!target.isConnected || mounts.get(target) !== token || (!current.length && !previous.length)) return;
    const section = element('section', 'driving-video-detail');
    if (current.length) {
      section.append(element('h3', '', '이 튜닝으로 달린 영상'));
      const grid = element('div', 'driving-video-grid');
      current.forEach(video => grid.append(card(video)));
      section.append(grid);
    }
    if (previous.length) {
      section.append(element('h3', 'driving-video-history-heading', '리메이크 이전 튜닝 영상'));
      section.append(element('p', 'driving-video-history-note', '이전 공유코드로 촬영한 영상입니다. 현재 튜닝의 성능·거동과 다를 수 있습니다.'));
      const grid = element('div', 'driving-video-grid');
      previous.forEach(video => grid.append(card(video, true)));
      section.append(grid);
    }
    target.replaceChildren(section);
    target.hidden = false;
  }
  async function mountLatest() {
    const section = document.getElementById('drivingVideos');
    const grid = document.getElementById('drivingVideoGrid');
    if (!section || !grid) return;
    const videos = (await load()).slice(0, 3);
    if (!videos.length) return;
    grid.replaceChildren(...videos.map(video => card(video)));
    section.hidden = false;
  }
  window.ArchiveVideos = {mount};
  mountLatest();
})();

