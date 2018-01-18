import React, { Component } from 'react';
import { Text, View, ListView, DeviceEventEmitter, Button } from 'react-native';
import Beacons from 'react-native-beacons-manager';
import moment from 'moment';
import firebase from 'react-native-firebase';

const TIME_FORMAT = 'YYYY/MM/DD HH:mm:ss';

export default class BeaconMonitoringAndRanging extends Component {
  constructor(props) {
    super(props);

    // will be set as a reference to "beaconsDidRange" event:
    beaconsDidRangeEvent = null;
    // will be set as a reference to "regionDidEnter" event:
    regionDidEnterEvent = null;
    // will be set as a reference to "beaconsDidRange" event:
    beaconsDidRangeEvent = null;

    this.state = {
      isAuthenticated: false,
      // region information
      uuid: '6FAD7AFB-079E-4F42-8574-5DF2633B03CB',
      identifier: 'Kaizumaki Nefry Beacon',

      rangingDataSource    : new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows([]),
      regionEnterDatasource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows([]),
      regionExitDatasource : new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows([]),

      updates: { proximity: '' },
    };
  }

  componentWillMount(){
    const { identifier, uuid } = this.state;
    //
    // ONLY non component state aware here in componentWillMount
    //

    // Define a region which can be identifier + uuid,
    // identifier + uuid + major or identifier + uuid + major + minor
    // (minor and major properties are 'OPTIONAL' numbers)
    const region = { identifier, uuid };

    // start iBeacon detection (later will add Eddystone and Nordic Semiconductor beacons)
    Beacons.detectIBeacons();

    // Monitor beacons inside the region
    Beacons
      .startMonitoringForRegion(region)
      .then(() => console.log('Beacons monitoring started succesfully'))
      .catch(error => console.log(`Beacons monitoring not started, error: ${error}`));

    // Range beacons inside the region
    Beacons
      .startRangingBeaconsInRegion(identifier, uuid)
      .then(() => console.log('Beacons ranging started succesfully'))
      .catch(error => console.log(`Beacons ranging not started, error: ${error}`));
  }

  componentDidMount() {
    firebase.auth().signInAnonymously()
      .then(() => {
        this.setState({
          isAuthenticated: true,
        });
      });

    this.firebaseDatabaseTest = () => {
      if (this.state.isAuthenticated) {
        this.setState({
          updates: { proximity: 'ccccc' },
        });
        firebase.database().ref().update(this.state.updates);
      }
    }

    // Ranging:
    this.beaconsDidRangeEvent = DeviceEventEmitter.addListener(
      'beaconsDidRange',
      (data) => {
        if (this.state.isAuthenticated) {
          this.setState({
            updates: { proximity: data.beacons.proximity },
          });
          firebase.database().ref().update(this.state.updates);
        }
        console.log('beaconsDidRange data: ', data);
        this.setState({ rangingDataSource: this.state.rangingDataSource.cloneWithRows(data.beacons) });
      }
    );

    // monitoring:
    this.regionDidEnterEvent = DeviceEventEmitter.addListener(
      'regionDidEnter',
      ({ identifier, uuid, minor, major }) => {
        console.log('monitoring - regionDidEnter data: ', { identifier, uuid, minor, major });
        const time = moment().format(TIME_FORMAT);
        this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier, uuid, minor, major, time }]) });
      }
    );

    this.regionDidExitEvent = DeviceEventEmitter.addListener(
      'regionDidExit',
      ({ identifier, uuid, minor, major }) => {
        console.log('monitoring - regionDidExit data: ', { identifier, uuid, minor, major });
        const time = moment().format(TIME_FORMAT);
        this.setState({ regionExitDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier, uuid, minor, major, time }]) });
      }
    );
  }

  componentWillUnmount() {
    const { uuid, identifier } = this.state;
    const region = { identifier, uuid };
    // stop ranging beacons:
    Beacons
    .stopRangingBeaconsInRegion(identifier, uuid)
    .then(() => console.log('Beacons ranging stopped succesfully'))
    .catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));

    // stop monitoring beacons:
    Beacons
    .stopMonitoringForRegion(region)
    .then(() => console.log('Beacons monitoring stopped succesfully'))
    .catch(error => console.log(`Beacons monitoring not stopped, error: ${error}`));

    // remove ranging event we registered at componentDidMount
    this.beaconsDidRangeEvent.remove();
    // remove beacons events we registered at componentDidMount
    this.regionDidEnterEvent.remove();
    this.regionDidExitEvent.remove();
  }

  render() {
    const { rangingDataSource, regionEnterDatasource, regionExitDatasource } =  this.state;

    return (
      <View>
        <Button
          onPress={this.firebaseDatabaseTest}
          title="Firebase Test"
          color="#841584"
        />
        <Text>
          ranging beacons in the area:
        </Text>
        <ListView
          dataSource={ rangingDataSource }
          enableEmptySections={ true }
          renderRow={this.renderRangingRow}
        />
        <Text>
          monitoring enter information:
        </Text>
        <ListView
          dataSource={ regionEnterDatasource }
          enableEmptySections={ true }
          renderRow={this.renderMonitoringEnterRow}
        />

        <Text>
          monitoring exit information:
        </Text>
        <ListView
          dataSource={ regionExitDatasource }
          enableEmptySections={ true }
          renderRow={this.renderMonitoringLeaveRow}
        />
      </View>
    );
  }

  renderRangingRow = (rowData) => {
    return (
      <View>
        <Text>
          UUID: {rowData.uuid ? rowData.uuid  : 'NA'}
        </Text>
        <Text>
          Major: {rowData.major ? rowData.major : 'NA'}
        </Text>
        <Text>
          Minor: {rowData.minor ? rowData.minor : 'NA'}
        </Text>
        <Text>
          RSSI: {rowData.rssi ? rowData.rssi : 'NA'}
        </Text>
        <Text>
          Proximity: {rowData.proximity ? rowData.proximity : 'NA'}
        </Text>
        <Text>
          Distance: {rowData.accuracy ? rowData.accuracy.toFixed(2) : 'NA'}m
        </Text>
      </View>
    );
  }


  renderMonitoringEnterRow = ({ identifier, uuid, minor, major, time }) => {
    return (
      <View>
        <Text>
          Identifier: {identifier ? identifier : 'NA'}
        </Text>
        <Text>
          UUID: {uuid ? uuid  : 'NA'}
        </Text>
        <Text>
          Major: {major ? major : ''}
        </Text>
        <Text>
          Minor: { minor ? minor : ''}
        </Text>
        <Text>
          time: { time ? time : 'NA'}
        </Text>
      </View>
    );
  }

  renderMonitoringLeaveRow = ({ identifier, uuid, minor, major, time }) => {
    return (
      <View>
        <Text>
          Identifier: {identifier ? identifier : 'NA'}
        </Text>
        <Text>
          UUID: {uuid ? uuid  : 'NA'}
        </Text>
        <Text>
          Major: {major ? major : ''}
        </Text>
        <Text>
          Minor: { minor ? minor : ''}
        </Text>
        <Text>
          time: { time ? time : 'NA'}
        </Text>
      </View>
    );
  }
}
