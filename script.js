// =====================================================
// GLOBAL STATE
// =====================================================
let selectedRole = null;
let currentUser = null;
let users = JSON.parse(localStorage.getItem("users") || "{}");
let meetingRequests = JSON.parse(localStorage.getItem("meetingRequests") || "[]");
let groups = [];

// =====================================================
// PAGE CONTROL
// =====================================================
function hideAllPages() {
    document.querySelectorAll(".card").forEach(sec => sec.classList.add("page-hidden"));
}

function showPage(pageId) {
    hideAllPages();
    if (pageId === "meetings") renderMeetings();
    document.getElementById(pageId).classList.remove("page-hidden");
}

// =====================================================
// ROLE SELECTION
// =====================================================
document.getElementById("studentRole").addEventListener("click", () => chooseRole("Student"));
document.getElementById("professorRole").addEventListener("click", () => chooseRole("Professor"));

function chooseRole(role) {
    selectedRole = role;

    // Show selected role on header
    document.getElementById("currentRoleChip").style.display = "inline-block";
    document.getElementById("currentRoleChip").innerText = role;

    // Go directly to SIGNUP PAGE
    showSignup();
}

function backToRoleSelection() {
    selectedRole = null;
    document.getElementById("currentRoleChip").style.display = "none";
    showPage("rolePage");
}

// =====================================================
// AUTHENTICATION
// =====================================================
function createAccount(e) {
    e.preventDefault();

    const username = document.getElementById("newUser").value.trim();
    const pass = document.getElementById("newPass").value.trim();

    if (users[username]) {
        alert("Username already exists!");
        return;
    }

    users[username] = { password: pass, role: selectedRole };
    localStorage.setItem("users", JSON.stringify(users));
    currentUser = { username, role: selectedRole };
    goToHome();
}

function loginUser(e) {
    e.preventDefault();

    const username = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();

    if (!users[username] || users[username].password !== pass) {
        alert("Invalid username or password!");
        return;
    }
    goToHome();
}

function showSignup() {
    hideAllPages();
    document.getElementById("signupPage").classList.remove("page-hidden");
}

function showLogin() {
    hideAllPages();
    document.getElementById("loginPage").classList.remove("page-hidden");
}

function logout() {
    currentUser = null;
    selectedRole = null;
    hideAllPages();
    showPage("rolePage");
}

function goToHome() {
    hideAllPages();
    document.getElementById("home").classList.remove("page-hidden");
    document.getElementById("userChip").style.display = "inline-block";
    document.getElementById("userChip").innerText = currentUser.username;
}

// =====================================================
// GROUPS
// =====================================================
function openCreateGroup() {
    const name = prompt("Enter group name:");
    if (!name) return;

    groups.push({ name, members: 0, max: 10 });
    renderGroups();
}

function renderGroups() {
    let html = "";
    groups.forEach(g => {
        html += `
        <div class="group-item">
            <div>
                <strong>${g.name}</strong><br>
                <span class="tiny">${g.members}/${g.max} members</span>
            </div>
            <button class="btn-primary">Join</button>
        </div>`;
    });
    document.getElementById("groupList").innerHTML = html;
}

// =====================================================
// MEETINGS
// =====================================================
const professorsList = ["Prof. Reyes", "Prof. Santos", "Prof. Dela Cruz"];

function renderMeetings() {
    const container = document.getElementById("meetingContainer");
    container.innerHTML = "";

    if (selectedRole === "Student") {
        container.innerHTML = `
            <label>Select Professor:</label>
            <select id="selectProfessor">
                ${professorsList.map(p => `<option>${p}</option>`).join("")}
            </select>

            <label>Google Meet Link (optional):</label>
            <input type="text" id="meetLink" placeholder="https://meet.google.com/...">

            <button class="btn-primary" onclick="sendMeetingRequest()">Send Request</button>
        `;

        const past = meetingRequests.filter(r => r.studentName === currentUser.username);
        if (past.length > 0) {
            container.innerHTML += `<h3>Your Requests</h3>`;
            past.forEach(r => {
                container.innerHTML += `
                <div class="group-item">
                    <strong>Professor:</strong> ${r.professorName}<br>
                    <strong>Status:</strong> ${r.status}<br>
                    ${r.meetLink ? `<a href="${r.meetLink}" target="_blank">Join Meet</a>` : ""}
                </div>`;
            });
        }
    } else if (selectedRole === "Professor") {
        const myRequests = meetingRequests.filter(r => r.professorName === currentUser.username);
        if (myRequests.length === 0) {
            container.innerHTML = "<p>No meeting requests yet.</p>";
            return;
        }
        myRequests.forEach((r, i) => {
            container.innerHTML += `
            <div class="group-item">
                <strong>Student:</strong> ${r.studentName}<br>
                ${r.meetLink ? `<a href="${r.meetLink}" target="_blank">Meet Link</a>` : ""}<br>
                <strong>Status:</strong> ${r.status}<br>
                ${r.status === "pending" ? `
                    <button class="btn-primary" onclick="updateMeeting(${i}, 'accepted')">Accept</button>
                    <button class="btn-ghost" onclick="updateMeeting(${i}, 'declined')">Decline</button>
                ` : ""}
            </div>`;
        });
    }
}

function sendMeetingRequest() {
    const profName = document.getElementById("selectProfessor").value;
    const link = document.getElementById("meetLink").value.trim();

    meetingRequests.push({
        studentName: currentUser.username,
        professorName: profName,
        meetLink: link,
        status: "pending",
        timestamp: new Date().toISOString()
    });

    localStorage.setItem("meetingRequests", JSON.stringify(meetingRequests));
    renderMeetings();
}

function updateMeeting(index, status) {
    meetingRequests[index].status = status;
    localStorage.setItem("meetingRequests", JSON.stringify(meetingRequests));
    renderMeetings();
}
