import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import BackgroundJob from "react-native-background-job";
import PushNotification from "react-native-push-notification";
import io from "socket.io-client";

const baseUrl = "http://10.0.2.2:8000/";
const socket = io(baseUrl, { query: { user_id: Date.now.toString() } });

let current_alert = "";
let next_alert = "";

socket.on("notify", value => {
  console.log("forground io....", value);
  next_alert = value;
});

const alertMessage = () => {
  PushNotification.configure({
    onNotification: function(notification) {
      console.log("NOTIFICATION: ", notification);
    },
    popInitialNotification: true
  });

  if (current_alert !== next_alert) {
    PushNotification.localNotification({
      bigText: next_alert,
      subText: "New message arrived",
      message: "Hello, this is the my test message."
    });
    current_alert = next_alert;
  }
};

const registerBackgroundJob = () => {
  const backgroundJob = {
    jobKey: "VerifySms",
    job: () => {
      alertMessage();
    }
  };

  BackgroundJob.register(backgroundJob);

  let backgroundSchedule = {
    jobKey: "VerifySms",
    period: 5000,
    exact: true,
    allowExecutionInForeground: true
  };

  BackgroundJob.schedule(backgroundSchedule)
    .then(() => console.log("Success: job registered."))
    .catch(err => console.err(err));
};

const cancelBackgroundJob = () => {
  BackgroundJob.cancel({ jobKey: "VerifySms" })
    .then(() => console.log("Success: job cancelled."))
    .catch(err => console.err(err));
};

registerBackgroundJob();

export default () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Push Notification Test</Text>
    </View>
  );
};
