// CampusConnect
const STORAGE_EVENTS = "campusConnectEvents_v1";
const STORAGE_REGISTRATIONS = "campusConnectRegistrations_v1";

const starterEvents = [
  {id:"e101",title:"Design Your First App",category:"Workshop",date:futureDate(4),time:"10:30",venue:"Innovation Lab, Block 12",capacity:40,eligibility:"All students",description:"Explore UI ideas, sketch your first screens, and learn how designers turn problems into useful digital experiences.",symbol:"✳"},
  {id:"e102",title:"Campus Beats Fest",category:"Fest",date:futureDate(8),time:"17:00",venue:"Open Air Theatre",capacity:120,eligibility:"All students",description:"An evening of student performances, music, food stalls, and the kind of campus energy you don't want to miss.",symbol:"♫"},
  {id:"e103",title:"AI: Beyond the Buzzwords",category:"Seminar",date:futureDate(6),time:"14:00",venue:"Main Auditorium",capacity:80,eligibility:"All students",description:"A friendly introduction to modern AI, practical applications, responsible use, and the skills worth exploring next.",symbol:"✧"},
  {id:"e104",title:"CodeSprint Challenge",category:"Competition",date:futureDate(11),time:"09:00",venue:"Computer Lab 3",capacity:60,eligibility:"All years · teams of 1–3",description:"Solve logic puzzles, collaborate with peers, and put your programming fundamentals to the test in a fun challenge.",symbol:"⌘"},
  {id:"e105",title:"Green Campus Day",category:"Community",date:futureDate(13),time:"08:30",venue:"Central Lawn",capacity:50,eligibility:"All students",description:"Join a campus clean-up, learn simple sustainability habits, and help make shared spaces greener and more welcoming.",symbol:"❋"},
  {id:"e106",title:"Cloud Starter Lab",category:"Workshop",date:futureDate(16),time:"11:00",venue:"Digital Learning Hub",capacity:35,eligibility:"Beginners welcome",description:"Understand cloud computing concepts and walk through a beginner-friendly cloud architecture activity.",symbol:"☁"}
];

function futureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}
let events = readStorage(STORAGE_EVENTS, null);
if (!Array.isArray(events)) {
  events = starterEvents;
  saveEvents();
}
let registrations = readStorage(STORAGE_REGISTRATIONS, []);
if (!Array.isArray(registrations)) registrations = [];

