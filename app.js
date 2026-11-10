/* ============================================================
   Digital Avatar — приложение
   ============================================================ */

const STORAGE_KEY = 'digital_avatar_v2';
const AVATARS = ['🧑‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '🦊', '🐼', '🦉', '🚀', '🐉', '🦄', '🧙‍♂️', '🧑‍🔬'];

/* ---------- Store: users map + active user ---------- */
function clone(o) { return JSON.parse(JSON.stringify(o)); }

function createDefaultUsers() {
  const result = {};
  Object.entries(USER_PROFILES).forEach(([id, p]) => {
    result[id] = clone(p);
    result[id].skills = { ...mkSkills({}), ...p.skills };
  });
  return result;
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { users: createDefaultUsers(), activeUserId: 'alexey' };
    const parsed = JSON.parse(raw);
    if (!parsed.users || !Object.keys(parsed.users).length)
      return { users: createDefaultUsers(), activeUserId: 'alexey' };
    return parsed;
  } catch {
    return { users: createDefaultUsers(), activeUserId: 'alexey' };
  }
}

let store = loadStore();
let users = store.users;
let activeUserId = users[store.activeUserId] ? store.activeUserId : Object.keys(users)[0];
let state = users[activeUserId];
let radarMode = 'hard';

function saveState() {
  users[activeUserId] = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, activeUserId }));
}

function switchUser(id) {
  if (!users[id] || id === activeUserId) return;
  users[activeUserId] = state;
  activeUserId = id;
  state = users[id];
  saveState();
  renderAll();
  toast(`Переключено на ${state.name}`);
}

const currentPosition = () => POSITION_BY_ID[state.position];


function positionReadiness(pos, skills) {
  const entries = Object.entries(pos.requirements);
  if (!entries.length) return 1;
  let sum = 0;
  for (const [skill, req] of entries) {
    sum += Math.min(1, (skills[skill] || 0) / req);
  }
  return sum / entries.length;
}

const avatarLevel   = xp => Math.floor(Math.sqrt(xp / 100)) + 1;
const xpForLevel    = lvl => Math.pow(lvl - 1, 2) * 100;

function addXp(amount) {
  const before = avatarLevel(state.xp);
  state.xp += amount;
  const after = avatarLevel(state.xp);
  if (after > before) {
    toast(`🎉 Новый уровень аватара: ${after}`);
    logActivity(`Аватар достиг уровня ${after}`, '🎉');
  }
}

function logActivity(text, icon = '✨') {
  state.activity.unshift({ icon, text, time: Date.now() });
  if (state.activity.length > 40) state.activity.length = 40;
}

