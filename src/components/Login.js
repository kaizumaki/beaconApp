import React, { Component } from 'react';
import { Container, Header, Content, Form, Item, Input, Label, Button, Text } from 'native-base';
import firebase from 'react-native-firebase';
import { Actions } from 'react-native-router-flux';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: ''
    };
  }

  signUp() {
    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then((user) => {
        firebase.messaging().getToken()
          .then((token) => {
            firebase.firestore().collection('users').doc(user.uid).set({
              proximity: '',
              token: token
            });
          })
          .then(() => {
            Actions.mainPage();
          });
      });
  }

  signIn() {
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        Actions.mainPage();
      });
  }

  render() {
    return (
      <Container>
        <Header />
        <Content>
          <Form>
            <Item floatingLabel>
              <Label>E-mail</Label>
              <Input
                onChangeText={(text) => this.setState({ email: text })}
                value={this.state.email}
              />
            </Item>
            <Item floatingLabel last>
              <Label>Password</Label>
              <Input
                onChangeText={(text) => this.setState({ password: text })}
                value={this.state.password}
                secureTextEntry
              />
            </Item>
          </Form>
          <Button onPress={() => { this.signIn(); }}>
            <Text>Login</Text>
          </Button>
          <Button onPress={() => { this.signUp(); }}>
            <Text>Sign up</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}
