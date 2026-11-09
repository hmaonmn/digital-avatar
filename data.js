/* ============================================================
   Digital Avatar — данные MVP
   Модель: Track (направление) × Grade (грейд) = Position (позиция)
   ============================================================ */

const SKILL_CATALOG = {
  /* Backend */
  algorithms:       { name: 'Алгоритмы и структуры данных', group: 'Hard' },
  api_design:       { name: 'Проектирование API',           group: 'Hard' },
  databases:        { name: 'Базы данных',                  group: 'Hard' },
  architecture:     { name: 'Архитектура систем',           group: 'Hard' },
  backend_testing:  { name: 'Тестирование бэкенда',         group: 'Hard' },
  /* Frontend */
  html_css:         { name: 'HTML / CSS',                   group: 'Hard' },
  js_ts:            { name: 'JavaScript / TypeScript',      group: 'Hard' },
  ui_ux:            { name: 'UI / UX',                      group: 'Hard' },
  frontend_perf:    { name: 'Производительность фронтенда', group: 'Hard' },
  accessibility:    { name: 'Доступность (a11y)',           group: 'Hard' },
  /* Data */
  sql:              { name: 'SQL',                          group: 'Hard' },
  python:           { name: 'Python',                       group: 'Hard' },
  ml:               { name: 'Машинное обучение',            group: 'Hard' },
  statistics:       { name: 'Статистика',                   group: 'Hard' },
  visualization:    { name: 'Визуализация данных',          group: 'Hard' },
  /* DevOps */
  linux:            { name: 'Linux',                        group: 'Hard' },
  ci_cd:            { name: 'CI / CD',                      group: 'Hard' },
  k8s:              { name: 'Kubernetes',                   group: 'Hard' },
  cloud:            { name: 'Облачные платформы',           group: 'Hard' },
  monitoring:       { name: 'Мониторинг и наблюдаемость',   group: 'Hard' },
  /* Product */
  discovery:        { name: 'Product Discovery',            group: 'Hard' },
  analytics:        { name: 'Продуктовая аналитика',        group: 'Hard' },
  roadmap:          { name: 'Roadmap-планирование',         group: 'Hard' },
  stakeholder:      { name: 'Работа со стейкхолдерами',     group: 'Hard' },
  metrics:          { name: 'Продуктовые метрики',          group: 'Hard' },
  /* QA */
  test_design:      { name: 'Тест-дизайн',                  group: 'Hard' },
  automation:       { name: 'Автоматизация тестов',         group: 'Hard' },
  api_testing:      { name: 'API-тестирование',             group: 'Hard' },
  perf_testing:     { name: 'Нагрузочное тестирование',     group: 'Hard' },
  /* Soft */
  communication:    { name: 'Коммуникация',                 group: 'Soft' },
  ownership:        { name: 'Ownership',                    group: 'Soft' },
  mentoring:        { name: 'Менторство',                   group: 'Soft' },
  teamwork:         { name: 'Командная работа',             group: 'Soft' },
  systems_thinking: { name: 'Системное мышление',           group: 'Soft' },
};

/* Уровни навыков по грейдам: [junior, middle, senior, lead, principal] */
const TRACKS = {
  backend: {
    name: 'Backend', icon: '⚙️', color: '#3b82f6',
    skills: {
      algorithms:       [35, 55, 75, 85, 95],
      api_design:       [30, 55, 75, 88, 95],
      databases:        [30, 55, 75, 85, 92],
      architecture:     [15, 40, 65, 85, 95],
      backend_testing:  [25, 50, 72, 85, 90],
      communication:    [25, 45, 65, 82, 92],
      systems_thinking: [15, 40, 68, 86, 96],
    },
  },
  frontend: {
    name: 'Frontend', icon: '🎨', color: '#ec4899',
    skills: {
      html_css:      [35, 60, 80, 88, 92],
      js_ts:         [30, 60, 80, 90, 95],
      ui_ux:         [20, 45, 70, 85, 92],
      frontend_perf: [15, 40, 68, 86, 94],
      accessibility: [15, 35, 60, 80, 90],
      communication: [25, 45, 65, 82, 92],
      teamwork:      [30, 50, 68, 85, 92],
    },
  },
  data: {
    name: 'Data', icon: '📊', color: '#22d3ee',
    skills: {
      sql:              [30, 60, 80, 90, 95],
      python:           [25, 55, 78, 88, 95],
      ml:               [15, 35, 65, 85, 95],
      statistics:       [20, 45, 70, 85, 92],
      visualization:    [20, 45, 68, 82, 90],
      communication:    [25, 45, 65, 82, 92],
      systems_thinking: [15, 40, 68, 86, 96],
    },
  },
  devops: {
    name: 'DevOps', icon: '🔧', color: '#f59e0b',
    skills: {
      linux:         [35, 60, 80, 90, 95],
      ci_cd:         [25, 55, 78, 88, 94],
      k8s:           [15, 40, 70, 88, 96],
      cloud:         [20, 45, 72, 88, 95],
      monitoring:    [20, 45, 70, 86, 93],
      communication: [25, 45, 65, 82, 92],
      ownership:     [25, 45, 70, 88, 95],
    },
  },
  product: {
    name: 'Product', icon: '📦', color: '#a855f7',
    skills: {
      discovery:        [20, 45, 70, 88, 95],
      analytics:        [20, 45, 70, 86, 94],
      roadmap:          [15, 40, 68, 86, 95],
      stakeholder:      [20, 45, 70, 88, 96],
      metrics:          [15, 40, 68, 86, 94],
      communication:    [30, 55, 75, 90, 97],
      systems_thinking: [15, 40, 68, 86, 96],
    },
  },
  qa: {
    name: 'QA', icon: '🔍', color: '#22c55e',
    skills: {
      test_design:   [30, 55, 78, 88, 94],
      automation:    [20, 45, 72, 88, 95],
      api_testing:   [25, 50, 75, 86, 92],
      perf_testing:  [15, 35, 65, 85, 92],
      communication: [25, 45, 65, 82, 92],
      teamwork:      [30, 50, 68, 85, 92],
    },
  },
};

