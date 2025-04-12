
document.addEventListener('DOMContentLoaded', () => {
  const preview = document.getElementById('preview');
  const saved = localStorage.getItem('sym_theme_bg');
  if (saved) preview.src = saved;

  document.getElementById('uploadTheme').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = function (ev) {
        const gif = ev.target.result;
        localStorage.setItem('sym_theme_bg', gif);
        preview.src = gif;

        // Apply to page if open
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: (dataUrl) => {
              const gui = document.getElementById('sym-gui');
              if (gui) gui.style.backgroundImage = `url(${dataUrl})`;
            },
            args: [gif]
          });
        });
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('resetTheme').addEventListener('click', () => {
    localStorage.removeItem('sym_theme_bg');
    preview.src = '';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          const gui = document.getElementById('sym-gui');
          if (gui) gui.style.backgroundImage = "url('https://media.tenor.com/e_lH9sXosDgAAAAC/void-rain.gif')";
        }
      });
    });
  });
});
