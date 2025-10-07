document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const voiceSelect = document.getElementById('voiceSelect');
  const modelSelect = document.getElementById('modelSelect');
  const saveBtn = document.getElementById('save');
  const fetchVoicesBtn = document.getElementById('fetchVoices');

  // Load saved settings
  chrome.storage.local.get(['apiKey', 'voiceId', 'modelId'], (data) => {
    if (data.apiKey) apiKeyInput.value = data.apiKey;

    // Default to v3 if nothing saved
    if (modelSelect) modelSelect.value = data.modelId || 'eleven_v3';

    if (data.apiKey) {
      fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': data.apiKey }
      })
      .then(res => res.json())
      .then(response => {
        voiceSelect.innerHTML = '';
        response.voices.forEach(voice => {
          const option = document.createElement('option');
          option.value = voice.voice_id;
          option.text = `${voice.name} (${voice.labels?.description || 'No description'})`;
          voiceSelect.appendChild(option);
        });

        if (data.voiceId) {
          const match = [...voiceSelect.options].find(opt => opt.value === data.voiceId);
          if (match) voiceSelect.value = data.voiceId;
        }
      })
      .catch(err => {
        alert('Failed to fetch voices on load: ' + err.message);
      });
    }
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;
    const voiceId = voiceSelect.value;
    const modelId = modelSelect.value || 'eleven_v3';

    if (!apiKey || !voiceId) {
      alert("Please enter an API key and select a voice before saving.");
      return;
    }

    chrome.storage.local.set({ apiKey, voiceId, modelId }, () => {
      document.getElementById('statusMsg').textContent = 'Settings saved!';
    });

  });

  // Fetch voices manually
  fetchVoicesBtn.addEventListener('click', () => {
    const apiKey = apiKeyInput.value;

    if (!apiKey) {
      alert("Enter API key first.");
      return;
    }

    fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    })
    .then(res => res.json())
    .then(data => {
      voiceSelect.innerHTML = '';
      data.voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.voice_id;
        option.text = `${voice.name} (${voice.labels?.description || 'No description'})`;
        voiceSelect.appendChild(option);
      });
    })
    .catch(err => alert('Error fetching voices: ' + err.message));
  });
});
