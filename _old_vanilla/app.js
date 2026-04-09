const students = [
  { name: "Alice Johnson",   roll: "001" },
  { name: "Bob Smith",       roll: "002" },
  { name: "Carol White",     roll: "003" },
  { name: "David Brown",     roll: "004" },
  { name: "Eva Martinez",    roll: "005" },
  { name: "Frank Wilson",    roll: "006" },
  { name: "Grace Lee",       roll: "007" },
  { name: "Henry Taylor",    roll: "008" },
  { name: "Irene Clark",     roll: "009" },
  { name: "James Anderson",  roll: "010" },
  { name: "Karen Thomas",    roll: "011" },
  { name: "Leo Jackson",     roll: "012" },
];

// Set today's date as default
document.getElementById("dateInput").value = new Date().toISOString().split("T")[0];

function buildTable() {
  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = "";

  students.forEach((student, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${student.name}</td>
      <td>${student.roll}</td>
      <td class="status-col">
        <input type="radio" name="status_${i}" value="present" onchange="updateRow(${i})" />
      </td>
      <td class="status-col">
        <input type="radio" name="status_${i}" value="absent" onchange="updateRow(${i})" />
      </td>
      <td class="status-col">
        <input type="radio" name="status_${i}" value="late" onchange="updateRow(${i})" />
      </td>
      <td id="badge_${i}"><span class="badge badge-unmarked">Unmarked</span></td>
    `;
    tbody.appendChild(row);
  });

  updateSummary();
}

function updateRow(index) {
  const selected = document.querySelector(`input[name="status_${index}"]:checked`);
  const badgeCell = document.getElementById(`badge_${index}`);
  if (!selected) return;

  const val = selected.value;
  const labels = { present: "Present", absent: "Absent", late: "Late" };
  badgeCell.innerHTML = `<span class="badge badge-${val}">${labels[val]}</span>`;
  updateSummary();
}

function updateSummary() {
  let present = 0, absent = 0, late = 0;

  students.forEach((_, i) => {
    const sel = document.querySelector(`input[name="status_${i}"]:checked`);
    if (!sel) return;
    if (sel.value === "present") present++;
    else if (sel.value === "absent") absent++;
    else if (sel.value === "late") late++;
  });

  document.getElementById("presentCount").textContent = present;
  document.getElementById("absentCount").textContent  = absent;
  document.getElementById("lateCount").textContent    = late;
  document.getElementById("totalCount").textContent   = students.length;
}

function markAll(status) {
  students.forEach((_, i) => {
    const radio = document.querySelector(`input[name="status_${i}"][value="${status}"]`);
    if (radio) {
      radio.checked = true;
      updateRow(i);
    }
  });
}

function saveAttendance() {
  const date  = document.getElementById("dateInput").value;
  const cls   = document.getElementById("classSelect").value;
  const unmarked = students.some((_, i) =>
    !document.querySelector(`input[name="status_${i}"]:checked`)
  );

  if (unmarked) {
    showToast("Please mark attendance for all students.");
    return;
  }

  showToast(`Attendance for ${cls} on ${date} saved successfully!`);
}

function printAttendance() {
  window.print();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// Init
buildTable();
