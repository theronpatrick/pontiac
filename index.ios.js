import { AppRegistry } from 'react-native';
import App from './App';
import Movies from "./Movies"

import { StackNavigator } from 'react-navigation';

const SimpleApp = StackNavigator({
  Home: { screen: App },
  Movies: { screen: Movies },
});

AppRegistry.registerComponent('oakarina', () => SimpleApp)
