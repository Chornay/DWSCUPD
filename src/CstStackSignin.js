import React, { Component } from 'react'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'

import CstSignupInitializeAccount from './CstSignupInitializeAccount';
import CstProfile from './CstProfile';
import CdsSigninLogo from './CdsSigninLogo'
import CdsSigninEmail from './CdsSigninEmail'
import CdsSigninEmailNotVerified from './CdsSigninEmailNotVerified'
import CdsSigninEmailVerifySent from './CdsSigninEmailVerifySent'
import CdsSigninEmailForgot from './CdsSigninEmailForgot'
import CdsSigninEmailForgotSent from './CdsSigninEmailForgotSent'
import CdsSigninPhone from './CdsSigninPhone'
import CstSigninEmailSignup from './CstSigninEmailSignup'
import CstSignupSlideIntro from './CstSignupSlideIntro'

const RootStack = createStackNavigator(
  {
    CdsSigninLogo: {
      screen: CdsSigninLogo,
      params:{signinAppType:'cst'}
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
    CstSignupInitializeAccount: {
      screen: CstSignupInitializeAccount,
    },
    CstProfile: {
      screen: CstProfile,
    },
    // ForTesting slide intro
    CstSignupSlideIntro:{
      screen:CstSignupSlideIntro,
    }
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
export default class CstStackSignin extends Component {

  componentDidMount() {
  }

  componentWillUnmount() {
  } //end componentWillUnmount

  render() {
    global.rootNav = this.props.navigation
    return (
      <AppContainer />
    );
  }
} //end class CstStackSignin


