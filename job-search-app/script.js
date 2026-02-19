const API_URL = "https://remotive.com/api/remote-jobs";

const jobsContainer = document.getElementById("jobsContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const jobCount = document.getElementById("jobCount");
const drawer = document.getElementById("drawer");
const drawerBody = document.getElementById("drawerBody");
const closeDrawer = document.getElementById("closeDrawer");
const themeToggle = document.getElementById("themeToggle");
const scrollTopBtn = document.getElementById("scrollTop");

let jobsData = [];
let savedJobs = JSON.parse(localStorage.getItem("saved")) || [];

// Debounce
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

async function fetchJobs(query="") {
  showSkeleton();
  try {
    const res = await fetch(`${API_URL}?search=${query}`);
    const data = await res.json();
    jobsData = data.jobs;
    renderJobs(jobsData);
  } catch (err) {
    jobsContainer.innerHTML = "<p>Error loading jobs.</p>";
  }
}

function renderJobs(jobs) {
  jobsContainer.innerHTML = "";
  jobCount.textContent = `${jobs.length} Jobs Found`;

  if (!jobs.length) {
    jobsContainer.innerHTML = "<p>No jobs found.</p>";
    return;
  }

  jobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card";

    card.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.company_name}</p>
      <span class="badge">${job.job_type}</span>
      <p>${job.candidate_required_location}</p>
      <button class="view-btn" data-id="${job.id}">View Details</button>
      <button onclick="window.open('${job.url}')">Apply</button>
      <button class="save-btn" data-id="${job.id}">${savedJobs.includes(job.id) ? "★" : "☆"}</button>
    `;

    jobsContainer.appendChild(card);
  });
}

function showSkeleton() {
  jobsContainer.innerHTML = "";
  for(let i=0;i<6;i++){
    jobsContainer.innerHTML += `<div class="job-card">Loading...</div>`;
  }
}

jobsContainer.addEventListener("click", e => {
  if (e.target.classList.contains("view-btn")) {
    const id = e.target.dataset.id;
    const job = jobsData.find(j => j.id == id);
    openDrawer(job);
  }

  if (e.target.classList.contains("save-btn")) {
    const id = parseInt(e.target.dataset.id);
    if (!savedJobs.includes(id)) savedJobs.push(id);
    else savedJobs = savedJobs.filter(j => j !== id);
    localStorage.setItem("saved", JSON.stringify(savedJobs));
    renderJobs(jobsData);
  }
});

function openDrawer(job) {
  drawer.classList.add("active");
  drawerBody.innerHTML = `
    <h2>${job.title}</h2>
    <p><strong>${job.company_name}</strong></p>
    <div>${job.description}</div>
    <a href="${job.url}" target="_blank">Apply Now</a>
  `;
}

closeDrawer.onclick = () => drawer.classList.remove("active");

searchBtn.addEventListener("click", () => fetchJobs(searchInput.value));
searchInput.addEventListener("input", debounce(() => fetchJobs(searchInput.value), 500));

themeToggle.onclick = () => document.body.classList.toggle("dark");

window.addEventListener("scroll", () => {
  scrollTopBtn.style.display = window.scrollY > 300 ? "block" : "none";
});

scrollTopBtn.onclick = () => window.scrollTo({top:0, behavior:"smooth"});

fetchJobs();
