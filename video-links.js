/* Public driving videos. A shared tuning code is the only matching key. */
(() => {
  'use strict';
  const CHANNEL = 'https://www.youtube.com/@ko_tbclan';
  const SOURCES = [
    // Actions data commits do not need a Pages rebuild: read the current mirror.
    'https://raw.githubusercontent.com/Lepe1210/forza6-tuning-archive-lepe/main/data/videos.json',
    'data/videos.json'
  ];
  let pending;
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
  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  function card(video) {
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
    body.append(element('strong', '', video.title));
    const meta = [];
    if (video.carLabel) meta.push(video.carLabel);
    if (video.classLabel) meta.push(video.classLabel);
    if (video.hasBilingualCC === true) meta.push('한·영 CC');
    if (meta.length) body.append(element('span', 'driving-video-meta', meta.join(' · ')));
    body.append(element('span', 'driving-video-action', 'YouTube에서 보기 ↗'));
    link.append(thumbnail, body);
    return link;
  }
  async function mount(shareCode, target) {
    if (!target) return;
    target.hidden = true;
    target.replaceChildren();
    const code = codeOf(shareCode);
    if (!/^\d{9}$/.test(code)) return;
    const matches = (await load()).filter(v => v.shareCodes.includes(code));
    if (!target.isConnected || !matches.length) return;
    const section = element('section', 'driving-video-detail');
    section.append(element('h3', '', '이 튜닝으로 달린 영상'));
    const grid = element('div', 'driving-video-grid');
    matches.forEach(video => grid.append(card(video)));
    section.append(grid);
    target.replaceChildren(section);
    target.hidden = false;
  }
  async function mountLatest() {
    const section = document.getElementById('drivingVideos');
    const grid = document.getElementById('drivingVideoGrid');
    if (!section || !grid) return;
    const videos = (await load()).slice(0, 3);
    if (!videos.length) return;
    grid.replaceChildren(...videos.map(card));
    section.hidden = false;
  }
  window.ArchiveVideos = {mount};
  mountLatest();
})();
