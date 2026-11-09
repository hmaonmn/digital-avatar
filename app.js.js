/* ============================================================
   Digital Avatar — приложение
   ============================================================ */

const STORAGE_KEY = 'digital_avatar_v1';
const AVATARS = ['🧑‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '🦊', '🐼', '🦉', '🚀', '🐉', '🦄'];

const DEFAULT_STATE = {
  name: 'Алексей Смирнов',
  avatar: '🧑‍💻',
  role: 'Backend-разработчик',
  department: 'Платформа',
  position: 'backend_middle',
  xp: 1850,
  skills: { ...DEFAULT_SKILLS },
  goals: DEFAULT_GOALS.map(g => ({ ...g })),
  activity: [
    { icon: '🏁', text: 'Старт работы с Digital Avatar', time: Date.now() - 2 * 86400000 },
    { icon: '📈', text: 'Готовность к Senior Backend достигла 81%', time: Date.now() - 86400000 },
  ],
};

/* ---------- State ---------- */
const clone = o => JSON.parse(JSON.stringify(o));

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(DEFAULT_STATE);
    const saved = JSON.parse(raw);
    return {
      ...clone(DEFAULT_STATE),
      ...saved,
      skills: { ...DEFAULT_SKILLS, ...(saved.skills || {}) },
      goals: saved.goals || clone(DEFAULT_GOALS),
    };
  } catch {
    return clone(DEFAULT_STATE);
  }
}

function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

/* ---------- Helpers ---------- */
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

  const hard = Object.entries(SKILL_CATALOG).filter(([, s]) => s.group === 'Hard');
  const soft = Object.entries(SKILL_CATALOG).filter(([, s]) => s.group === 'Soft');

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
        <div>
          <h3>Hard skills</h3>
          ${hard.map(skillRow).join('')}
        </div>
        <div>
          <h3>Soft skills</h3>
          ${soft.map(skillRow).join('')}
        </div>
      </div>
    </div>
  `;
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

      return `
        <div class="${cls}" data-pos="${pos.id}">
          <div class="pos-pct">${Math.round(readiness * 100)}%</div>
          ${label ? `<div class="pos-label">${label}</div>` : ''}
        </div>`;
    }).join('');
    return gradeCell + cells;
  }).join('');

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
  `;
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

/* ---------- Render all ---------- */
function renderAll() {
  renderProfile();
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
    if (!confirm('Сбросить демо-данные?')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    renderAll();
    toast('Демо-данные сброшены');
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  renderAll();
}

init();