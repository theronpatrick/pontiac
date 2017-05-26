import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Camera from "react-native-camera"

export default class App extends React.Component {

  constructor(props) {
    super(props);

    console.log("wtf is camera" , Camera);
  }

  onPressHandler = () => {
    console.log("ay");
  }

  takePicture = () => {
    const options = {};
    //options.location = ...
    this.camera.capture({metadata: options})
      .then((data) => console.log(data))
      .catch(err => console.error(err));
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>I'm overwhelmed123?</Text>
        <Button
          onPress={this.onPressHandler}
          title="Learn More"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"></Button>

        <Camera
          ref={(cam) => {
            this.camera = cam;
          }}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}>
          <Text style={styles.capture} onPress={this.takePicture}>[CAPTURE]</Text>
        </Camera>
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
