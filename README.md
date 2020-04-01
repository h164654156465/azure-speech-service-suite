# Demos suite for Azure Speech Service
Demos for Azure Speech Service using Express.js and Azure Speech SDK. You can take a quick look at this [demo website](https://speech-suite.azurewebsites.net)

## Install

First clone the project and install the project
```
git clone https://github.com/electron-react-boilerplate/electron-react-boilerplate.git  

cd <your-project-name>
npm install
```

## Development

Please provide your own environment variables in .env file, otherwise, you may not run this app properly.
If you don't have .env, you can create one in project root and add environment variables in it.
```
SPEECH_SERVICE_SUBSCRIPTION_KEY=<your-subscription-key>
SPEECH_SERVICE_SUBSCRIPTION_REGION=<your-subscription-region>
```

To develop the project with hot reload
```
npm run dev
```

To start the project
```
npm run start
```

## License

[Apache License 2.0](LICENSE)