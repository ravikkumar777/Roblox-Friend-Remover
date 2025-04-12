
// === sym_friend_remover Final UI with Theme + Drag + Zenith Delete + Settings ===

// Create GUI
const gui = document.createElement('div');
gui.id = 'sym-gui';
gui.style.position = 'fixed';
gui.style.top = '20px';
gui.style.left = '20px';
gui.style.width = '140px';
gui.style.height = '140px';
gui.style.borderRadius = '20px';
gui.style.backgroundImage = `url(${localStorage.getItem('sym_theme_bg') || chrome.runtime.getURL('background.gif')})`;
gui.style.backgroundSize = 'cover';
gui.style.display = 'flex';
gui.style.flexDirection = 'column';
gui.style.alignItems = 'center';
gui.style.justifyContent = 'center';
gui.style.zIndex = '99999';
gui.style.transition = 'all 0.5s ease';
gui.style.cursor = 'move';

gui.style.transition = "left 0.2s ease, top 0.2s ease";


gui.innerHTML = `
  <div style="color:white;font-size:16px;" id="sym-count-label">Selected 0</div>
  <button id="delete-btn" style="margin-top:8px;padding:4px 10px;border:none;border-radius:12px;background:rgba(255,255,255,0.1);backdrop-filter:blur(4px);font-weight:bold;cursor:pointer;background-image: linear-gradient(90deg, white, #999);-webkit-background-clip: text;-webkit-text-fill-color: transparent;text-shadow: none;transition:transform 0.3s ease, box-shadow 0.2s ease;animation: waveText 2s infinite alternate;">Delete</button>
  <button id="settings-btn" style="margin-top:6px;padding:2px 6px;font-size:12px;border:none;border-radius:6px;background:#111;color:white;cursor:pointer;">⚙️</button>
`;
document.body.appendChild(gui);

// Create Settings panel
const settingsPanel = document.createElement('div');
settingsPanel.id = 'sym-settings-panel';
settingsPanel.style.position = 'absolute';
settingsPanel.style.top = '150px';
settingsPanel.style.left = '0px';
settingsPanel.style.width = '250px';
settingsPanel.style.padding = '16px';
settingsPanel.style.borderRadius = '12px';
settingsPanel.style.background = '#111';
settingsPanel.style.color = 'white';
settingsPanel.style.zIndex = '999999';
settingsPanel.style.display = 'none';
settingsPanel.style.flexDirection = 'column';
settingsPanel.style.boxShadow = '0 0 10px rgba(0,0,0,0.4)';
settingsPanel.style.gap = '10px';
settingsPanel.innerHTML = `
  <label style="font-size:14px;">Upload Theme (.gif)</label>
  <input type="file" id="gifThemeUpload" accept="image/gif" style="color:white;" />
  <button id="resetThemeBtn" style="background:#400;border:none;color:white;padding:6px;border-radius:8px;">Reset to Default</button>
`;
gui.appendChild(settingsPanel);

// Events
document.getElementById('settings-btn').onclick = () => {
  settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'flex' : 'none';
};
settingsPanel.querySelector('#gifThemeUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type === 'image/gif') {
    const reader = new FileReader();
    reader.onload = function (ev) {
      const newBg = ev.target.result;
      gui.style.backgroundImage = `url(${newBg})`;
      localStorage.setItem('sym_theme_bg', newBg);
    };
    reader.readAsDataURL(file);
  }
});
settingsPanel.querySelector('#resetThemeBtn').addEventListener('click', () => {
  const defaultGif = chrome.runtime.getURL('background.gif');
  gui.style.backgroundImage = `url(${defaultGif})`;
  localStorage.removeItem('sym_theme_bg');
});

// Zenith-style button
const deleteBtn = document.getElementById('delete-btn');
if (deleteBtn) {
  deleteBtn.onmousedown = () => {
    deleteBtn.style.transform = 'translateY(-3px)';
    deleteBtn.style.boxShadow = '0 3px 8px rgba(0,0,0,0.2)';
  };
  deleteBtn.onmouseup = deleteBtn.onmouseleave = () => {
    deleteBtn.style.transform = 'translateY(0)';
    deleteBtn.style.boxShadow = '0 0 0 transparent';
  };
}

// Dragging
let isDragging = false, offsetX = 0, offsetY = 0;
gui.addEventListener('mousedown', (e) => {
  if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.closest('#sym-settings-panel')) return;
  isDragging = true;
  offsetX = e.clientX - gui.getBoundingClientRect().left;
  offsetY = e.clientY - gui.getBoundingClientRect().top;
});
document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    gui.style.left = `${e.clientX - offsetX}px`;
    gui.style.top = `${e.clientY - offsetY}px`;
  }
});
document.addEventListener('mouseup', () => isDragging = false);



