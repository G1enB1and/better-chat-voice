chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'tts') {
    chrome.storage.local.get(['apiKey', 'voiceId', 'modelId'], ({ apiKey, voiceId, modelId }) => {
      if (!apiKey || !voiceId) {
        console.warn('API key or voice ID missing.');
        sendResponse({ error: 'Missing API key or voice ID' });
        return;
      }

      const chosenModel = modelId || 'eleven_v3'; // default to v3

      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: message.payload,
          model_id: chosenModel
        })
      })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          console.error("TTS fetch failed:", res.status, errorText);
          sendResponse({ error: `TTS failed: ${res.status} ${errorText}` });
          return;
        }

        const blob = await res.blob();
        const buffer = await blob.arrayBuffer();
        sendResponse({ audioBuffer: Array.from(new Uint8Array(buffer)) });
      })
      .catch(err => {
        console.error("TTS fetch error:", err);
        sendResponse({ error: err.toString() });
      });
    });

    return true; // keep the message channel alive for async
  }
});
