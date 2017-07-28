import { AppRegistry } from 'react-native';
import App from './App';
import Movies from "./Movies"
import Map from "./Map"

import { StackNavigator } from 'react-navigation';

const SimpleApp = StackNavigator({
  Home: { screen: App },
  Movies: { screen: Movies },
  Map: { screen: Map }
});

AppRegistry.registerComponent('oakarina', () => SimpleApp)