function timeAgo(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'только что';
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} дн назад`;
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

/* ---------- Render: Profile ---------- */
function renderProfile() {
  const pos       = currentPosition();
  const track     = TRACKS[pos.trackId];
  const grade     = GRADES.find(g => g.id === pos.gradeId);
  const nextGrade = GRADES.find(g => g.level === grade.level + 1);
  const nextPos   = nextGrade ? POSITION_BY_ID[`${pos.trackId}_${nextGrade.id}`] : null;
  const readiness = nextPos ? positionReadiness(nextPos, state.skills) : 1;
  const lvl       = avatarLevel(state.xp);
  const curLvlXp  = xpForLevel(lvl);
  const nxtXp     = xpForLevel(lvl + 1);
  const levelPct  = Math.round(((state.xp - curLvlXp) / (nxtXp - curLvlXp)) * 100);

  const skillRow = ([id, meta]) => {
    const val = state.skills[id] || 0;
    return `
      <div class="skill-row">
        <div class="skill-name">${meta.name}</div>
        <div class="skill-bar"><div class="skill-fill" style="width:${val}%"></div></div>
        <div class="skill-val">${val}</div>
        <button class="icon-btn" data-skill-up="${id}" title="Прокачать (+3)">+</button>
      </div>`;
  };

  const hard    = Object.entries(SKILL_CATALOG).filter(([, s]) => s.group === 'Hard');
  const soft    = Object.entries(SKILL_CATALOG).filter(([, s]) => s.group === 'Soft');
  const project = Object.entries(SKILL_CATALOG).filter(([, s]) => s.group === 'Project');

  document.getElementById('profile').innerHTML = `
    <div class="hero card">
      <div class="avatar-wrap">
        <div class="avatar" data-avatar title="Сменить аватар">${state.avatar}</div>
        <div class="level-badge">Ур. ${lvl}</div>
      </div>
      <div class="hero-info">
        <h2>${state.name}</h2>
        <p class="muted" style="margin:0">${state.role} · ${state.department}</p>
        <div class="chips">
          <span class="chip chip-grade">${grade.name} · ${track.name}</span>
          <span class="chip">${state.xp} XP</span>
        </div>
        <div class="xp-bar"><div class="xp-fill" style="width:${levelPct}%"></div></div>
        <p class="muted small" style="margin:6px 0 0">${state.xp - curLvlXp} / ${nxtXp - curLvlXp} XP до уровня ${lvl + 1}</p>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>Текущая позиция</h3>
        <div class="pos-big">${pos.title}</div>
        <p class="muted">${pos.description}</p>
      </div>
      <div class="card">
        <h3>Следующая ступень</h3>
        <div class="pos-big">${nextPos ? nextPos.title : 'Максимальный грейд'}</div>
        <div class="progress-big"><div style="width:${Math.round(readiness * 100)}%"></div></div>
        <p class="muted">Готовность: <strong style="color:var(--text)">${Math.round(readiness * 100)}%</strong></p>
        <button class="btn" data-goto="map">Открыть карту →</button>
      </div>
    </div>

        <div class="card">
      <h2>Навыки</h2>
      <div class="skills-cols">
        <div><h3>Hard skills</h3>${hard.map(skillRow).join('')}</div>
        <div><h3>Soft skills</h3>${soft.map(skillRow).join('')}</div>
        <div><h3>Проектные навыки</h3>${project.map(skillRow).join('')}</div>
      </div>
    </div>`;
  `;
}

