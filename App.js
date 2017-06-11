import React from 'react';
import { StyleSheet, Text, View, ScrollView, Button, AsyncStorage, ListView, Linking, Alert } from 'react-native';
import Camera from "react-native-camera"
import OpenFile from 'react-native-open-file';
import Video from "react-native-video";

export default class App extends React.Component {

  constructor(props) {
    super(props);

    this.camera = null;

    // All this DataSource crap is for ListViews, but since whole view is a scrollview now, don't need a ListView
    // so just use movieLinks instead of movieList
    const movieListSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      camera: {
        aspect: Camera.constants.Aspect.fill,
        captureTarget: Camera.constants.CaptureTarget.cameraRoll,
        captureMode: Camera.constants.CaptureMode.video,
        type: Camera.constants.Type.back,
        orientation: Camera.constants.Orientation.auto,
        flashMode: Camera.constants.FlashMode.auto,
      },
      isRecording: false,
      movieListSource: movieListSource,
      movieList: movieListSource.cloneWithRows([]),
      movieLinks: [],
      playVideoUri: ""
    };

    // Get all movies saved and populate list
     this.populateMovieList()

  }

  populateMovieList = () => {
    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {

        let listData = []
        stores.map((result, i, store) => {
          let key = store[i][0];
          let value = store[i][1];

          listData.push( JSON.parse(value) )
        });

        console.log("listdata... " , listData);

         this.setState({
           movieList: this.state.movieListSource.cloneWithRows(listData),
           movieLinks: listData
         })

      });
    });
  }

  deleteData = () => {

    Alert.alert(
      'Are you sure you want to delete all movie data?',
      '',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'OK', onPress: () => {
          console.log('OK Pressed')
          AsyncStorage.getAllKeys((err, keys) => {
            AsyncStorage.multiRemove(keys, (err, stores) => {

            });

            this.populateMovieList()
          });
        }},
      ],
      { cancelable: false }
    )

  }

  movieLinkPress = (e) => {
    console.log("Pressed " , e);
    alert(`Movie URI: ${e}`)
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
      .then((data) => {
        console.log('movie data' , data)

        // Get location
        let position = 0;
        navigator.geolocation.getCurrentPosition(
          (p) => {
            position = p

            console.log("position " , p);

            // Right now, movies are indexed by the time (miliseconds from epoch) they were taken
            // Prob want some kind of UID in the future

            let store = "@movie_store"
            let timestamp = Date.now()
            let key = `${store}_${timestamp}`

            let movieData = {
              timestamp,
              path: data.path,
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            }

            console.log("data to save " , movieData);

            // Save data
            try {
              AsyncStorage.setItem(key, JSON.stringify(movieData), () => {
                this.populateMovieList()
              });

            } catch (error) {
              // Error saving data
              console.error("Error saving data " , error);
            }
          },
          (error) => console.log('Error getting position' , error.message),
          {enableHighAccuracy: true, timeout: 10000, maximumAge: 1000}
        );

      })
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
      let path = this.state.moviePath
      console.log("path after stopping is " , path);
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

    let scrollViewStyles = {
      alignItems: 'center',
      justifyContent: 'center',
    }

    return (
        <View style={styles.container}>
          <Text>Record your Journey!</Text>
          {recordButton}
          {typeButton}

          <Button onPress={this.deleteData} title="Delete Data"></Button>

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

          <Text>Movie Time Stamps:</Text>

          <ListView
            enableEmptySections={true}
            styles={styles.movieLinksContainer}
            dataSource={this.state.movieList}
            renderRow={(rowData) => <Text onPress={() => {this.movieLinkPress(rowData.path)}} style={styles.movieLinks}>Date: {new Date(parseInt(rowData.timestamp)).getMonth() + 1}/{new Date(parseInt(rowData.timestamp)).getDate()}. Location: {(Math.round(rowData.location.lat * 1000) / 1000).toString()}, {(Math.round(rowData.location.lng * 1000) / 1000).toString()}</Text>}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '20%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
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
  },
  movieLinksContainer: {
    height: "20%"
  },
  movieLinks: {
    color: '#00e',
    fontSize: 20,
    marginBottom: 10
  }
});
