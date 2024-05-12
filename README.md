# A SmartApp for the Samsung SmartThings Starter Kit.

This example SmartApp demonstrates the use of SmartThings APIs via the [SmartApp NodeJS SDK](https://github.com/SmartThingsCommunity/smartapp-sdk-nodejs) to achieve an Automation.

It showcases:

- App installation and configuration flow.
- Creating schedules and handling scheduled executions.
- You can test the operation of the sensors in the SmartThings Start Kit.
- If you have any camera devices, you can configure the Camera Image by [Frontent Project Repository](https://github.com/rktdnjs/starter-kit-smartapp-react)

## Setup instructions

### Prerequisites

- A [Samsung account](https://account.samsung.com/membership/index.do) and the SmartThings mobile application.
- A [Developer Workspace](https://smartthings.developer.samsung.com/workspace/) account.
- [SmartThings Startter kit](https://www.samsung.com/sec/smartthings/HOMEKITA/HOMEKITA/) devices

#### If testing locally (using provided webserver)

- [Node.js](https://nodejs.org) and [npm](https://npmjs.com) installed (verified with npm version 6.14.8 and Node 12.19.0).
- [ngrok](https://ngrok.com/) installed to create a secure tunnel and create a globally available URL for fast testing.

### Start

This smartapp is a simple web server that can be used to run and test locally.

Clone or download this repository and follow the desired option.

#### Local

1. Install the dependencies for this app: `npm install`.

1. Start the server: `npm start`.

1. Start ngrok (in another terminal window/tab): `ngrok http 3005`. Copy the `https:` URL to your clipboard.

### Register

Follow the instructions for [registering a SmartApp](https://docs.google.com/presentation/d/1A7vduAePg_zAAWlXaRQwHT6CEzzyDpBzG__ELtzUxB0/edit#slide=id.g261dcf3c506_0_166) with the SmartThings platform.

- The following OAuth2 scopes are required.
  - `r:devices:*`
  - `x:devices:*`

### Result

After you finished registering the SmartApp, You can see that an event occurs every time the device operates.

If you have a camera, you can check the picture in the project if you register the device and follow the [Frontend Project Repository](https://github.com/rktdnjs/starter-kit-smartapp-react) to run an additional project.

## Documentation

- Documentation for developing SmartApps can be found on the [SmartThings developer portal](https://developer.smartthings.com/docs/).
- [SmartThings API reference documentation](https://developer.smartthings.com/docs/api/public)