/* ---------- Career Tree ---------- */
function buildCareerTreeSVG() {
  const pos = currentPosition();
  const grade = GRADES.find(g => g.id === pos.gradeId);

  const W = 1200, H = 680;
  const NODE_W = 240, NODE_H = 76;
  const centerX = 600, centerY = 420;

  const nodes = [];
  const edges = [];

  /* Текущая позиция */
  nodes.push({ id: pos.id, pos, x: centerX, y: centerY, type: 'current', label: 'Вы здесь' });

  /* Следующий грейд (вертикальный рост) */
  const nextGrade = GRADES.find(g => g.level === grade.level + 1);
  const nextPos = nextGrade ? POSITION_BY_ID[`${pos.trackId}_${nextGrade.id}`] : null;
  if (nextPos) {
    nodes.push({ id: nextPos.id, pos: nextPos, x: centerX, y: centerY - 140, type: 'next', label: 'Следующий шаг' });
    edges.push({ from: pos.id, to: nextPos.id, type: 'vertical' });
  }

  /* Грейд +2 (перспектива) */
  const nextGrade2 = GRADES.find(g => g.level === grade.level + 2);
  const nextPos2 = nextGrade2 ? POSITION_BY_ID[`${pos.trackId}_${nextGrade2.id}`] : null;
  if (nextPos2 && nextPos) {
    nodes.push({ id: nextPos2.id, pos: nextPos2, x: centerX, y: centerY - 280, type: 'future', label: 'Перспектива' });
    edges.push({ from: nextPos.id, to: nextPos2.id, type: 'future' });
  }

  /* Предыдущий грейд */
  const prevGrade = GRADES.find(g => g.level === grade.level - 1);
  const prevPos = prevGrade ? POSITION_BY_ID[`${pos.trackId}_${prevGrade.id}`] : null;
  if (prevPos) {
    nodes.push({ id: prevPos.id, pos: prevPos, x: centerX, y: centerY + 140, type: 'prev', label: 'Пройдено' });
    edges.push({ from: pos.id, to: prevPos.id, type: 'prev' });
  }

  /* Горизонтальные переходы — другие треки на том же грейде */
  const otherTracks = Object.entries(TRACKS).filter(([id]) => id !== pos.trackId);
  const leftCount = Math.floor(otherTracks.length / 2);
  const rightCount = otherTracks.length - leftCount;

  const sideYs = (count) => {
    if (count === 0) return [];
    if (count === 1) return [centerY];
    const spacing = Math.min(140, 300 / (count - 1));
    const total = (count - 1) * spacing;
    const start = centerY - total / 2;
    return Array.from({ length: count }, (_, i) => start + i * spacing);
  };
  const leftYs = sideYs(leftCount);
  const rightYs = sideYs(rightCount);

  otherTracks.forEach(([trackId], i) => {
    const horizPos = POSITION_BY_ID[`${trackId}_${grade.id}`];
    let x, y;
    if (i < leftCount) { x = 200; y = leftYs[i]; }
    else { x = 1000; y = rightYs[i - leftCount]; }
    nodes.push({ id: horizPos.id, pos: horizPos, x, y, type: 'horiz', label: 'Альтернатива' });
    edges.push({ from: pos.id, to: horizPos.id, type: 'horiz' });
  });

  /* Точка на границе прямоугольника в направлении к (tx, ty) */
  function edgePoint(cx, cy, w, h, tx, ty) {
    const dx = tx - cx, dy = ty - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    const angle = Math.atan2(dy, dx);
    const tanA = Math.abs(Math.tan(angle));
    let x, y;
    if (tanA <= h / w) {
      x = cx + Math.sign(dx) * (w / 2);
      y = cy + Math.sign(dx) * (w / 2) * Math.tan(angle);
    } else {
      const cotA = 1 / (tanA || Infinity);
      x = cx + Math.sign(dy) * (h / 2) * cotA;
      y = cy + Math.sign(dy) * (h / 2);
    }
    return { x, y };
  }

  /* Рёбра */
  const edgeSvg = edges.map(e => {
    const fromNode = nodes.find(n => n.id === e.from);
    const toNode   = nodes.find(n => n.id === e.to);
    if (!fromNode || !toNode) return '';
    const start = edgePoint(fromNode.x, fromNode.y, NODE_W, NODE_H, toNode.x, toNode.y);
    const end   = edgePoint(toNode.x, toNode.y, NODE_W, NODE_H, fromNode.x, fromNode.y);

    let stroke, dash = '', marker;
    if (e.type === 'vertical') { stroke = '#22c55e'; marker = 'arrow-green'; }
    else if (e.type === 'horiz') { stroke = '#3b82f6'; marker = 'arrow-blue'; }
    else if (e.type === 'future') { stroke = 'rgba(34,197,94,0.5)'; marker = 'arrow-green-faded'; dash = 'stroke-dasharray="6 4"'; }
    else { stroke = 'rgba(139,160,196,0.4)'; marker = 'arrow-gray'; }

    return `<line x1="${start.x.toFixed(1)}" y1="${start.y.toFixed(1)}" x2="${end.x.toFixed(1)}" y2="${end.y.toFixed(1)}"
      stroke="${stroke}" stroke-width="2" ${dash} marker-end="url(#${marker})"/>`;
  }).join('');

  /* Узлы */
  const nodeSvg = nodes.map(n => {
    const nx = n.x - NODE_W / 2;
    const ny = n.y - NODE_H / 2;
    const t = TRACKS[n.pos.trackId];
    const g = GRADES.find(gr => gr.id === n.pos.gradeId);

    let pctText = '';
    if (n.type === 'current') pctText = '100%';
    else if (n.type !== 'prev') pctText = Math.round(positionReadiness(n.pos, state.skills) * 100) + '%';

    return `
      <g class="tree-node ${n.type}" data-pos="${n.id}" style="cursor:pointer">
        <rect class="tree-node-box" x="${nx}" y="${ny}" width="${NODE_W}" height="${NODE_H}" rx="12"/>
        <text x="${n.x}" y="${n.y - 14}" text-anchor="middle" class="tree-node-title">${t.icon} ${g.name} ${t.name}</text>
        <text x="${n.x}" y="${n.y + 6}" text-anchor="middle" class="tree-node-pct">${pctText}</text>
        <text x="${n.x}" y="${n.y + 24}" text-anchor="middle" class="tree-node-label">${n.label}</text>
      </g>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" class="career-tree-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e"/>
        </marker>
        <marker id="arrow-green-faded" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(34,197,94,0.5)"/>
        </marker>
        <marker id="arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6"/>
        </marker>
        <marker id="arrow-gray" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(139,160,196,0.4)"/>
        </marker>
      </defs>
      ${edgeSvg}
      ${nodeSvg}
    </svg>`;
}

/* ---------- Render: Map ---------- */
function renderMap() {
  const curPos = currentPosition();
  const tracks = Object.entries(TRACKS);

  const headCells = tracks
    .map(([, t]) => `<div class="cell cell-head">${t.icon} ${t.name}</div>`)
    .join('');

  const rows = [...GRADES].reverse().map(grade => {
    const gradeCell = `<div class="cell cell-grade">${grade.name}</div>`;
    const cells = tracks.map(([trackId]) => {
      const pos = POSITION_BY_ID[`${trackId}_${grade.id}`];
      const readiness = positionReadiness(pos, state.skills);
      const isCurrent  = pos.id === state.position;
      const isVertical = trackId === curPos.trackId && grade.level === curPos.gradeLevel + 1;
      const isHoriz    = trackId !== curPos.trackId && grade.level === curPos.gradeLevel;

      let cls = 'cell cell-pos';
      let label = '';
      if (isCurrent)      { cls += ' current';    label = 'Вы здесь'; }
      else if (isVertical){ cls += ' vertical';   label = 'Вертикальный рост'; }
      else if (isHoriz)   { cls += ' horizontal'; label = 'Горизонтальный переход'; }

      return `<div class="${cls}" data-pos="${pos.id}">
          <div class="pos-pct">${Math.round(readiness * 100)}%</div>
          ${label ? `<div class="pos-label">${label}</div>` : ''}
        </div>`;
    }).join('');
    return gradeCell + cells;
  }).join('');

  const treeSVG = buildCareerTreeSVG();

  document.getElementById('map').innerHTML = `
    <div class="card">
      <div class="panel-head">
        <h2 style="margin:0">Карта движения</h2>
        <div class="legend">
          <span><i class="dot current"></i>Текущая позиция</span>
          <span><i class="dot vertical"></i>Вертикальный рост (грейд)</span>
          <span><i class="dot horizontal"></i>Горизонтальный переход (роль)</span>
        </div>
      </div>
      <p class="muted">Нажмите на ячейку, чтобы увидеть требования, разрыв в навыках и возможность перехода.</p>
      <div class="map-scroll">
        <div class="map-grid" style="grid-template-columns: 110px repeat(${tracks.length}, minmax(130px, 1fr));">
          <div class="cell cell-head">Грейд</div>
          ${headCells}
          ${rows}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="panel-head">
        <h2 style="margin:0">Дерево карьерных переходов</h2>
        <div class="legend">
          <span><i class="dot edge-vertical"></i>Вертикальный рост</span>
          <span><i class="dot edge-horiz"></i>Горизонтальный переход</span>
          <span><i class="dot edge-future"></i>Перспектива</span>
        </div>
      </div>
      <p class="muted">Ваши возможные пути от текущей позиции. Нажмите на узел, чтобы увидеть требования и разрыв в навыках.</p>
      <div class="career-tree-wrap">
        ${treeSVG}
      </div>
    </div>`;
}

/* ---------- Render: Plan ---------- */
function goalCard(g) {
  const skillName = SKILL_CATALOG[g.skill]?.name || g.skill;
  return `
    <div class="goal ${g.completed ? 'done' : ''}">
      <div class="goal-head">
        <div>
          <div class="goal-title">${g.title}</div>
          <div class="muted small">Навык: ${skillName} · +${g.xp} XP</div>
        </div>
        ${g.completed ? '<span class="badge-done">✓ Выполнено</span>' : ''}
      </div>
      <div class="goal-progress"><div style="width:${g.progress}%"></div></div>
      ${g.completed ? '' : `
        <div class="goal-actions">
          <span class="muted small">${g.progress}%</span>
          <button class="btn btn-sm" data-goal-add="${g.id}">+25%</button>
        </div>`}
    </div>`;
}

function renderPlan() {
  const skillOptions = Object.entries(SKILL_CATALOG)
    .map(([id, s]) => `<option value="${id}">${s.name}</option>`).join('');

  document.getElementById('plan').innerHTML = `
    <div class="card">
      <h2>Индивидуальный план развития</h2>
      <p class="muted">Закрывайте цели — они прокачивают навыки и добавляют XP аватару.</p>
      <div class="goals">${state.goals.map(goalCard).join('')}</div>
      <div class="add-goal">
        <input id="goal-title" placeholder="Новая цель, например: «Пройти собеседование на Senior»">
        <select id="goal-skill">${skillOptions}</select>
        <button class="btn btn-primary" id="add-goal-btn">Добавить</button>
      </div>
    </div>
  `;
}

/* ---------- Render: Feed ---------- */
function renderFeed() {
  document.getElementById('feed').innerHTML = `
    <div class="card">
      <h2>Активность</h2>
      <ul class="feed">
        ${state.activity.map(a => `
          <li>
            <span class="feed-icon">${a.icon}</span>
            <div>
              <div>${a.text}</div>
              <div class="muted small">${timeAgo(a.time)}</div>
            </div>
          </li>`).join('')}
      </ul>
    </div>
  `;
}

/* ---------- Radar ---------- */
function polarPoint(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildRadarSVG(skillIds, requirements, userSkills, currentGradeLevel) {
  const N = skillIds.length;
  const size = 560;
  const cx = size / 2, cy = size / 2;
  const R = 140;
  const labelR = 190;
  const angles = Array.from({ length: N }, (_, i) => (360 / N) * i);

  /* Сетка */
  const rings = [25, 50, 75, 100];
  const ringPolygons = rings.map(pct => {
    const pts = angles.map(a => {
      const p = polarPoint(cx, cy, R * pct / 100, a);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
  }).join('');

  /* Оси */
  const axes = angles.map(a => {
    const p = polarPoint(cx, cy, R, a);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
  }).join('');

  /* Метки 25 / 50 / 75 / 100 */
  const pctLabels = rings.map(pct => {
    const p = polarPoint(cx, cy, R * pct / 100, 0);
    return `<text x="${(p.x - 6).toFixed(1)}" y="${(p.y + 4).toFixed(1)}" fill="rgba(139,160,196,0.55)" font-size="10" text-anchor="end" font-family="Manrope,sans-serif">${pct}</text>`;
  }).join('');

  /* Границы грейдов Junior / Middle / Senior */
  const gradeMeta = [
    { level: 1, color: '#64748b' },
    { level: 2, color: '#eab308' },
    { level: 3, color: '#22c55e' },
  ];
  const gradePolygons = gradeMeta.map(({ level, color }) => {
    const values = skillIds.map(id => requirements[id]?.[level - 1] || 0);
    const pts = values.map((v, i) => {
      const p = polarPoint(cx, cy, R * v / 100, angles[i]);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    const isCurrent = level === currentGradeLevel;
    return `<polygon points="${pts}" fill="${color}" fill-opacity="${isCurrent ? 0.1 : 0.04}" stroke="${color}" stroke-width="${isCurrent ? 2 : 1.2}" stroke-opacity="${isCurrent ? 0.85 : 0.55}" ${isCurrent ? '' : 'stroke-dasharray="4 3"'}/>`;
  }).join('');

  /* Полигон текущих навыков */
  const userValues = skillIds.map(id => userSkills[id] || 0);
  const userPts = userValues.map((v, i) => {
    const p = polarPoint(cx, cy, R * v / 100, angles[i]);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');
  const userDots = userValues.map((v, i) => {
    const p = polarPoint(cx, cy, R * v / 100, angles[i]);
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#6366f1" stroke="#0a0f1c" stroke-width="1.5"/>`;
  }).join('');

  /* Подписи осей: имя + значение */
  const axisLabels = skillIds.map((id, i) => {
    const p = polarPoint(cx, cy, labelR, angles[i]);
    const v = userSkills[id] || 0;
    const name = SKILL_SHORT_NAMES[id] || SKILL_CATALOG[id]?.name || id;
    return `
      <text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="middle" font-family="Manrope,sans-serif">
        <tspan x="${p.x.toFixed(1)}" dy="-2" fill="#c7d2fe" font-size="11" font-weight="700">${name}</tspan>
        <tspan x="${p.x.toFixed(1)}" dy="14" fill="#8ba0c4" font-size="10" font-weight="500">${v}%</tspan>
      </text>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${size} ${size}" class="radar-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="avatarRadarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#22d3ee"/>
          <stop offset="100%" stop-color="#6366f1"/>
        </radialGradient>
      </defs>
      ${ringPolygons}
      ${axes}
      ${pctLabels}
      ${gradePolygons}
      <polygon points="${userPts}" fill="url(#avatarRadarGrad)" fill-opacity="0.3" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>
      ${userDots}
      ${axisLabels}
    </svg>`;
}

function renderRadar() {
  const pos = currentPosition();
  const track = TRACKS[pos.trackId];
  const isHard    = radarMode === 'hard';
  const isSoft    = radarMode === 'soft';
  const isProject = radarMode === 'project';
  const skillIds = isHard    ? Object.keys(track.skills)
                 : isSoft    ? Object.keys(SOFT_GRADE_REQUIREMENTS)
                 :             Object.keys(PROJECT_GRADE_REQUIREMENTS);
  const requirements = isHard    ? track.skills
                     : isSoft    ? SOFT_GRADE_REQUIREMENTS
                     :             PROJECT_GRADE_REQUIREMENTS;

  const svg = buildRadarSVG(skillIds, requirements, state.skills, pos.gradeLevel);

  const gradeLabels = ['Junior', 'Middle', 'Senior'];
  const tableRows = skillIds.map(id => {
    const cur = state.skills[id] || 0;
    const name = SKILL_SHORT_NAMES[id] || SKILL_CATALOG[id]?.name || id;
    const cells = gradeLabels.map((_, i) => {
      const req = requirements[id]?.[i] || 0;
      const cls = cur >= req ? 'ok' : 'gap';
      return `<td class="num ${cls}">${req}</td>`;
    }).join('');
    return `<tr><td>${name}</td><td class="num you">${cur}</td>${cells}</tr>`;
  }).join('');

  document.getElementById('radar').innerHTML = `
    <div class="card">
      <div class="panel-head">
        <h2 style="margin:0">Роза навыков</h2>
                <div class="radar-toggle">
          <button class="toggle-btn ${isHard    ? 'active' : ''}" data-radar-mode="hard">Hard</button>
          <button class="toggle-btn ${isSoft    ? 'active' : ''}" data-radar-mode="soft">Soft</button>
          <button class="toggle-btn ${isProject ? 'active' : ''}" data-radar-mode="project">Проектные</button>
        </div>
      </div>
            <p class="muted">На графике — ваши навыки${isHard ? ` (направление <strong style="color:var(--text)">${track.name}</strong>)` : isSoft ? ' (универсальные)' : ' (проектные)'} и границы грейдов Junior, Middle, Senior. Позиция: <strong style="color:var(--text)">${pos.title}</strong>.</p>
      <div class="radar-layout">
        <div class="radar-wrap">${svg}</div>
        <div class="radar-info">
          <div class="legend legend-v">
            <span><i class="dot radar-user"></i>Ваши навыки</span>
            <span><i class="dot radar-junior"></i>Junior</span>
            <span><i class="dot radar-middle"></i>Middle</span>
            <span><i class="dot radar-senior"></i>Senior</span>
          </div>
          <table class="radar-table">
            <thead>
              <tr>
                <th>Навык</th>
                <th class="num">Вы</th>
                <th class="num">J</th>
                <th class="num">M</th>
                <th class="num">S</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function onRadarClick(e) {
  const btn = e.target.closest('[data-radar-mode]');
  if (btn) {
    radarMode = btn.dataset.radarMode;
    renderRadar();
  }
}

/* ---------- User Switcher ---------- */
function renderUserSwitcher() {
  const pos = currentPosition();
  const track = TRACKS[pos.trackId];
  const grade = GRADES.find(g => g.id === pos.gradeId);

  document.getElementById('user-switcher-avatar').textContent = state.avatar;
  document.getElementById('user-switcher-name').textContent = state.name;
  document.getElementById('user-switcher-role').textContent = `${grade.name} ${track.name}`;

  document.getElementById('user-dropdown').innerHTML = Object.entries(users).map(([id, u]) => {
    const uPos = POSITION_BY_ID[u.position];
    const uTrack = TRACKS[uPos.trackId];
    const uGrade = GRADES.find(g => g.id === uPos.gradeId);
    return `
      <button class="user-option ${id === activeUserId ? 'active' : ''}" data-user-id="${id}">
        <span class="user-option-avatar">${u.avatar}</span>
        <span class="user-option-info">
          <span class="user-option-name">${u.name}</span>
          <span class="user-option-role">${u.role} · ${u.department}</span>
        </span>
        <span class="user-option-grade">${uGrade.name}</span>
      </button>`;
  }).join('');
}

function setupUserSwitcher() {
  const btn = document.getElementById('user-switcher-btn');
  const dropdown = document.getElementById('user-dropdown');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  dropdown.addEventListener('click', e => {
    const opt = e.target.closest('[data-user-id]');
    if (opt) {
      switchUser(opt.dataset.userId);
      dropdown.classList.add('hidden');
    }
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.user-switcher')) dropdown.classList.add('hidden');
  });
}

/* ---------- Render all ---------- */
function renderAll() {
  renderUserSwitcher();
  renderProfile();
  renderRadar();
  renderMap();
  renderPlan();
  renderFeed();
}

/* ---------- Modal ---------- */
function openPositionModal(posId) {
  const pos = POSITION_BY_ID[posId];
  if (!pos) return;

  const track = TRACKS[pos.trackId];
  const grade = GRADES.find(g => g.id === pos.gradeId);
  const readiness = positionReadiness(pos, state.skills);
  const isCurrent = pos.id === state.position;
  const canMove = !isCurrent && readiness >= 0.85;

  const gaps = Object.entries(pos.requirements)
    .map(([skillId, req]) => ({
      name: SKILL_CATALOG[skillId].name,
      req,
      cur: state.skills[skillId] || 0,
    }))
    .sort((a, b) => (b.req - b.cur) - (a.req - a.cur));

  document.querySelector('#modal .modal-content').innerHTML = `
    <button class="modal-close" aria-label="Закрыть">✕</button>
    <div class="modal-head">
      <div class="modal-icon" style="background:${track.color}22;color:${track.color}">${track.icon}</div>
      <div>
        <h3>${pos.title}</h3>
        <p class="muted small" style="margin:2px 0 0">${track.name} · ${grade.name}</p>
      </div>
    </div>
    <p class="muted">${pos.description}</p>

    <div class="readiness-row">
      <div class="progress-big"><div style="width:${Math.round(readiness * 100)}%"></div></div>
      <strong>${Math.round(readiness * 100)}%</strong>
    </div>

    <h3 style="margin-top:18px">Требования и ваши навыки</h3>
    <div class="gap-list">
      ${gaps.map(g => `
        <div class="gap-row">
          <div>${g.name}</div>
          <div class="gap-bar">
            <div class="gap-cur" style="width:${Math.min(100, g.cur)}%"></div>
            <div class="gap-req" style="left:${g.req}%"></div>
          </div>
          <div class="gap-vals ${g.cur >= g.req ? 'ok' : ''}">${g.cur} / ${g.req}</div>
        </div>`).join('')}
    </div>

    ${isCurrent
      ? `<p class="note">Это ваша текущая позиция.</p>`
      : canMove
        ? `<button class="btn btn-primary" style="margin-top:18px" data-move="${pos.id}">Перейти на позицию →</button>`
        : `<p class="note">Для перехода нужно ≥ 85% готовности. Прокачайте навыки или добавьте цель в план развития.</p>`}
  `;
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function moveToPosition(posId) {
  const pos = POSITION_BY_ID[posId];
  state.position = posId;
  addXp(200);
  logActivity(`Переход на позицию «${pos.title}» (+200 XP)`, '🚀');
  saveState();
  closeModal();
  renderAll();
  toast(`Поздравляем! Новая позиция: ${pos.title}`);
}

/* ---------- Goal actions ---------- */
function addGoalProgress(id, amount) {
  const goal = state.goals.find(g => g.id === id);
  if (!goal || goal.completed) return;

  goal.progress = Math.min(100, goal.progress + amount);

  if (goal.progress >= 100) {
    goal.completed = true;
    addXp(goal.xp);
    state.skills[goal.skill] = Math.min(100, (state.skills[goal.skill] || 0) + 5);
    logActivity(`Цель достигнута: «${goal.title}» (+${goal.xp} XP)`, '✅');
    toast(`Цель выполнена! +${goal.xp} XP`);
  }

  saveState();
  renderAll();
}

function addGoal() {
  const titleEl = document.getElementById('goal-title');
  const skillEl = document.getElementById('goal-skill');
  const title = titleEl.value.trim();
  if (!title) { toast('Введите название цели'); return; }

  state.goals.push({
    id: 'g' + Date.now(),
    title,
    skill: skillEl.value,
    xp: 200,
    progress: 0,
    completed: false,
  });
  logActivity(`Добавлена цель: «${title}»`, '🎯');
  saveState();
  renderAll();
}

/* ---------- Handlers ---------- */
function onProfileClick(e) {
  const skillBtn = e.target.closest('[data-skill-up]');
  if (skillBtn) {
    const id = skillBtn.dataset.skillUp;
    state.skills[id] = Math.min(100, (state.skills[id] || 0) + 3);
    addXp(15);
    logActivity(`Прокачан навык: ${SKILL_CATALOG[id].name} (+3)`, '📈');
    saveState();
    renderAll();
    return;
  }

  const goBtn = e.target.closest('[data-goto]');
  if (goBtn) { switchTab(goBtn.dataset.goto); return; }

  if (e.target.closest('[data-avatar]')) {
    const idx = AVATARS.indexOf(state.avatar);
    state.avatar = AVATARS[(idx + 1) % AVATARS.length];
    saveState();
    renderProfile();
  }
}

function onPlanClick(e) {
  const addBtn = e.target.closest('[data-goal-add]');
  if (addBtn) { addGoalProgress(addBtn.dataset.goalAdd, 25); return; }
  if (e.target.id === 'add-goal-btn') { addGoal(); }
}

/* ---------- Tabs ---------- */
function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === tab));
}

/* ---------- Init ---------- */
function init() {
  document.querySelectorAll('.tab').forEach(btn =>
    btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  document.getElementById('profile').addEventListener('click', onProfileClick);
  document.getElementById('plan').addEventListener('click', onPlanClick);
  document.getElementById('radar').addEventListener('click', onRadarClick);

  document.getElementById('map').addEventListener('click', e => {
    const cell = e.target.closest('[data-pos]');
    if (cell) openPositionModal(cell.dataset.pos);
  });

  document.getElementById('modal').addEventListener('click', e => {
    if (e.target.id === 'modal' || e.target.closest('.modal-close')) { closeModal(); return; }
    const moveBtn = e.target.closest('[data-move]');
    if (moveBtn) moveToPosition(moveBtn.dataset.move);
  });

    document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Сбросить все демо-данные (все пользователи)?')) return;
    localStorage.removeItem(STORAGE_KEY);
    store = loadStore();
    users = store.users;
    activeUserId = store.activeUserId;
    state = users[activeUserId];
    renderAll();
    toast('Все демо-данные сброшены');
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    setupUserSwitcher();
  renderAll();
}
init();
