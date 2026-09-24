import React, { Component } from 'react'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import CdsSigninLogo from './CdsSigninLogo'
import CdsSigninEmail from './CdsSigninEmail'
import CdsSigninEmailNotVerified from './CdsSigninEmailNotVerified'
import CdsSigninEmailVerifySent from './CdsSigninEmailVerifySent'
import CdsSigninEmailForgot from './CdsSigninEmailForgot'
import CdsSigninEmailForgotSent from './CdsSigninEmailForgotSent'
import CstSigninEmailSignup from './CstSigninEmailSignup'
import CdsSigninPhone from './CdsSigninPhone'

//NOTE the drv and shp signin stacks are identical except for the appType
const RootStack = createStackNavigator(
  {
  CdsSigninLogo: {
    screen: CdsSigninLogo,
    params:{signinAppType:'shp'}
  },
  CdsSigninEmail: {
    screen: CdsSigninEmail,
  },
  CstSigninEmailSignup: {
    screen:CstSigninEmailSignup,
  },
  CdsSigninEmailNotVerified: {
    screen: CdsSigninEmailNotVerified,
  },
  CdsSigninEmailVerifySent: {
    screen: CdsSigninEmailVerifySent,
  },
  CdsSigninEmailForgot: {
    screen:CdsSigninEmailForgot,
  },
  CdsSigninEmailForgotSent: {
    screen:CdsSigninEmailForgotSent,
  },
  CdsSigninPhone: {
    screen: CdsSigninPhone,
  },
}, //end of routes

{ //Navigator config options 
  initialRouteName: 'CdsSigninLogo',
  defaultNavigationOptions: {
    header: null,
  }
}

); //end stack navigator


const AppContainer = createAppContainer(RootStack);


//NOTE that anywhere in the Auth 'tree' we can use global.rootNav
// which will give us access to this stack (and thus to the Main stack)
export default class ShpStackSignin extends Component {

  componentDidMount() {
    console.log("ShpStackSignin mounted")
  }

  componentWillUnmount() {
    console.log("ShpStackSignin unmounted", global.ShpxRec)
  } //end componentWillUnmount

  render() {
    global.rootNav = this.props.navigation
    return (
      <AppContainer />
    );
  }
} //end class ShpStackSignin


