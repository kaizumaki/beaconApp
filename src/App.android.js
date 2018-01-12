import React, { Component } from 'react';
import { Router, Scene } from 'react-native-router-flux';
import BeaconMonitoringAndRanging from './components/BeaconMonitoringAndRanging.android';

export default class AppAndroid extends Component {
  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene key="pageOne" component={BeaconMonitoringAndRanging} title="PageOne" hideNavBar initial />
        </Scene>
      </Router>
    );
  }
}
