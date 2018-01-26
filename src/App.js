import React, { Component } from 'react';
import { Router, Scene } from 'react-native-router-flux';
import firebase from 'react-native-firebase';
import Login from './components/Login';
import BeaconMonitoringAndRanging from './components/BeaconMonitoringAndRanging';

export default class App extends Component {
  componentDidMount() {
    firebase.messaging().requestPermissions();
  }

  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene key="LoginPage" component={Login} title="Login" hideNavBar initial />
          <Scene key="mainPage" component={BeaconMonitoringAndRanging} title="MainPage" /* hideNavBar */ />
        </Scene>
      </Router>
    );
  }
}
