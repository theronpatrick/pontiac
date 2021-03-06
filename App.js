import React from 'react';
import { AppRegistry, StyleSheet, Text, View, ScrollView, Button, AsyncStorage, ListView, Linking, Alert } from 'react-native';
import Camera from "react-native-camera"
import OpenFile from 'react-native-open-file';
import { StackNavigator } from 'react-navigation';
import { RNMail } from 'NativeModules'

import Uploader from "./helpers/Uploader.js"

export default class HomeScreen extends React.Component {

  static navigationOptions = { title: 'Home', header: null };

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
      uploadIndex: 0,
      playVideoUri: ""
    };

    // Get all movies saved and populate list
     this.populateMovieList()

  }

  populateMovieList = () => {
    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {

        let compareFunction = function compare(a, b) {

          let aObject = JSON.parse(a[1])
          let bObject = JSON.parse(b[1])

          if (aObject.timestamp < bObject.timestamp) {
            return -1;
          }
          if (aObject.timestamp > bObject.timestamp) {
            return 1;
          }
          // a must be equal to b
          return 0;
        }

        let sortedMovies = stores.sort(compareFunction)

        let listData = []
        sortedMovies.map((result, i, store) => {
          let key = store[i][0];
          let value = JSON.parse(store[i][1]);

          // Firebase and other libraries might add to our local storage keys, so only push value if it has
          // the appropriate key
          if (key.indexOf("movie_store") > -1) {
            listData.push(value)
          }

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

  // TODO: Upload all movies, AND metadata
  uploadCompleteCallback = (movie) => {
    Uploader.uploadMovieMetadata(movie)

    let index = this.state.uploadIndex;
    let nextIndex = index + 1
    this.setState({
      uploadIndex: nextIndex
    }, () => {
      if (nextIndex != this.state.movieLinks.length) {
        console.log("upload movie num " , nextIndex);
        this.uploadData(this.state.movieLinks[nextIndex])
      }
    })

  }

  uploadData = (movie) => {

    console.log("upload movie data for " , movie);


    this.uploadCompleteCallback(movie)

    // TODO: Right now just uploading metadata, figure out wtf to do with videos
    /*
    Uploader.uploadMovie(movie, () => {
      this.uploadCompleteCallback(movie)
    })
    */
  }

  uploadDataHandler = () => {
    // TODO: Reset to 0, only using this cuz having issues with packager
    // TODO: Finish uploading videos I have
    this.setState({
      uploadIndex: 0
    }, () => {
      this.uploadData(this.state.movieLinks[0])
    })

  }

  backupData = () => {

    console.log("mail " , RNMail);

    AsyncStorage.getAllKeys((err, keys) => {
      AsyncStorage.multiGet(keys, (err, stores) => {

        let listData = []
        stores.map((result, i, store) => {
          let key = store[i][0];
          let value = store[i][1];

          listData.push( JSON.parse(value) )
        });

        console.log("list " , listData);

        RNMail.mail({
          subject: 'Journey App Backup',
          recipients: ['therondevelopment@gmail.com'],
          body: JSON.stringify(listData),
          isHTML: true
        }, (error, event) => {
            if (error) {
              console.error('Could not send mail. Please send a mail to therondevelopment@gmail.com');
            }
        });

      });
    });


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

    const { navigate } = this.props.navigation;

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

          <View style={styles.buttonWrapper}>
            <Button onPress={this.uploadDataHandler} title="Upload Data" ></Button>

            <Button onPress={this.backupData} title="Backup Data" ></Button>

            <Button onPress={this.goToMap}
              title="Go To Map"
              onPress={() => {navigate('Map')}}
            />

            <Button
              onPress={() => {navigate('Movies')}}
              title="Your Journey so Far"
            />

          </View>

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
    paddingTop: "10%",
    height: "100%",
    width: "100%",
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      flexDirection:'row',
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