let csrfToken = null;
let selectedUserIds = JSON.parse(localStorage.getItem("nebula_selected_users") || "[]");

async function getCSRFToken() {
  const res = await fetch("https://friends.roblox.com/v1/users/1/unfriend", {
    method: "POST",
    credentials: "include"
  });
  csrfToken = res.headers.get("x-csrf-token");
}

function playSound(url) {
  const audio = new Audio(url);
  audio.volume = 0.6;
  audio.play();
}

function autoInjectFriends() {
  const cards = document.querySelectorAll(".avatar-card");
  if (cards.length > 0 && !document.querySelector(".nebula-checkbox")) {
    injectCheckboxes(cards);
  }
}

function getUserIdFromCard(card) {
  const idMatch = card.getAttribute("id") || "";
  if (/^\d+$/.test(idMatch)) return idMatch;
  const possible = card.querySelector("a[href*='/users/']");
  if (possible) {
    const match = possible.href.match(/\/users\/(\d+)/);
    if (match) return match[1];
  }
  return null;
}

function injectCheckboxes(cards) {
  if (!document.getElementById("sym-count-label")) {
  const countLabel = document.createElement("div");
  countLabel.id = "sym-count-label";
  countLabel.style.color = "white";
  countLabel.style.marginTop = "10px";
  countLabel.innerText = `Selected ${selectedUserIds.length}`;
  document.getElementById("sym-gui").prepend(countLabel);
}

  cards.forEach(card => {
    if (card.querySelector(".nebula-checkbox")) return;
    const userId = getUserIdFromCard(card);
    const checkbox = document.createElement("div");
    checkbox.className = "nebula-checkbox";
    checkbox.style.cssText = "position: absolute; top: 10px; left: 10px; width: 24px; height: 24px; border: 2px solid white; border-radius: 5px; background-color: transparent; color: white; font-size: 16px; text-align: center; line-height: 22px; font-weight: bold; cursor: pointer; z-index: 10000;";
    checkbox.textContent = selectedUserIds.includes(userId) ? "✓" : "";
    if (selectedUserIds.includes(userId)) {
      card.style.outline = "2px solid lime";
    }

    checkbox.onclick = (e) => {
      e.stopPropagation();
      if (selectedUserIds.includes(userId)) {
        selectedUserIds = selectedUserIds.filter(id => id !== userId);
        checkbox.textContent = "";
        card.style.outline = "";
      } else {
        selectedUserIds.push(userId);
        checkbox.textContent = "✓";
        card.style.outline = "2px solid lime";
        playSound("https://cdn.pixabay.com/download/audio/2022/03/16/audio_70b3f5b60d.mp3?filename=select-112897.mp3");
      }
      localStorage.setItem("nebula_selected_users", JSON.stringify(selectedUserIds));
      document.getElementById("sym-count-label").innerText = `Selected ${selectedUserIds.length}`;
    };

    card.style.position = "relative";
    card.appendChild(checkbox);
  });
}

// Hook delete button
const hookDeleteButton = () => {
  const delBtn = document.getElementById("delete-btn");
  if (delBtn) {
    delBtn.onclick = async () => {
      if (!confirm("هل أنت متأكد أنك تريد حذف الأصدقاء المحددين؟")) return;
      if (!csrfToken) await getCSRFToken();
      for (const userId of selectedUserIds) {
        await fetch(`https://friends.roblox.com/v1/users/${userId}/unfriend`, {
          method: "POST",
          credentials: "include",
          headers: { "x-csrf-token": csrfToken }
        });
        playSound("https://cdn.pixabay.com/download/audio/2022/03/15/audio_8d27587046.mp3?filename=click-124467.mp3");
        await new Promise(r => setTimeout(r, 500));
      }
      alert("تم الحذف ✅");
      localStorage.removeItem("nebula_selected_users");
      location.reload();
    };
  }
};

// Trigger it all
setInterval(() => {
  autoInjectFriends();
  hookDeleteButton();
}, 1000);





const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes waveText {
  0% { transform: translateY(0); background-position: 0% 50%; }
  50% { transform: translateY(-2px); background-position: 50% 50%; }
  100% { transform: translateY(0); background-position: 100% 50%; }
}
`;
document.head.appendChild(styleSheet);
