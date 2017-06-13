import React from 'react';
import { View, Text, Button } from 'react-native'

import Video from "react-native-video";

export default class Movies extends React.Component {
  static navigationOptions = {
    title: 'Welcome',
  };
  render() {
    const { navigate } = this.props.navigation;
    return (
      <View>
        <Text>View all movies</Text>
      </View>
    );
  }
}
