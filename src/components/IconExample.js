import React, { Component } from 'react';
import { Container, Header, Content, Icon } from 'native-base';
import { Actions } from 'react-native-router-flux';

export default class IconExample extends Component {
  render() {
    return (
      <Container>
        <Header />
        <Content>
          <Icon name="home" onPress={() => { Actions.pageOne(); }} />
          <Icon name="logo-twitter" />
          <Icon ios="ios-basket-outline" android="md-basket" style={{ fontSize: 20, color: 'red' }} />
        </Content>
      </Container>
    );
  }
}
