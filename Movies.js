import React from 'react';
import { View, Text, Button, AsyncStorage, StyleSheet, TouchableWithoutFeedback } from 'react-native'

import Video from "react-native-video";

export default class Movies extends React.Component {
  static navigationOptions = {
    title: 'Your Journey So Far',
  };

  constructor(props) {
    super(props);

    this.state = {
      movieUrl: null
    }

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

        let movies = stores.sort(compareFunction)

        // TODO: Probably more efficient way to do this
        let sortedMovies = [];
        for (let i = 0; i < movies.length; i++) {
          sortedMovies.push(JSON.parse(movies[i][1]))
        }

        console.log("movies... " , stores);

         this.setState({
           keys: keys,
           movieIndex: 0,
           movies: sortedMovies
         })

         if (keys.length > 0) {
           this.playFirstMovie()
         }

      });
    });
  }

  playFirstMovie = () => {
    console.log("setting url to " , this.state.movies[0]);
    this.setState({
      movieUrl: this.state.movies[0].path,
    })

    if (this.state.keys.length > 1) {
      this.setState({
        movieIndex: 1
      })
    }
  }

  onEnd = () => {
    this.setState({
      movieUrl: this.state.movies[this.state.movieIndex].path
    })

    this.playNextMovie()
  }

  playNextMovie = () => {
    if (this.state.movieIndex == this.state.keys.length - 1) {
      console.log("setting back to 0");
      this.setState({
        movieIndex: 0
      })
    } else {
      console.log("setting to " , this.state.movieIndex + 1);
      this.setState({
        movieIndex: this.state.movieIndex + 1
      })
    }
  }

  videoClick = () => {
    this.setState({
      movieUrl: this.state.movies[this.state.movieIndex].path
    })

    this.playNextMovie()
  }

  render() {
    const { navigate } = this.props.navigation;

    let video = <Text>Loading</Text>
    if (this.state.movieUrl) {
      console.log("show movie " , this.state.movieUrl);
      video = <Video
        source={{uri: this.state.movieUrl}}
        style={styles.video}
        rate={1.0}
        onEnd={this.onEnd}
      />
    }

    return (
      <View style={styles.container}>
        <Text>View all movies</Text>
        <TouchableWithoutFeedback onPress={this.videoClick}>
          <View
            style={styles.clickInterceptor}
          />
        </TouchableWithoutFeedback>
          {video}
      </View>
    );
  }
}

// Later on in your styles..
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  video: {
    position: "absolute",
    alignItems: 'center',
    width: "100%",
    height: "90%",
    zIndex: 0
  },
  clickInterceptor: {
    position: "absolute",
    zIndex: 1,
    alignItems: 'center',
    width: "100%",
    height: "90%"
  }
});
