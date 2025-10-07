# Better Chat Voice

This is a lightweight Chrome extension that adds a "Read with ElevenLabs" button to each ChatGPT response, allowing you to convert ChatGPT text to high-quality speech using ElevenLabs voices (custom or built-in).

## Features

- Button added inline with ChatGPT's native UI
- Uses ElevenLabs Text-to-Speech API
- Supports downloading the audio as `.mp3`
- Play, stop, and customize your voice
- Settings stored locally (API key, voice choice, and model)

## Requirements

- An [ElevenLabs](https://www.elevenlabs.io/) API key with voice access
- A paid ElevenLabs plan on Starter or higher (TTS API access not available on free tier. Current Price for Starter plan is $5/month.)
- Chrome or any Chromium-based browser with extension support. (Verified to work with Vivaldi)

## Setup (Github method)

1. Clone or download this repo
2. Go to `chrome://extensions` and enable **Developer Mode**
3. Click **Load unpacked** and select the project folder

## Usage 

1. Click the extension icon to enter your ElevenLabs API key and fetch voices.
2. Select you voice of choice and click Save.
3. Select your prefered model (recommended v3 for more expressive delivery and broader language support).
4. Visit [ChatGPT](https://chatgpt.com) and click the 🔊 button at the end of any assistant reply to hear it read alound in your selected voice.
5. Optionally - Click the save icon to download the last audio file played.

## Security

Your API key and voice ID are saved only in your local browser via `chrome.storage.local`. Nothing is transmitted anywhere except directly to ElevenLabs via their official API.

## Author

Glen Bland (Waypoint Labs)

## License

MIT — see `LICENSE` file for details.
