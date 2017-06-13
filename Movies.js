import React from 'react';
import { View, Text, Button, AsyncStorage, StyleSheet } from 'react-native'

import Video from "react-native-video";

export default class Movies extends React.Component {
  static navigationOptions = {
    title: 'View Journey So Far',
  };

  constructor(props) {
    super(props);

    this.state = {
      movieUrl: null
    }

    AsyncStorage.getAllKeys((err, keys) => {
      console.log("keys " , keys);
      this.setState({
        keys: keys,
        movieIndex: 0
      })

      if (keys.length > 0) {
        this.playFirstMovie()
      }
    });
  }

  playFirstMovie = () => {
    AsyncStorage.getItem(this.state.keys[0], (err, value) => {
      console.log("value for first movie" , value);
      this.setState({
        movieUrl: JSON.parse(value).path,
      })

      if (this.state.keys.length > 1) {
        this.setState({
          movieIndex: 1
        })
      }
    });
  }

  onEnd = () => {
    AsyncStorage.getItem(this.state.keys[this.state.movieIndex], (err, value) => {
      console.log("value for 2nd movie" , value);

      this.setState({
        movieUrl: JSON.parse(value).path
      })

      if (this.state.movieIndex == this.state.keys.length - 1) {
        console.log("setting back to 0");
        this.setState({
          movieIndex: 0
        })
      } else {
        console.log("setting to " , this.state.movieIndex++);
        this.setState({
          movieIndex: this.state.movieIndex++
        })
      }
    });
  }

  render() {
    const { navigate } = this.props.navigation;

    let video = <Text>Loading</Text>
    if (this.state.movieUrl) {
      console.log("show movie");
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
    alignItems: 'center',
    width: "100%",
    height: "90%"
  },
});
