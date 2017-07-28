import React from 'react';
import { View, Text, Button, AsyncStorage, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import MapView from 'react-native-maps';

export default class Map extends React.Component {
  static navigationOptions = {
    title: 'Map',
  };

  constructor(props) {
    super(props);

    this.state = {
      movieUrl: null
    }

    // TODO: Save movie list from App.js and just reference from there
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

      });
    });
  }


  render() {
    const { navigate } = this.props.navigation;

    let loadedMovies = this.state.movies || []

    // Could prob do this in same step with .reduce
    loadedMovies = loadedMovies.filter((movie) => {
      console.log("before movie " , movie);
      if (!movie.timestamp) {
        return false
      } else {
        return movie
      }
    })

    const markers = loadedMovies.map((movie) => {

      console.log("movie " , movie);

      let latlng = {
        latitude: movie.location.lat,
        longitude: movie.location.lng
      }

      let time = movie.timestamp.toString()

      return <MapView.Marker
        key={time}
        coordinate={latlng}
        onPress={() => {
          console.log("hey " , movie.path);
        }}
      />
    })

    console.log("markers " , markers);


    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 1,
            longitudeDelta: 1,
          }}
        >

          {markers}

        </MapView>
      </View>
    );
  }
}

// Later on in your styles..

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
