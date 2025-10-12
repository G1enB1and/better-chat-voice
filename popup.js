document.addEventListener('DOMContentLoaded', () => {
  // Simple in-popup router
  const views = {
    home: document.getElementById('view-home'),
    eleven: document.getElementById('view-elevenlabs'),
    azure: document.getElementById('view-azure'),
    gemini: document.getElementById('view-gemini'),
  };
  const status = document.getElementById('statusMsg');

  function show(viewKey) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[viewKey]?.classList.add('active');
    status.textContent = '';
    if (viewKey === 'eleven') ensureElevenInitialized();
  }

  // Navigation buttons
  document.getElementById('go-elevenlabs')?.addEventListener('click', () => show('eleven'));
  document.getElementById('go-azure')?.addEventListener('click', () => show('azure'));
  document.getElementById('go-gemini')?.addEventListener('click', () => show('gemini'));
  document.getElementById('back-home')?.addEventListener('click', () => show('home'));
  // Generic back buttons on placeholders
  document.querySelectorAll('.nav-back').forEach(btn => btn.addEventListener('click', () => show('home')));

  // ===== ElevenLabs settings wiring (lazy) =====
  let elevenInitialized = false;

  function ensureElevenInitialized() {
    if (elevenInitialized) return;

    const apiKeyInput   = document.getElementById('apiKey');
    const voiceSelect   = document.getElementById('voiceSelect');
    const modelSelect   = document.getElementById('modelSelect');
    const saveBtn       = document.getElementById('save');
    const fetchVoicesBtn= document.getElementById('fetchVoices');

    // Load saved settings
    chrome.storage.local.get(['apiKey', 'voiceId', 'modelId'], (data) => {
      if (data.apiKey) apiKeyInput.value = data.apiKey;
      modelSelect.value = data.modelId || 'eleven_v3';

      // If we already have an API key, fetch voices now
      if (data.apiKey) {
        fetchVoices(data.apiKey).then(() => {
          if (data.voiceId) {
            const match = [...voiceSelect.options].find(opt => opt.value === data.voiceId);
            if (match) voiceSelect.value = data.voiceId;
          }
        }).catch(err => {
          status.textContent = 'Failed to fetch voices on load: ' + err.message;
        });
      }
    });

    // Save settings
    saveBtn.addEventListener('click', () => {
      const apiKey  = apiKeyInput.value?.trim();
      const voiceId = voiceSelect.value;
      const modelId = modelSelect.value || 'eleven_v3';

      if (!apiKey || !voiceId) {
        status.textContent = 'Please enter an API key and select a voice.';
        return;
      }

      chrome.storage.local.set({ apiKey, voiceId, modelId }, () => {
        status.textContent = 'Settings saved!';
      });
    });

    // Fetch voices
    fetchVoicesBtn.addEventListener('click', () => {
      const key = apiKeyInput.value?.trim();
      if (!key) { status.textContent = 'Enter API key first.'; return; }

      fetchVoices(key).catch(err => {
        status.textContent = 'Error fetching voices: ' + err.message;
      });
    });

    elevenInitialized = true;
  }

  // Helper to fetch voices and fill the select
  async function fetchVoices(apiKey) {
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '<option value="">Loading…</option>';

    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`${res.status} ${txt}`);
    }
    const data = await res.json();

    voiceSelect.innerHTML = '<option value="">— choose a voice —</option>';
    (data.voices || []).forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voice_id;
      option.text = `${voice.name}`;
      voiceSelect.appendChild(option);
    });
  }

  // Default view
  show('home');
});
