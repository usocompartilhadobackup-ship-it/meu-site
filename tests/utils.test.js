// Rode com: TZ=America/Sao_Paulo node --test tests/utils.test.js
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = {};
vm.createContext(context);
const source = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');
vm.runInContext(source + `;Object.assign(globalThis,{escapeHtml,toDateKey,parseDateKey,mondayIndex,weekDateKeys,computeStreak,formatClock,parseSetScheme,bestSet,mergeStates,normalizeHistory});`, context);
const { escapeHtml, toDateKey, parseDateKey, mondayIndex, weekDateKeys, computeStreak, formatClock, parseSetScheme, bestSet, mergeStates, normalizeHistory } = context;
const plain = value => JSON.parse(JSON.stringify(value));

test('escapeHtml neutraliza marcação', () => {
  assert.strictEqual(escapeHtml(`<img src=x onerror="a('b')">`), '&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;');
  assert.strictEqual(escapeHtml(null), '');
});

test('toDateKey usa o dia local, inclusive à noite', () => {
  assert.strictEqual(toDateKey(new Date(2026, 10, 3, 23, 30)), '2026-11-03');
  assert.strictEqual(toDateKey(parseDateKey('2026-11-01')), '2026-11-01');
});

test('mondayIndex e semana começam na segunda', () => {
  assert.strictEqual(mondayIndex(new Date(2026, 10, 1)), 6); // domingo
  assert.strictEqual(mondayIndex(new Date(2026, 10, 2)), 0); // segunda
  const week = plain(weekDateKeys(new Date(2026, 10, 1, 22)));
  assert.strictEqual(week[0], '2026-10-26');
  assert.strictEqual(week[6], '2026-11-01');
  assert.strictEqual(plain(weekDateKeys(new Date(2026, 10, 1), 1))[0], '2026-10-19');
});

test('computeStreak mantém a sequência enquanto o treino de hoje não ocorreu', () => {
  const today = new Date(2026, 10, 3, 8);
  assert.strictEqual(computeStreak(['2026-11-01', '2026-11-02'], today), 2);
  assert.strictEqual(computeStreak(['2026-11-01', '2026-11-02', '2026-11-03'], today), 3);
  assert.strictEqual(computeStreak(['2026-10-31'], today), 0);
  assert.strictEqual(computeStreak([], today), 0);
});

test('formatClock e parseSetScheme', () => {
  assert.strictEqual(formatClock(75), '01:15');
  assert.deepStrictEqual(plain(parseSetScheme('4x10')), { count: 4, reps: 10 });
  assert.deepStrictEqual(plain(parseSetScheme('inválido')), { count: 3, reps: 10 });
});

test('bestSet escolhe a maior carga', () => {
  assert.strictEqual(bestSet([{ weight: 40, reps: 10 }, { weight: '60', reps: 8 }, { weight: 50, reps: 9 }]).reps, 8);
});

test('normalizeHistory aceita o formato antigo', () => {
  assert.deepStrictEqual(plain(normalizeHistory({ date: '2026-01-01' })), [{ date: '2026-01-01' }]);
  assert.deepStrictEqual(plain(normalizeHistory(undefined)), []);
});

test('mergeStates não perde treino feito offline nem registro da nuvem', () => {
  const cloud = {
    workouts: [{ day: 0, name: 'Nuvem', exercises: [] }],
    completedDays: ['2026-10-30'], totalWorkouts: 5, totalMinutes: 100,
    loadHistory: { e1: { date: '2026-10-30', weight: 50, reps: 10 }, e2: [{ date: '2026-10-28', weight: 20, reps: 12 }] },
    updatedAt: 10
  };
  const local = {
    workouts: [{ day: 0, name: 'Local', exercises: [] }],
    completedDays: ['2026-11-01'], totalWorkouts: 6, totalMinutes: 90,
    loadHistory: { e1: [{ date: '2026-11-01', weight: 55, reps: 8 }] },
    updatedAt: 20
  };
  const merged = plain(mergeStates(local, cloud));
  assert.deepStrictEqual(merged.completedDays, ['2026-10-30', '2026-11-01']);
  assert.strictEqual(merged.totalWorkouts, 6);
  assert.strictEqual(merged.totalMinutes, 100);
  assert.strictEqual(merged.workouts[0].name, 'Local');
  assert.deepStrictEqual(merged.loadHistory.e1.map(r => r.date), ['2026-10-30', '2026-11-01']);
  assert.strictEqual(merged.loadHistory.e2.length, 1);
});
