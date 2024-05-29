const SmartApp = require("@smartthings/smartapp");
const express = require("express");
const server = express();
const cors = require("cors");
const { promisify } = require("util");
const { exec } = require("child_process");
const execPromise = promisify(exec);
const { default: axios } = require("axios");
const PORT = process.env.PORT || 3005;

server.use(express.json());
server.use(cors());

server.post("/", (req, res, next) => {
  smartapp.handleHttpCallback(req, res);
});

server.get("/api/image", (req, res) => {
  res.json(imageURLS);
});

server.get("/information", async (req, res) => {
  const devicesInfo = await getDevicesInformation();
  res.json(devicesInfo);
})


async function getDevicesInformation() {
  const command = "smartthings devices";
  try {
    const { stdout, stderr } = await execPromise(command);
    // stderr가 있는 경우에는 에러가 발생한 것이므로 에러를 출력하고 함수를 종료
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    // stdout을 사용해 필요한 작업 수행
    if (stdout) {
      const deviceData = JSON.parse(stdout); // stdout이 JSON 문자열이라고 가정
      // deviceData에서 필요한 정보 추출
      deviceInfos = deviceData.map((device) => {
        const { deviceId, name, label, locationId, components } = device;
        // 모든 컴포넌트의 capabilities를 하나의 배열로 결합
        const capabilities = components.flatMap((component) => component.capabilities.map((cap) => cap.id));
        return {
          deviceId,
          name,
          label,
          locationId,
          capabilities,
        };
      });

      // 변환된 deviceInfos 객체를 JSON 문자열로 변환하여 출력
      console.log(`deviceInfos : ${JSON.stringify(deviceInfos, null, 2)}`);

      // 해당 deviceInfos 객체를 다른 서버로 전달하는 코드 작성 필요
      return {deviceInfos};
    }
  } catch (error) {
    console.log(`exec error : ${error}`);
  }
}

async function sendEvent(eventInfo) {
  const url = "http://127.0.0.1:8080/api/device-event";
  console.log(eventInfo);

  try {
    const response = await axios.post(url, eventInfo, {
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
    });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}

server.listen(PORT, () =>
  console.log(`Server is up and running on port ${PORT}`)
);

const imageURLS = [];

async function handleContactSensor(context, eventData, eventTime) {
  console.log("handleContactSensor() is called.");
  if (eventData.value === "open") {
    context.api.devices.sendCommands(context.config.camera, "switch", "on");
  } else {
    context.api.devices.sendCommands(context.config.camera, "switch", "off");
  }
}

async function handleMotionSensor(context, eventData, eventTime) {
  console.log("handleMotionSensor() is called.");
}

async function handleButton(context, eventData, eventTime) {
  console.log("handleButton() is called...");
  // console.log(eventData);
  const response = await sendEvent(eventData);
  console.log(response);
  context.api.devices.sendCommands(context.config[response.deviceName], response.deviceCapabilityAttribute, response.deviceCapabilityCommand)
}

async function handleCameraImageCapture(context, eventData, eventTime) {
  // Contact Sensor Running - Camera Switch On - After CameraImage capture, you can get imageURL
  console.log("handleCameraImageCapture() is called...");
  console.log("Image URL : ", eventData.value);

  // Below is a code that can check the data obtained by processing the received imageURL in node.js as it is
  if (eventData.value) {
    const imageURL = eventData.value;
    imageURLS.push(imageURL);
    console.log(imageURLS);
  }
}

async function handleCameraSwitch(context, eventData, eventTime) {
  console.log("handleCameraSwitch() is called...");
  // Use take command of imageCapture capability when SmartThings camera is turned on by an action
  // After the image capture is completed, handleCameraImageCapture can be used to check the presence or absence of image capture
  // However, in order to check the image capture result, you must separately put the token in the URL and make a GET request
  if (eventData.value === "on") {
    context.api.devices.sendCommands(context.config.camera, [
      {
        capability: "image",
        command: "take",
        arguments: ["1", "2"],
      },
    ]);
  }
}

/* Define the SmartApp */
const smartapp = new SmartApp()
  .configureI18n()
  .enableEventLogging(2) // logs all lifecycle event requests/responses as pretty-printed JSON. Omit in production
  .page("mainPage", (context, page, configData) => {
    page.section("Starter kit", section => {
      // https://www.samsung.com/sec/smartthings/HOMEKITA/HOMEKITA/

      // (1) https://developer.smartthings.com/docs/devices/capabilities/capabilities-reference#contactSensor
      section
        .deviceSetting("contactSensor")
        .capabilities(["contactSensor"])
        .permissions("r")
        .required(false);

      // (2) https://developer.smartthings.com/docs/devices/capabilities/capabilities-reference#motionSensor
      section
        .deviceSetting("motionSensor")
        .capabilities(["motionSensor"])
        .permissions("r")
        .required(false);

      // (3) https://developer.smartthings.com/docs/devices/capabilities/capabilities-reference#button
      section
        .deviceSetting("smartButton")
        .capabilities(["button"])
        .permissions("r")
        .required(false);

      section
        .deviceSetting("camera")
        .capabilities(["imageCapture", "switch"])
        .permissions("rwx")
        .required(false);
    });
  })
  .updated(async (context, updateData) => {
    await context.api.subscriptions.delete();
    await context.api.subscriptions.subscribeToDevices(
      context.config.contactSensor,
      "contactSensor",
      "contact",
      "contactSensorHandler"
    );
    await context.api.subscriptions.subscribeToDevices(
      context.config.motionSensor,
      "motionSensor",
      "motion",
      "motionSensorHandler"
    );
    await context.api.subscriptions.subscribeToDevices(
      context.config.smartButton,
      "button",
      "button",
      "buttonHandler"
    );
    await context.api.subscriptions.subscribeToDevices(
      context.config.camera,
      "imageCapture",
      "image",
      "cameraImageCaptureHandler"
    );
    await context.api.subscriptions.subscribeToDevices(
      context.config.camera,
      "switch",
      "switch",
      "cameraSwitchHandler"
    );
  })
  .subscribedEventHandler("contactSensorHandler", handleContactSensor)
  .subscribedEventHandler("motionSensorHandler", handleMotionSensor)
  .subscribedEventHandler("buttonHandler", handleButton)
  .subscribedEventHandler("cameraImageCaptureHandler", handleCameraImageCapture)
  .subscribedEventHandler("cameraSwitchHandler", handleCameraSwitch);
