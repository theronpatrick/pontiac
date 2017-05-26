import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Camera from "react-native-camera"

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.camera = null;

    this.state = {
      camera: {
        aspect: Camera.constants.Aspect.fill,
        captureTarget: Camera.constants.CaptureTarget.cameraRoll,
        captureMode: Camera.constants.CaptureMode.video,
        type: Camera.constants.Type.back,
        orientation: Camera.constants.Orientation.auto,
        flashMode: Camera.constants.FlashMode.auto,
      },
      isRecording: false
    };
  }

  takePicture = () => {
    const options = {};
    //options.location = ...
    this.camera.capture({metadata: options})
      .then((data) => console.log(data))
      .catch(err => console.error(err));
  }

  startRecording = () => {
    if (this.camera) {
      this.camera.capture()
      .then((data) => console.log(data))
      .catch(err => console.error(err));

      this.setState({
        isRecording: true
      });
    }
  }

  stopRecording = () => {
    console.log("stop recording called");
    if (this.camera) {
      this.camera.stopCapture();
      this.setState({
        isRecording: false
      });
    }
  }

  switchType = () => {
    let newType;
    const { back, front } = Camera.constants.Type;

    if (this.state.camera.type === back) {
      newType = front;
    } else if (this.state.camera.type === front) {
      newType = back;
    }

    this.setState({
      camera: {
        ...this.state.camera,
        type: newType,
      },
    });
  }

  render() {

    let recordButton;
    if (!this.state.isRecording) {
      recordButton = <Button
        onPress={this.startRecording}
        title="Start Recording">
      </Button>
    } else {
      recordButton = <Button
        onPress={this.stopRecording}
        title="Stop Recording">
      </Button>
    }

    let typeButton;
    if (this.state.camera.type === Camera.constants.Type.back) {
      typeButton = <Button
        onPress={this.switchType}
        title="Switch Camera Mode (back)">
      </Button>
    } else {
      typeButton = <Button
        onPress={this.switchType}
        title="Switch Camera Mode (front)">
      </Button>
    }

    return (
      <View style={styles.container}>
        <Text>React Native is Fun!</Text>
        {recordButton}
        {typeButton}

        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={this.state.camera.aspect}
          captureTarget={this.state.camera.captureTarget}
          captureAudio={true}
          type={this.state.camera.type}
          captureMode={this.state.camera.captureMode}
          flashMode={this.state.camera.flashMode}
          mirrorImage={false}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: "50%",
    height: "50%"
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  }
});