const GRADES = [
  { id: 'junior',    name: 'Junior',    level: 1 },
  { id: 'middle',    name: 'Middle',    level: 2 },
  { id: 'senior',    name: 'Senior',    level: 3 },
  { id: 'lead',      name: 'Lead',      level: 4 },
  { id: 'principal', name: 'Principal', level: 5 },
];

const GRADE_DESCRIPTIONS = {
  1: 'Решает задачи под руководством наставника, осваивает инструменты и процессы команды.',
  2: 'Самостоятельно решает задачи средней сложности, отвечает за свой участок работы.',
  3: 'Решает сложные задачи, влияет на технические решения команды и развивает коллег.',
  4: 'Отвечает за направление: процессы, людей и результат команды.',
  5: 'Определяет стратегию направления на уровне компании, формирует стандарты.',
};

/* Генерируем все позиции: 6 направлений × 5 грейдов = 30 */
const POSITIONS = (() => {
  const list = [];
  Object.entries(TRACKS).forEach(([trackId, track]) => {
    GRADES.forEach(grade => {
      const requirements = {};
      Object.entries(track.skills).forEach(([skillId, levels]) => {
        requirements[skillId] = levels[grade.level - 1];
      });
      list.push({
        id: `${trackId}_${grade.id}`,
        trackId,
        gradeId: grade.id,
        gradeLevel: grade.level,
        title: `${grade.name} ${track.name}`,
        requirements,
        description: GRADE_DESCRIPTIONS[grade.level],
      });
    });
  });
  return list;
})();

const POSITION_BY_ID = Object.fromEntries(POSITIONS.map(p => [p.id, p]));

/* Демо-сотрудник */
const DEFAULT_SKILLS = {
  algorithms: 62, api_design: 70, databases: 58, architecture: 42, backend_testing: 65,
  html_css: 25, js_ts: 30, ui_ux: 20, frontend_perf: 18, accessibility: 15,
  sql: 45, python: 40, ml: 15, statistics: 25, visualization: 22,
  linux: 35, ci_cd: 30, k8s: 18, cloud: 25, monitoring: 20,
  discovery: 20, analytics: 25, roadmap: 15, stakeholder: 30, metrics: 18,
  test_design: 30, automation: 25, api_testing: 40, perf_testing: 15,
  communication: 55, ownership: 60, mentoring: 28, teamwork: 66, systems_thinking: 48,
};

const DEFAULT_GOALS = [
  { id: 'g1', title: 'Пройти курс по системному дизайну', skill: 'architecture',    xp: 200, progress: 40, completed: false },
  { id: 'g2', title: 'Провести 20 код-ревью',             skill: 'backend_testing', xp: 150, progress: 60, completed: false },
  { id: 'g3', title: 'Выступить на внутреннем митапе',    skill: 'communication',   xp: 250, progress: 0,  completed: false },
  { id: 'g4', title: 'Стать наставником для джуна',       skill: 'mentoring',       xp: 300, progress: 20, completed: false },


/* Короткие названия для подписей на радаре */
const SKILL_SHORT_NAMES = {
  algorithms: 'Алгоритмы',     api_design: 'API-дизайн',    databases: 'Базы данных',
  architecture: 'Архитектура', backend_testing: 'Тестирование',
  html_css: 'HTML/CSS',        js_ts: 'JS/TS',              ui_ux: 'UI/UX',
  frontend_perf: 'Performance', accessibility: 'A11y',
  sql: 'SQL',                  python: 'Python',            ml: 'ML',
  statistics: 'Статистика',    visualization: 'Визуализация',
  linux: 'Linux',              ci_cd: 'CI/CD',              k8s: 'Kubernetes',
  cloud: 'Cloud',              monitoring: 'Мониторинг',
  discovery: 'Discovery',      analytics: 'Аналитика',      roadmap: 'Roadmap',
  stakeholder: 'Стейкхолдеры', metrics: 'Метрики',
  test_design: 'Тест-дизайн',  automation: 'Автотесты',
  api_testing: 'API-тесты',    perf_testing: 'Нагрузка',
  communication: 'Коммуникация', ownership: 'Ownership',    mentoring: 'Менторство',
  teamwork: 'Командность',     systems_thinking: 'Сист. мышление',
};
];

/* Универсальные требования к soft-навыкам по грейдам:
   [Junior, Middle, Senior, Lead, Principal] */
const SOFT_GRADE_REQUIREMENTS = {
  communication:    [25, 45, 65, 80, 92],
  ownership:        [30, 55, 75, 88, 95],
  mentoring:        [15, 30, 50, 75, 90],
  teamwork:         [40, 60, 75, 88, 95],
  systems_thinking: [25, 45, 65, 82, 92],
};
