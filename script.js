// StudentHub frontend demo.
// Data is stored in this browser's localStorage for now.
// Later, we will replace these localStorage functions with calls to our Express API.

const STORAGE_KEY = "studenthub_students_v1";

const sampleStudents = [
  { recordId: "demo-1", name: "Aline Uwase", studentId: "STU001", email: "aline@example.com", studentClass: "Year 2 - Software", status: "Active", createdAt: Date.now() - 300000 },
  { recordId: "demo-2", name: "Eric Mugisha", studentId: "STU002", email: "eric@example.com", studentClass: "Year 1 - Networking", status: "Active", createdAt: Date.now() - 200000 },
  { recordId: "demo-3", name: "Diane Mukamana", studentId: "STU003", email: "diane@example.com", studentClass: "Year 3 - Software", status: "Inactive", createdAt: Date.now() - 100000 }
];

const $ = (selector) => document.querySelector(selector);
const form = $("#studentForm");
let students = loadStudents();

function loadStudents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? [...sampleStudents] : JSON.parse(saved);
  } catch (error) {
    console.error("Could not read saved students:", error);
    return [...sampleStudents];
  }
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function statusBadge(status) {
  const className = status === "Active" ? "active" : "inactive";
  return `<span class="status ${className}">${status}</span>`;
}

function studentRow(student, includeActions = true) {
  const safeName = escapeHTML(student.name);
  return `<tr>
    <td><div class="student-cell"><span class="student-avatar">${escapeHTML(initials(student.name))}</span>${safeName}</div></td>
    <td>${escapeHTML(student.studentId)}</td>
    <td>${escapeHTML(student.studentClass)}</td>
    <td>${escapeHTML(student.email)}</td>
    <td>${statusBadge(student.status)}</td>
    ${includeActions ? `<td><div class="row-actions">
      <button class="small-action" data-action="edit" data-id="${escapeHTML(student.recordId)}">Edit</button>
      <button class="small-action delete" data-action="delete" data-id="${escapeHTML(student.recordId)}">Delete</button>
    </div></td>` : ""}
  </tr>`;
}

function renderDashboard() {
  const active = students.filter(student => student.status === "Active").length;
  const inactive = students.length - active;
  const classes = new Set(students.map(student => student.studentClass.trim().toLowerCase())).size;

  $("#totalStudents").textContent = students.length;
  $("#activeStudents").textContent = active;
  $("#inactiveStudents").textContent = inactive;
  $("#classCount").textContent = classes;

  const recent = [...students].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  $("#recentTableBody").innerHTML = recent.map(student => studentRow(student, false)).join("");
  $("#recentEmpty").classList.toggle("show", recent.length === 0);
}

function renderStudents() {
  const searchTerm = $("#searchInput").value.trim().toLowerCase();
  const status = $("#statusFilter").value;

  const filtered = students.filter(student => {
    const matchesSearch = [student.name, student.studentId, student.email, student.studentClass]
      .some(value => value.toLowerCase().includes(searchTerm));
    const matchesStatus = status === "all" || student.status === status;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => a.name.localeCompare(b.name));

  $("#studentsTableBody").innerHTML = filtered.map(student => studentRow(student, true)).join("");
  $("#studentsEmpty").classList.toggle("show", filtered.length === 0);
  $("#studentCountLabel").textContent = `${students.length} total record${students.length === 1 ? "" : "s"}`;
  $("#showingLabel").textContent = `Showing ${filtered.length} of ${students.length} students`;
}

function renderAll() {
  renderDashboard();
  renderStudents();
}

function openModal(student = null) {
  form.reset();
  $("#formError").textContent = "";
  $("#studentRecordId").value = student ? student.recordId : "";
  $("#modalTitle").textContent = student ? "Edit student" : "Add a student";
  $("#saveStudentButton").textContent = student ? "Update student" : "Save student";

  if (student) {
    $("#fullName").value = student.name;
    $("#studentId").value = student.studentId;
    $("#email").value = student.email;
    $("#studentClass").value = student.studentClass;
    $("#studentStatus").value = student.status;
  }

  $("#studentModal").classList.remove("hidden");
  $("#fullName").focus();
}

function closeModal() {
  $("#studentModal").classList.add("hidden");
  form.reset();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function switchView(view) {
  const showStudents = view === "students";
  $("#overviewView").classList.toggle("hidden", showStudents);
  $("#studentsView").classList.toggle("hidden", !showStudents);
  $("#pageCrumb").textContent = showStudents ? "Students" : "Overview";
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.view === view);
  });
  $("#sidebar").classList.remove("open");
}

function exportCSV() {
  const headers = ["Name", "Student ID", "Email", "Class", "Status"];
  const rows = students.map(student => [student.name, student.studentId, student.email, student.studentClass, student.status]);
  const csv = [headers, ...rows].map(row =>
    row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "student-records.csv";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Student records exported.");
}

// Open the add-student form from either page.
$("#addStudentTop").addEventListener("click", () => openModal());
$("#addStudentPage").addEventListener("click", () => openModal());
$("#closeModal").addEventListener("click", closeModal);
$("#cancelModal").addEventListener("click", closeModal);
$("#studentModal").addEventListener("click", event => {
  if (event.target === $("#studentModal")) closeModal();
});

// Save a new student or update an existing student.
form.addEventListener("submit", event => {
  event.preventDefault();

  const recordId = $("#studentRecordId").value;
  const name = $("#fullName").value.trim();
  const studentId = $("#studentId").value.trim();
  const email = $("#email").value.trim();
  const studentClass = $("#studentClass").value.trim();
  const status = $("#studentStatus").value;

  if (!name || !studentId || !email || !studentClass) {
    $("#formError").textContent = "Please complete all required fields.";
    return;
  }

  const duplicateId = students.some(student =>
    student.studentId.toLowerCase() === studentId.toLowerCase() && student.recordId !== recordId
  );
  if (duplicateId) {
    $("#formError").textContent = "That Student ID is already in use. Please enter a unique ID.";
    return;
  }

  const duplicateEmail = students.some(student =>
    student.email.toLowerCase() === email.toLowerCase() && student.recordId !== recordId
  );
  if (duplicateEmail) {
    $("#formError").textContent = "That email address is already registered.";
    return;
  }

  if (recordId) {
    students = students.map(student => student.recordId === recordId
      ? { ...student, name, studentId, email, studentClass, status }
      : student);
    showToast("Student updated successfully.");
  } else {
    students.push({
      recordId: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
      name, studentId, email, studentClass, status, createdAt: Date.now()
    });
    showToast("Student added successfully.");
  }

  saveStudents();
  renderAll();
  closeModal();
});

// Handle Edit and Delete buttons in the student table.
$("#studentsTableBody").addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const student = students.find(item => item.recordId === button.dataset.id);
  if (!student) return;

  if (button.dataset.action === "edit") {
    openModal(student);
  } else if (button.dataset.action === "delete") {
    const confirmed = window.confirm(`Delete the record for ${student.name}?`);
    if (!confirmed) return;
    students = students.filter(item => item.recordId !== student.recordId);
    saveStudents();
    renderAll();
    showToast("Student deleted.");
  }
});

$("#searchInput").addEventListener("input", renderStudents);
$("#statusFilter").addEventListener("change", renderStudents);
$("#exportButton").addEventListener("click", exportCSV);
$("#viewAllStudents").addEventListener("click", () => switchView("students"));

document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    switchView(link.dataset.view);
  });
});

$("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#todayLabel").textContent = new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date());
$("#year").textContent = new Date().getFullYear();

renderAll();