function saveEvents() { localStorage.setItem(STORAGE_EVENTS, JSON.stringify(events)); }
function saveRegistrations() { localStorage.setItem(STORAGE_REGISTRATIONS, JSON.stringify(registrations)); }
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return date.toLocaleDateString("en-IN", {day:"numeric",month:"short",year:"numeric"});
}
function formatTime(timeString) {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-IN", {hour:"numeric",minute:"2-digit"});
}
function eventRegistrations(eventId) {
  return registrations.filter(item => item.eventId === eventId);
}
function seatsLeft(event) {
  return Math.max(0, Number(event.capacity) - eventRegistrations(event.id).length);
}
function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2800);
}
function renderStats() {
  const upcoming = events.filter(event => event.date >= futureDate(0));
  document.getElementById("statEvents").textContent = upcoming.length;
  document.getElementById("statSeats").textContent = upcoming.reduce((sum,event) => sum + seatsLeft(event),0);
  document.getElementById("statRegistered").textContent = registrations.length;
}
function renderEvents() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const filtered = events.filter(event => event.date >= futureDate(0))
    .filter(event => category === "all" || event.category === category)
    .filter(event => `${event.title} ${event.description} ${event.venue} ${event.category}`.toLowerCase().includes(search))
    .sort((a,b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  const grid = document.getElementById("eventGrid");
  document.getElementById("emptyState").classList.toggle("hidden", filtered.length > 0);
  grid.innerHTML = filtered.map(event => {
    const left = seatsLeft(event);
    const alreadyRegistered = registrations.some(r => r.eventId === event.id && r.email.toLowerCase() === (r.email || "").toLowerCase());
    const colorClass = `cover-${event.category.toLowerCase()}`;
    return `<article class="event-card">
      <div class="event-cover ${colorClass}"><span class="category-pill">${escapeHTML(event.category)}</span><span class="cover-symbol">${escapeHTML(event.symbol || "✦")}</span></div>
      <div class="event-body">
        <div class="event-date">${escapeHTML(formatDate(event.date))} · ${escapeHTML(formatTime(event.time))}</div>
        <h3>${escapeHTML(event.title)}</h3><p class="event-description">${escapeHTML(event.description)}</p>
        <div class="event-meta"><span>⌖ ${escapeHTML(event.venue)}</span><span>◎ Eligibility: ${escapeHTML(event.eligibility)}</span></div>
        <div class="event-actions"><span class="seats-left">${left} / ${Number(event.capacity)} seats left</span>
        <button class="button ${left ? "button-dark" : "button-outline"}" data-register="${escapeHTML(event.id)}" ${left ? "" : "disabled"}>${left ? "Register ↗" : "Fully booked"}</button></div>
      </div></article>`;
  }).join("");
}
function renderRegistrations() {
  const list = document.getElementById("registrationList");
  if (!registrations.length) {
    list.innerHTML = `<div class="empty-registration">You haven't registered for an event yet. Explore the events above to save your first spot.</div>`;
    return;
  }
  list.innerHTML = registrations.slice().sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(reg => {
    const event = events.find(item => item.id === reg.eventId);
    if (!event) return "";
    return `<article class="registration-item"><div><h3>${escapeHTML(event.title)}</h3><p>${escapeHTML(formatDate(event.date))} · ${escapeHTML(formatTime(event.time))}</p><p>Confirmation ID: <b>${escapeHTML(reg.confirmationId)}</b></p><p>Registered as ${escapeHTML(reg.name)}</p></div>
    <div class="registration-actions"><button class="button button-primary" data-slip="${escapeHTML(reg.id)}">Confirmation slip ↗</button><button class="button button-outline" data-cancel="${escapeHTML(reg.id)}">Cancel</button></div></article>`;
  }).join("");
}
function refreshUI() { renderStats(); renderEvents(); renderRegistrations(); }

function openRegistration(eventId) {
  const event = events.find(item => item.id === eventId);
  if (!event) return;
  if (seatsLeft(event) <= 0) { toast("Sorry, this event is fully booked."); return; }
  document.getElementById("registrationEventId").value = eventId;
  document.getElementById("registrationEventName").textContent = `${event.title} · ${formatDate(event.date)} at ${formatTime(event.time)}`;
  document.getElementById("registrationError").textContent = "";
  document.getElementById("registrationForm").reset();
  document.getElementById("registrationEventId").value = eventId;
  document.getElementById("registrationEventName").textContent = `${event.title} · ${formatDate(event.date)} at ${formatTime(event.time)}`;
  document.getElementById("registrationDialog").showModal();
}
document.getElementById("eventGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-register]");
  if (button) openRegistration(button.dataset.register);
});
document.getElementById("registrationForm").addEventListener("submit", event => {
  event.preventDefault();
  const eventId = document.getElementById("registrationEventId").value;
  const selectedEvent = events.find(item => item.id === eventId);
  const name = document.getElementById("studentName").value.trim();
  const regNo = document.getElementById("studentRegNo").value.trim();
  const email = document.getElementById("studentEmail").value.trim().toLowerCase();
  const error = document.getElementById("registrationError");
  if (!selectedEvent) { error.textContent = "This event could not be found. Refresh and try again."; return; }
  // Recheck capacity immediately before saving. A browser-only demo cannot coordinate separate devices.
  if (seatsLeft(selectedEvent) <= 0) { error.textContent = "This event just became full. Please choose another event."; refreshUI(); return; }
  const duplicate = registrations.some(r => r.eventId === eventId && (r.email.toLowerCase() === email || r.regNo.toLowerCase() === regNo.toLowerCase()));
  if (duplicate) { error.textContent = "This email or registration number is already registered for this event."; return; }
  const confirmationId = `CC-${Date.now().toString().slice(-7)}`;
  registrations.push({id:`r${Date.now()}`,eventId,name,regNo,email,confirmationId,createdAt:new Date().toISOString()});
  saveRegistrations();
  document.getElementById("registrationDialog").close();
  refreshUI();
  toast(`Registration confirmed! Your ID is ${confirmationId}`);
  document.getElementById("my-registrations").scrollIntoView({behavior:"smooth"});
});
document.getElementById("registrationList").addEventListener("click", event => {
  const slipButton = event.target.closest("[data-slip]");
  const cancelButton = event.target.closest("[data-cancel]");
  if (slipButton) {
    const reg = registrations.find(item => item.id === slipButton.dataset.slip);
    const ev = reg && events.find(item => item.id === reg.eventId);
    if (reg && ev) printConfirmation(reg, ev);
  }
  if (cancelButton) {
    const reg = registrations.find(item => item.id === cancelButton.dataset.cancel);
    if (!reg) return;
    if (confirm("Cancel this event registration?")) {
      registrations = registrations.filter(item => item.id !== reg.id);
      saveRegistrations(); refreshUI(); toast("Registration cancelled.");
    }
  }
});
function printConfirmation(reg, ev) {
  const popup = window.open("", "_blank", "width=720,height=760");
  if (!popup) { toast("Allow pop-ups to print your confirmation slip."); return; }
  popup.document.write(`<!DOCTYPE html><html><head><title>Event Confirmation</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#20352a}main{max-width:560px;margin:auto;border:2px solid #d9e8d1;border-radius:18px;padding:30px}h1{margin-bottom:4px}small{color:#5d8052;letter-spacing:2px}hr{border:0;border-top:1px solid #ddd;margin:24px 0}.row{padding:10px 0;border-bottom:1px solid #eee}.label{color:#6c776f;font-size:12px}.value{font-weight:bold;margin-top:5px}button{margin-top:24px;padding:12px 18px;background:#b8ef75;border:0;border-radius:8px;font-weight:bold}@media print{button{display:none}}</style></head><body><main><small>CAMPUSCONNECT · EVENT CONFIRMATION</small><h1>You're on the list!</h1><p>Keep this confirmation for your records.</p><hr>
  <div class="row"><div class="label">Event</div><div class="value">${escapeHTML(ev.title)}</div></div>
  <div class="row"><div class="label">Date & time</div><div class="value">${escapeHTML(formatDate(ev.date))} · ${escapeHTML(formatTime(ev.time))}</div></div>
  <div class="row"><div class="label">Venue</div><div class="value">${escapeHTML(ev.venue)}</div></div>
  <div class="row"><div class="label">Student</div><div class="value">${escapeHTML(reg.name)} (${escapeHTML(reg.regNo)})</div></div>
  <div class="row"><div class="label">Confirmation ID</div><div class="value">${escapeHTML(reg.confirmationId)}</div></div>
  <button onclick="window.print()">Print / Save as PDF</button></main></body></html>`);
  popup.document.close();
}
document.getElementById("searchInput").addEventListener("input", renderEvents);
document.getElementById("categoryFilter").addEventListener("change", renderEvents);
document.getElementById("organizerBtn").addEventListener("click", () => {
  document.getElementById("eventError").textContent = "";
  document.getElementById("eventDate").min = futureDate(0);
  document.getElementById("organizerDialog").showModal();
});
document.getElementById("eventForm").addEventListener("submit", event => {
  event.preventDefault();
  const date = document.getElementById("eventDate").value;
  const capacity = Number(document.getElementById("eventCapacity").value);
  const error = document.getElementById("eventError");
  if (date < futureDate(0)) { error.textContent = "Choose today or a future date."; return; }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000) { error.textContent = "Seat limit must be between 1 and 10,000."; return; }
  events.push({
    id:`e${Date.now()}`,
    title:document.getElementById("eventTitle").value.trim(),
    category:document.getElementById("eventCategory").value,
    date,time:document.getElementById("eventTime").value,
    venue:document.getElementById("eventVenue").value.trim(),
    capacity,eligibility:document.getElementById("eventEligibility").value.trim(),
    description:document.getElementById("eventDescription").value.trim(),
    symbol:({"Workshop":"✳","Fest":"♫","Seminar":"✧","Competition":"⌘","Community":"❋"})[document.getElementById("eventCategory").value]
  });
  saveEvents();
  document.getElementById("eventForm").reset();
  document.getElementById("organizerDialog").close();
  refreshUI(); toast("Your event is published.");
  document.getElementById("events").scrollIntoView({behavior:"smooth"});
});
document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => document.getElementById(button.dataset.close).close());
});
refreshUI();
