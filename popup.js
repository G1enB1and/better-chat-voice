document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const voiceSelect = document.getElementById('voiceSelect');
  const saveBtn = document.getElementById('save');
  const fetchVoicesBtn = document.getElementById('fetchVoices');

  // Load saved settings
  chrome.storage.local.get(['apiKey', 'voiceId'], (data) => {
    if (data.apiKey) apiKeyInput.value = data.apiKey;

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

    if (!apiKey || !voiceId) {
      alert("Please enter an API key and select a voice before saving.");
      return;
    }

    chrome.storage.local.set({ apiKey, voiceId }, () => {
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
