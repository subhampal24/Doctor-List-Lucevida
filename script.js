const DATA_URL = "./doctors.json";
const app = document.getElementById("app");
const tableBody = document.getElementById("tableBody");
const tabsEl = document.getElementById("tabs");
const q = document.getElementById("q");
const resultCount = document.getElementById("resultCount");

let doctors = [];
let activeLocation = null;

async function loadData() {
  try {
    const res = await fetch(DATA_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error();
    doctors = await res.json();
  } catch (e) {
    alert("Failed to load doctors.json");
    doctors = [];
  }
  initUI();
}

function initUI() {
  const locations = [...new Set(doctors.map((d) => d.location))].sort();
  //tabsEl.innerHTML =
  //`<button class="tab active" data-location="all">All</button>` +
  //locations.map(loc => `<button class="tab" data-location="${loc}">${loc}</button>`).join('');

  tabsEl.innerHTML =
    `<button class="tab active" data-location="all">All (${doctors.length})</button>` +
    locations
      .map((loc) => {
        const count = doctors.filter((d) => d.location === loc).length;
        return `<button class="tab" data-location="${loc}">${loc} (${count})</button>`;
      })
      .join("");

  tabsEl
    .querySelectorAll(".tab")
    .forEach((t) => t.addEventListener("click", onTabClick));
  q.addEventListener("input", renderTableDebounced);

  document.getElementById("themeToggle").addEventListener("click", () => {
    const next = app.getAttribute("data-theme") === "light" ? "dark" : "light";
    app.setAttribute("data-theme", next);
  });

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "modalBackdrop") closeModal();
  });

  renderTable();
}

function onTabClick(e) {
  tabsEl.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  e.currentTarget.classList.add("active");
  activeLocation =
    e.currentTarget.dataset.location === "all"
      ? null
      : e.currentTarget.dataset.location;
  renderTable();
}

function matchesFilter(d) {
  const qv = q.value.trim().toLowerCase();
  if (activeLocation && d.location !== activeLocation) return false;
  if (qv && !d.name.toLowerCase().includes(qv)) return false;
  return true;
}

function renderTableDebounced() {
  clearTimeout(renderTable._t);
  renderTable._t = setTimeout(renderTable, 150);
}

function renderTable() {
  const filtered = doctors.filter(matchesFilter);
  resultCount.textContent = filtered.length;

  tableBody.innerHTML = filtered
    .map(
      (d) => `
        <tr>
          <td>${d.id}</td>
          <td class="doctor-name" data-id="${d.id}" data-action="details" style="cursor:pointer">${d.name}</td>
          <td>${d.location}</td>
          <td>${d.clinic}</td>
          <td>${d.specialty}</td>
          <td class="map_btn">
            <button class="btn primary" data-id="${d.id}" data-action="map">Direction</button>
          </td>   
        </tr>
      `
    )
    .join("");

  tableBody.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const doc = doctors.find((x) => x.id == e.target.dataset.id);
      if (e.target.dataset.action === "details") openModal(doc);
      else if (e.target.dataset.action === "map") {
        if (doc.mapLocation) window.open(doc.mapLocation, "_blank");
        else alert("Map location not available");
      }
    });
  });

  tableBody.querySelectorAll(".doctor-name[data-id]").forEach((cell) => {
    cell.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const doc = doctors.find((x) => x.id == id);
      openModal(doc);
    });
  });
}

// function openModal(d) {
//   document.getElementById("modalTitle").textContent = d.name;
//   document.getElementById(
//     "modalSub"
//   ).textContent = `${d.specialty} • ${d.clinic}`;
//   document.getElementById("modalBio").innerHTML = `
//         <strong>Doctor Code:</strong> ${d.code || "N/A"}<br>
//         <strong>Class:</strong> ${d.class || "N/A"}<br>
//         <strong>Qualification:</strong> ${d.qualification || "N/A"}<br>
//         <strong>Mobile:</strong> ${d.mobile || "N/A"}<br>
//         <strong>Address:</strong> ${d.location || "N/A"}<br>
//       `;
//   document.getElementById("mdContact").innerHTML = `
//         <strong>Map Location:</strong> ${
//           d.mapLocation
//             ? `<a href="${d.mapLocation}" target="_blank">View on map</a>`
//             : "N/A"
//         }
//       `;

//   const modal = document.getElementById("modalBackdrop");
//   modal.style.display = "flex";
//   setTimeout(() => (modal.style.opacity = "1"), 10);
// }

function openModal(d) {
  document.getElementById("modalTitle").textContent = d.name;
  document.getElementById("modalSub").textContent = `${d.specialty} • ${d.clinic}`;

  // Build table rows
  const tableHTML = `
    <table class="info-table">
      <tr>
        <th>Doctor Code:</th>
        <td>${d.code || "N/A"}</td>
      </tr>
      <tr>
        <th>Class:</th>
        <td>${d.class || "N/A"}</td>
      </tr>
      <tr>
        <th>Qualification:</th>
        <td>${d.qualification || "N/A"}</td>
      </tr>
      <tr>
        <th>Mobile:</th>
        <td>${d.mobile || "N/A"}</td>
      </tr>
      <tr>
        <th>Address:</th>
        <td>${d.location || "N/A"}</td>
      </tr>
    </table>
  `;

  document.getElementById("modalBio").innerHTML = tableHTML;

  // Map section stays separate
  document.getElementById("mdContact").innerHTML = `
    <strong>Map Location:</strong> ${
      d.mapLocation
        ? `<a href="${d.mapLocation}" target="_blank">View on map</a>`
        : "N/A"
    }
  `;

  // Show modal
  const modal = document.getElementById("modalBackdrop");
  modal.style.display = "flex";
  setTimeout(() => (modal.style.opacity = "1"), 10);
}


function closeModal() {
  const modal = document.getElementById("modalBackdrop");
  modal.style.opacity = "0";
  setTimeout(() => (modal.style.display = "none"), 240);
}

loadData();


