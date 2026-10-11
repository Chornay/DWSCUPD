import React from 'react'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'
import { createStackNavigator } from '@react-navigation/stack'

import { CstSignupInitializeAccount } from './CstSignupInitializeAccount';
import { CstProfile } from './CstProfile';
import { CdsSigninLogo } from './CdsSigninLogo'
import { CdsSigninEmail } from './CdsSigninEmail'
import { CdsSigninEmailNotVerified } from './CdsSigninEmailNotVerified'
import { CdsSigninEmailVerifySent } from './CdsSigninEmailVerifySent'
import { CdsSigninEmailForgot } from './CdsSigninEmailForgot'
import { CdsSigninEmailForgotSent } from './CdsSigninEmailForgotSent'
import { CdsSigninPhone } from './CdsSigninPhone'
import { CstSigninEmailSignup } from './CstSigninEmailSignup'

const RootStack = createStackNavigator()


export default function CstStackSignin() {

  const navigation = useNavigation()

  return (
    <RootStack.Navigator
      initialRouteName="CdsSigninLogo"
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen name="CdsSigninLogo" component={CdsSigninLogo} initialParams={{ signinAppType: 'cst' }} />
      <RootStack.Screen name="CdsSigninEmail" component={CdsSigninEmail} />
      <RootStack.Screen name="CstSigninEmailSignup" component={CstSigninEmailSignup} />
      <RootStack.Screen name="CdsSigninEmailNotVerified" component={CdsSigninEmailNotVerified} />
      <RootStack.Screen name="CdsSigninEmailVerifySent" component={CdsSigninEmailVerifySent} />
      <RootStack.Screen name="CdsSigninEmailForgot" component={CdsSigninEmailForgot} />
      <RootStack.Screen name="CdsSigninEmailForgotSent" component={CdsSigninEmailForgotSent} />
      <RootStack.Screen name="CdsSigninPhone" component={CdsSigninPhone} />
      <RootStack.Screen name="CstSignupInitializeAccount" component={CstSignupInitializeAccount} />
      <RootStack.Screen name="CstProfile" component={CstProfile} />
    </RootStack.Navigator>
  )
} //end CstStackSignin