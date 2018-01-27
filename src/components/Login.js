import React, { Component } from 'react';
import { Container, Header, Left, Body, Title, Right, Content, Form, Item, Input, Label, Button, Icon, Text } from 'native-base';
import firebase from 'react-native-firebase';
import { Actions } from 'react-native-router-flux';

export default class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      userId: '',
    };
  }

  componentDidMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      if(user) {
        this.setState({
          userId: user.uid,
        });
        Actions.mainPage();
      }
    });
  }

  componentWillUnmount() {
    this.authSubscription();
  }

  onRegister() {
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

  onLogin() {
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then(() => {
        Actions.mainPage();
      });
  }

  onLogout() {
    firebase.auth().signOut()
      .then(() => {
        this.setState({
          email: '',
          password: '',
          userId: '',
        });
      });
  }

  render() {
    return (
      <Container>
        <Header>
          <Left/>
          <Body>
            <Title>Login</Title>
          </Body>
          <Right>
            <Button
              onPress={() => { if(this.state.userId) { Actions.mainPage(); } }}
              transparent
            >
              <Icon
                name='notifications'
                active={this.state.userId !== ''}
              />
            </Button>
          </Right>
        </Header>
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
          <Button onPress={() => { this.onLogin(); }}>
            <Text>Login</Text>
          </Button>
          <Button onPress={() => { this.onRegister(); }}>
            <Text>Sign up</Text>
          </Button>
          <Button onPress={() => { this.onLogout(); }}>
            <Text>Logout</Text>
          </Button>
        </Content>
      </Container>
    );
  }
}
