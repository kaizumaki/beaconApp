import React, { Component } from 'react';
import { Router, Scene } from 'react-native-router-flux';
import ButtonExample from './components/ButtonExample';
import IconExample from './components/IconExample';

export default class App extends Component {
  render() {
    return (
      <Router>
        <Scene key="root">
          <Scene key="pageOne" component={ButtonExample} title="PageOne" hideNavBar initial />
          <Scene key="pageTwo" component={IconExample} title="PageTwo" hideNavBar />
        </Scene>
      </Router>
    );
  }
}
