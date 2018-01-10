import React, { Component } from 'react';
import { Container, Header, Content, Button, Text } from 'native-base';
import { Actions } from 'react-native-router-flux';

export default class ButtonExample extends Component {
  render() {
    return (
      <Container>
        <Header />
        <Content>
          <Button onPress={() => { Actions.pageTwo(); }}>
            <Text>Click Me! </Text>
          </Button>
        </Content>
      </Container>
    );
  }
}
