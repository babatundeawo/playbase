// Quality checks that run on every pull request and deploy. No dependencies.
// Problems are printed as GitHub annotations. Exit code 1 only for real breakage.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, extname } from "node:path";
import vm from "node:vm";

let errors = 0;
const fail = (file, msg) => { errors++; console.log(`::error file=${file}::${msg}`); };
const warn = (file, msg) => console.log(`::warning file=${file}::${msg}`);

// 1. Question bank: 8 answers per round, points high to low, nothing blank or duplicated.
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(readFileSync("js/questions.js", "utf8") + "\nthis.out = { PRACTICE_ROUND, ROUNDS, SHOW_INFO };", sandbox);
const { PRACTICE_ROUND, ROUNDS, SHOW_INFO } = sandbox.out;
const seen = new Set();
[PRACTICE_ROUND, ...ROUNDS].forEach((round, i) => {
  const where = round === PRACTICE_ROUND ? "the practice round" : `"${round.label}"`;
  const f = "js/questions.js";
  if (!round.question || !round.question.trim()) fail(f, `${where} has no question text.`);
  if (seen.has(round.question)) warn(f, `${where} repeats an earlier question.`);
  seen.add(round.question);
  if (!Array.isArray(round.answers) || round.answers.length !== 8) return fail(f, `${where} must have exactly 8 answers (found ${round.answers ? round.answers.length : 0}).`);
  round.answers.forEach((a, j) => {
    if (!a.text || !String(a.text).trim()) fail(f, `${where}, answer ${j + 1} is blank.`);
    if (!Number.isFinite(a.points) || a.points <= 0) fail(f, `${where}, answer ${j + 1} needs a points number above 0.`);
    if (j > 0 && a.points > round.answers[j - 1].points) warn(f, `${where}: answer ${j + 1} has more points than answer ${j}. Answers should run highest to lowest.`);
  });
});
if (!SHOW_INFO || !SHOW_INFO.title) fail("js/questions.js", "SHOW_INFO is missing.");
console.log(`Question bank: ${ROUNDS.length} rounds + practice round checked.`);

// 2. Every local file referenced from the built pages must exist.
const dist = existsSync("dist") ? "dist" : ".";
for (const page of ["index.html", "host.html", "404.html"]) {
  const path = join(dist, page);
  if (!existsSync(path)) { fail(page, "Page is missing."); continue; }
  const html = readFileSync(path, "utf8");
  for (const m of html.matchAll(/(?:href|src)="([^"#?]+)(?:[?#][^"]*)?"/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|data:|\/\/)/.test(ref)) continue;
    const target = ref.startsWith("/") ? null : resolve(dirname(path), ref);
    if (target && !existsSync(target)) fail(page, `Broken reference: ${ref}`);
  }
}

// 3. JavaScript must at least parse.
for (const dir of ["js", "."]) {
  for (const f of readdirSync(join(dist, dir)).filter((n) => extname(n) === ".js" && statSync(join(dist, dir, n)).isFile())) {
    try { new vm.Script(readFileSync(join(dist, dir, f), "utf8"), { filename: f }); }
    catch (e) { fail(join(dir, f), `Syntax error: ${e.message}`); }
  }
}

if (errors) { console.log(`\n${errors} problem(s) found.`); process.exit(1); }
console.log("All checks passed.");
