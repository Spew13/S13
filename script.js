const BIN_ID = "6969490cae596e708fdef304"; // Your ID
const API_KEY = "$2a$10$SjcbvSnjiyFfuDwOzew2b.CtowaaptWCm38KZikWrQJRgyCp3owqS";
const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

let state = { servers: [], users: [] };
let currentUser = null;
let activeServerIndex = 0;

// 1. Fetch Data
async function syncData() {
    const res = await fetch(URL, {
        headers: { "X-Master-Key": API_KEY }
    });
    const data = await res.json();
    state = data.record;
    render();
}

// 2. Update Data
async function saveState() {
    await fetch(URL, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "X-Master-Key": API_KEY
        },
        body: JSON.stringify(state)
    });
}

function login() {
    const name = document.getElementById('username-input').value;
    const pfp = document.getElementById('pfp-input').value || "https://via.placeholder.com/50";
    if(!name) return alert("Enter a name");
    
    currentUser = { name, pfp, id: Date.now() };
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-interface').classList.remove('hidden');
    document.getElementById('my-name').innerText = name;
    document.getElementById('my-pfp').src = pfp;
    
    syncData();
    setInterval(syncData, 3000); // Polling for "Real-time"
}

function render() {
    const serverList = document.getElementById('server-list');
    const msgArea = document.getElementById('messages');
    
    // Render Servers
    serverList.innerHTML = `<div class="server-icon plus" onclick="addServer()">+</div>`;
    state.servers.forEach((s, i) => {
        const div = document.createElement('div');
        div.className = `server-icon ${activeServerIndex === i ? 'active' : ''}`;
        div.style.background = `url(${s.icon}) center/cover`;
        div.onclick = () => { activeServerIndex = i; render(); };
        serverList.prepend(div);
    });

    // Render Messages for Active Server
    const activeServer = state.servers[activeServerIndex];
    if (activeServer) {
        document.getElementById('current-server-name').innerText = activeServer.name;
        msgArea.innerHTML = activeServer.messages.map(m => `
            <div class="msg">
                <img src="${m.pfp}" style="width:30px; border-radius:50%">
                <b>${m.user}</b>: ${m.text}
            </div>
        `).join('');
    }
}

// Send Message
document.getElementById('chat-input').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const text = e.target.value;
        state.servers[activeServerIndex].messages.push({
            user: currentUser.name,
            pfp: currentUser.pfp,
            text: text
        });
        e.target.value = '';
        render();
        await saveState();
    }
});

async function addServer() {
    const name = prompt("Server Name?");
    if(!name) return;
    state.servers.push({
        name: name,
        icon: "https://via.placeholder.com/50/32FF00/000000?text=" + name[0],
        messages: []
    });
    await saveState();
    render();
}
