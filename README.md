# Error Simplification

This is my final year project for my BEng Software Engineering degree. It's a Visual Studio Code extension, with the goal of improving the debugging process for novice programmers by providing simplified error explanations.

## Features

1. Simplifies error messages using Google's Generative AI

2. Provides relevant articles to the error encountered

## How to run

1. Open the project inside Visual Studio Code

2. Install required dependencies
   `npm install`

3. Create a .env.production file inside the project folder and paste the following code:
   `REACT_APP_GEMINI_API_KEY=REPLACE_WITH_YOUR_API_KEY_HERE`

> You can get your API key for free here: https://ai.google.dev/gemini-api/docs/api-key

4. Build the extension
   `npm run build`

5. Launch the extension
   Press `F5` or go to `Run > Start Debugging`

## How to use

1. Once launched the extension can be opened either by navigating to the status bar (bottom right) and pressing on `Launch Error Visualiser`. Alternatively you can press `Ctrl+Shift+p` or `Cmd+Shift+p` if on MacOS, and enter `>errorView`

2. Copy the path to the Python file you would like to load

3. Press the upload file button

4. Press on the Python file which has appeared in the nav bar

5. Press Simplify Error button

6. Press Get Articles button

## Limitations

1. Requires an active internet connection for AI-based features.

## Data Privacy

This extension utilises Google's Generative AI to analyse error message and provide the simplified version and articles. As such sensitive data should not be shared/uploaded to the extension. Ensuring sensitive data is not input in the extension is the responsibility of the user.

**Enjoy!**
