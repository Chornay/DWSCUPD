import React, { useEffect } from 'react'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'
import { createStackNavigator } from '@react-navigation/stack'

import { CdsSigninLogo } from './CdsSigninLogo'
import { CdsSigninEmail } from './CdsSigninEmail'
import { CdsSigninEmailNotVerified } from './CdsSigninEmailNotVerified'
import { CdsSigninEmailVerifySent } from './CdsSigninEmailVerifySent'
import { CdsSigninEmailForgot } from './CdsSigninEmailForgot'
import { CdsSigninEmailForgotSent } from './CdsSigninEmailForgotSent'
import { CdsSigninPhone } from './CdsSigninPhone'

//NOTE the drv and shp signin stacks are identical except for the appType
const RootStack = createStackNavigator()


export default function ShpStackSignin() {

  const navigation = useNavigation()

  useEffect(() => {
    console.log("ShpStackSignin mounted")

    return () => {
      console.log("ShpStackSignin unmounted")
    }
  }, [])

  return (
    <RootStack.Navigator
      initialRouteName="CdsSigninLogo"
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen name="CdsSigninLogo" component={CdsSigninLogo} initialParams={{ signinAppType: 'shp' }} />
      <RootStack.Screen name="CdsSigninEmail" component={CdsSigninEmail} />
      <RootStack.Screen name="CdsSigninEmailNotVerified" component={CdsSigninEmailNotVerified} />
      <RootStack.Screen name="CdsSigninEmailVerifySent" component={CdsSigninEmailVerifySent} />
      <RootStack.Screen name="CdsSigninEmailForgot" component={CdsSigninEmailForgot} />
      <RootStack.Screen name="CdsSigninEmailForgotSent" component={CdsSigninEmailForgotSent} />
      <RootStack.Screen name="CdsSigninPhone" component={CdsSigninPhone} />
    </RootStack.Navigator>
  )
} //end ShpStackSignin