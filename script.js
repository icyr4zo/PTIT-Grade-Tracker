const KEY = "gradetrack-mini-courses-v1";
const form = document.getElementById("courseForm");
const nameInput = document.getElementById("name");
const creditInput = document.getElementById("credit");
const scoreInput = document.getElementById("score");
const scoreMode = document.getElementById("scoreMode");
const scoreLabel = scoreInput.parentElement;
const rows = document.getElementById("rows");
let courses = loadCourses();

function loadCourses() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data.map(c => ({...c, score10: Number(c.score10 ?? c.score ?? 0), score4: Number(c.score4 ?? toFour(Number(c.score ?? 0)))})) : [];
  } catch {
    return [];
  }
}
function saveCourses() {
  localStorage.setItem(KEY, JSON.stringify(courses));
}
// Quy đổi minh họa; hãy kiểm tra quy định chính thức của trường.
function toFour(score) {
  if (score >= 8.5) return 4;
  if (score >= 8.0) return 3.5;
  if (score >= 7.0) return 3.0;
  if (score >= 6.5) return 2.5;
  if (score >= 5.5) return 2.0;
  if (score >= 5.0) return 1.5;
  if (score >= 4.0) return 1.0;
  return 0;
}
// Ước tính điểm hệ 10 từ hệ 4 theo bảng quy đổi minh họa.
// Các khoảng điểm không có phép đổi ngược chính xác, nên dùng điểm đại diện.
function toTen(score4) {
  if (score4 >= 4.0) return 9.0;
  if (score4 >= 3.5) return 8.2;
  if (score4 >= 3.0) return 7.5;
  if (score4 >= 2.5) return 6.7;
  if (score4 >= 2.0) return 6.0;
  if (score4 >= 1.5) return 5.2;
  if (score4 >= 1.0) return 4.5;
  return 2.0;
}
function refreshScoreInput() {
  const isFour = scoreMode.value === "4";
  scoreInput.max = isFour ? "4" : "10";
  scoreInput.step = isFour ? "0.1" : "0.1";
  scoreInput.placeholder = isFour ? "3.5" : "8.5";
  scoreLabel.firstChild.textContent = isFour ? "Điểm hệ 4" : "Điểm hệ 10";
}
scoreMode.addEventListener("change", refreshScoreInput);
refreshScoreInput();

function updateSummary() {
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const total10 = courses.reduce((sum, c) => sum + c.score10 * c.credits, 0);
  const total4 = courses.reduce((sum, c) => sum + c.score4 * c.credits, 0);
  document.getElementById("count").textContent = courses.length;
  document.getElementById("credits").textContent = totalCredits;
  document.getElementById("avg10").textContent = totalCredits ? (total10 / totalCredits).toFixed(2) : "—";
  document.getElementById("gpa4").textContent = totalCredits ? (total4 / totalCredits).toFixed(2) : "0.00";
}
function render() {
  rows.replaceChildren();
  if (courses.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.className = "empty";
    td.textContent = "Chưa có môn học. Hãy thêm môn đầu tiên ở phía trên.";
    tr.appendChild(td);
    rows.appendChild(tr);
    updateSummary();
    return;
  }
  courses.forEach(course => {
    const tr = document.createElement("tr");
    const name = document.createElement("td"); name.textContent = course.name;
    const credit = document.createElement("td"); credit.textContent = course.credits;
    const score = document.createElement("td");
    const pill = document.createElement("span"); pill.className = "pill"; pill.textContent = Number(course.score10).toFixed(1); score.appendChild(pill);
    const four = document.createElement("td"); four.textContent = Number(course.score4).toFixed(1);
    const action = document.createElement("td");
    const button = document.createElement("button"); button.className = "delete"; button.type = "button"; button.textContent = "Xóa";
    button.addEventListener("click", () => { courses = courses.filter(c => c.id !== course.id); saveCourses(); render(); });
    action.appendChild(button); tr.append(name, credit, score, four, action); rows.appendChild(tr);
  });
  updateSummary();
}
form.addEventListener("submit", event => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const credits = Number(creditInput.value);
  const enteredScore = Number(scoreInput.value);
  const mode = scoreMode.value;
  if (!name) return alert("Hãy nhập tên môn học.");
  if (!Number.isInteger(credits) || credits < 1 || credits > 10) return alert("Tín chỉ phải là số nguyên từ 1 đến 10.");
  const maxScore = mode === "4" ? 4 : 10;
  if (!Number.isFinite(enteredScore) || enteredScore < 0 || enteredScore > maxScore) {
    return alert(`Điểm hệ ${mode} phải từ 0 đến ${maxScore}.`);
  }
  const score10 = mode === "10" ? enteredScore : toTen(enteredScore);
  const score4 = mode === "4" ? enteredScore : toFour(enteredScore);
  courses.push({ id: `${Date.now()}-${Math.random()}`, name, credits, score10, score4 });
  saveCourses(); render(); form.reset(); creditInput.value = "3"; scoreMode.value = "10"; refreshScoreInput(); nameInput.focus();
});
document.getElementById("clear").addEventListener("click", () => {
  if (!courses.length) return alert("Danh sách đang trống.");
  if (confirm("M có chắc muốn xóa toàn bộ danh sách môn học không?")) { courses = []; saveCourses(); render(); }
});
render();
