import React, { Component } from 'react';
import { Router, Scene } from 'react-native-router-flux';
import firebase from 'react-native-firebase';
import BeaconMonitoringAndRanging from './components/BeaconMonitoringAndRanging';

export default class App extends Component {
  componentDidMount() {
    firebase.messaging().requestPermissions();
    firebase.messaging().getToken()
      .then((token) => {
        console.log('firebase_token :' + token);
        firebase.database().ref('/user/').set(token);
      });
  }

  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene key="pageOne" component={BeaconMonitoringAndRanging} title="PageOne" /* hideNavBar */ initial />
        </Scene>
      </Router>
    );
  }
}
