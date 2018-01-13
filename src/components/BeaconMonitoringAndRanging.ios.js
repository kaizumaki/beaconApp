import React, { Component } from 'react';
import { Text, View, ListView, FlatList, DeviceEventEmitter } from 'react-native';
import Beacons  from 'react-native-beacons-manager';
import moment   from 'moment';

const TIME_FORMAT = 'MM/DD/YYYY HH:mm:ss';

export default class BeaconMonitoringAndRanging extends Component {
  constructor(props) {
    super(props);

    // will be set as a reference to "regionDidEnter" event:
    regionDidEnterEvent = null;
    // will be set as a reference to "regionDidExit" event:
    regionDidExitEvent = null;
    // will be set as a reference to "authorizationStatusDidChange" event:
    authStateDidRangeEvent = null;

    this.state = {
      // region information
      uuid: '6FAD7AFB-079E-4F42-8574-5DF2633B03CB',
      identifier: 'some id',

      rangingDataSource    : new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows([]),
      regionEnterDatasource: new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows([]),
      regionExitDatasource : new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 }).cloneWithRows([])
    };
  }

  componentWillMount(){
    const { identifier, uuid } = this.state;
    //
    // ONLY non component state aware here in componentWillMount
    //

    // OPTIONAL: listen to authorization change
    this.authStateDidRangeEvent = DeviceEventEmitter.addListener(
      'authorizationStatusDidChange',
      (info) => console.log('authorizationStatusDidChange: ', info)
    );

    // MANDATORY: you have to request ALWAYS Authorization (not only when in use) when monitoring
    // you also have to add "Privacy - Location Always Usage Description" in your "Info.plist" file
    // otherwise monitoring won't work
    Beacons.requestAlwaysAuthorization();
    Beacons.shouldDropEmptyRanges(true);

    // Define a region which can be identifier + uuid,
    // identifier + uuid + major or identifier + uuid + major + minor
    // (minor and major properties are numbers)
    const region = { identifier, uuid };
    // Monitor for beacons inside the region
    Beacons
    .startMonitoringForRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
    .then(() => console.log('Beacons monitoring started succesfully'))
    .catch(error => console.log(`Beacons monitoring not started, error: ${error}`));
    // Range for beacons inside the region
    Beacons
    .startRangingBeaconsInRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
    .then(() => console.log('Beacons ranging started succesfully'))
    .catch(error => console.log(`Beacons ranging not started, error: ${error}`));
    // update location to ba able to monitor:
    Beacons.startUpdatingLocation();
  }

  componentDidMount() {
    //
    // component state aware here - attach events
    //

    // Ranging event
    this.beaconsDidRangeEvent = DeviceEventEmitter.addListener(
      'beaconsDidRange',
      (data) => {
      //  console.log('beaconsDidRange data: ', data);
        this.setState({ rangingDataSource: this.state.rangingDataSource.cloneWithRows(data.beacons) });
      }
    );

    // monitoring events
    this.regionDidEnterEvent = DeviceEventEmitter.addListener(
      'regionDidEnter',
      (data) => {
        console.log('monitoring - regionDidEnter data: ', data);
        const time = moment().format(TIME_FORMAT);
        this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier:data.identifier, uuid:data.uuid, minor:data.minor, major:data.major, time }]) });
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
    const { identifier, uuid } = this.state;
    const region = { identifier, uuid };
    // stop monitoring beacons:
    Beacons
    .stopMonitoringForRegion(region)
    .then(() => console.log('Beacons monitoring stopped succesfully'))
    .catch(error => console.log(`Beacons monitoring not stopped, error: ${error}`));
    // stop ranging beacons:
    Beacons
    .stopRangingBeaconsInRegion(region)
    .then(() => console.log('Beacons ranging stopped succesfully'))
    .catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));
    // stop updating locationManager:
    Beacons.stopUpdatingLocation();
    // remove auth state event we registered at componentDidMount:
    this.authStateDidRangeEvent.remove();
    // remove monitoring events we registered at componentDidMount
    this.regionDidEnterEvent.remove();
    this.regionDidExitEvent.remove();
    // remove ranging event we registered at componentDidMount
    this.beaconsDidRangeEvent.remove();
  }

  render() {
    const { rangingDataSource, regionEnterDatasource, regionExitDatasource } =  this.state;

    return (
      <View>
        <Text>
          ranging beacons in the area:
        </Text>
        <FlatList
          data={this.state.rangingDataSource}
          renderItem={({item}) => <Text>{item}</Text>}
        />
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

  renderRangingRow(rowData) {
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
