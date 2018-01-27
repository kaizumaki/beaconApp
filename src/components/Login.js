import React, { Component } from 'react';
import { Container, Header, Left, Body, Title, Right, Content, Form, Item, Input, Label, Button, Icon, Text } from 'native-base';
import firebase from 'react-native-firebase';
import { Actions } from 'react-native-router-flux';

export default class Login extends Component {
  constructor() {
    super();

    this.ref = firebase.firestore().collection('users');

    this.state = {
      email: '',
      password: '',
      userId: '',
      token: '',
    };
  }

  componentDidMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      if(user) {
        this.setState({
          email: user.email,
          userId: user.uid,
        });
        Actions.mainPage();
      }
    });

    firebase.messaging().getToken()
      .then((token) => {
        this.setState({
          token: token,
        });
      });

    firebase.messaging().onTokenRefresh((token) => {
      this.setState({
        token: token,
      });
    });
  }

  componentWillUnmount() {
    this.authSubscription();
  }

  onRegister() {
    firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
      .then((user) => {
        this.ref.doc(user.uid).set({
          proximity: '',
          token: this.state.token,
        });
        Actions.mainPage();
      });
  }

  onLogin() {
    firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
      .then((user) => {
        this.ref.doc(user.uid).update({
          token: this.state.token,
        });
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
