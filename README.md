# freeprompt 🚀

A hassle-free setup to test LLM API for free

## Why Gemini AI? 🤖
Because compared to other LLMs in the market, it still provides API access without any payment method setup. There are naturally limitations, but if you want to start testing GenAI API integration, this is a possible method.

The implementation is totally TypeScript-based. To have secure access to the API, a  [BFF]((https://en.wikipedia.org/wiki/Frontend_and_backend#Software_definitions) adopting Netlify serverless functions is used.
Why Netlify and their serverless functions? Because again, they are free and easy to set up.

## Requirements 📋

- [Volta](https://volta.sh/)
- A Google Account
- Google API Key for Gemini AI (https://ai.google.dev/ and https://aistudio.google.com/apikey)
- Netlify Account (https://app.netlify.com/)
- Netlify CLI (https://docs.netlify.com/cli/get-started/)

## Setup 🛠️

1. Install dependencies:
    ```sh
    yarn
    ```

2. Create a new website on Netlify:
    ```sh
    netlify init
    ```
    Connect to the above-created website.

## Running Locally 🏠

To run the webapp locally (but without the serverless functions):
```sh
yarn dev
```

To run the webapp without the serverless functions enabled (this starts netlify locally)
```sh
yarn start
```


## Deploying to Production 🚀

To deploy a production build to Netlify Website:
```sh
yarn deploy
```

