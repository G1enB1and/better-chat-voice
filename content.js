let currentAudio = null; // Now global within content script

function addTTSButton() {
  const assistantMessages = [...document.querySelectorAll('.prose, .markdown')];
  const lastMessage = assistantMessages.pop();
  if (!lastMessage) return;

  // Walk up to find the outer container with the action button bar
  let parent = lastMessage;
  let buttonBar = null;

  // Traverse up a few levels to find a valid button bar
  for (let i = 0; i < 6 && parent; i++) {
    buttonBar = parent.querySelector('div.flex.items-center.p-1.select-none');
    if (buttonBar) break;
    parent = parent.parentElement;
  }

  if (!buttonBar || buttonBar.querySelector('#tts-button')) return;

  // Create button
  const btn = document.createElement('button');
  btn.id = 'tts-button';
  btn.title = 'Read with ElevenLabs';
  btn.setAttribute('aria-label', 'Read with ElevenLabs');
  btn.setAttribute('aria-selected', 'false');
  btn.style.cssText = `
    margin-left: 6px;
    padding: 4px 8px;
    border: none;
    border-radius: 6px;
    background-color: #10a37f;
    color: white;
    font-weight: bold;
    font-size: 13px;
    cursor: pointer;
    pointer-events: auto;
  `;
  btn.innerText = '🔊';

  btn.onclick = () => {
    const text = lastMessage.innerText;
    btn.disabled = true;
    const originalText = btn.innerText;
    btn.innerText = '⏳';

    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    chrome.runtime.sendMessage({ action: 'tts', payload: text }, (response) => {
      if (response && response.audioBuffer) {
        const byteArray = new Uint8Array(response.audioBuffer);
        const blob = new Blob([byteArray], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);
        currentAudio = audio;
        audio.onended = () => {
          btn.disabled = false;
          btn.innerText = originalText;
          const stopBtn = buttonBar.querySelector('#tts-stop');
          if (stopBtn) stopBtn.remove();
          currentAudio = null;
        };

        audio.onerror = () => {
          btn.disabled = false;
          btn.innerText = originalText;
          const stopBtn = buttonBar.querySelector('#tts-stop');
          if (stopBtn) stopBtn.remove();
        };
        audio.play().then(() => {
          // Playback started — show Stop button
          const oldStop = buttonBar.querySelector('#tts-stop');
          if (oldStop) oldStop.remove();

          const stopBtn = document.createElement('button');
          stopBtn.id = 'tts-stop';
          stopBtn.title = 'Stop playback';
          stopBtn.innerText = '⏹️';
          stopBtn.style.cssText = `
            margin-left: 6px;
            font-size: 16px;
            background: none;
            border: none;
            cursor: pointer;
            color: #dc2626;
          `;

          stopBtn.onclick = () => {
            if (currentAudio) {
              currentAudio.pause();
              currentAudio.currentTime = 0;
              currentAudio = null;
            }
            stopBtn.remove(); // Hide stop button when stopped
            btn.disabled = false;
            btn.innerText = originalText;
          };

          buttonBar.appendChild(stopBtn);
        }).catch(err => {
          console.error("Playback error:", err);
          btn.disabled = false;
          btn.innerText = originalText;
        });

        const oldLink = buttonBar.querySelector('#tts-download');
        if (oldLink) oldLink.remove();

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'chatgpt-voice.mp3';
        downloadLink.id = 'tts-download';
        downloadLink.title = 'Download audio';
        downloadLink.innerText = '💾';
        downloadLink.style.cssText = `
          margin-left: 6px;
          font-size: 16px;
          text-decoration: none;
          color: #10a37f;
        `;

        buttonBar.appendChild(downloadLink);
      } else {
        console.error("TTS failed:", response?.error);
        btn.disabled = false;
        btn.innerText = originalText;
      }
    });
  };

  buttonBar.appendChild(btn);

}

const observer = new MutationObserver(addTTSButton);
observer.observe(document.body, { childList: true, subtree: true });

addTTSButton();
