import 'react-native-gesture-handler'
import React, { useContext, useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContext } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import Sound from 'react-native-sound';

import CdsStackSigninOrMain from './CdsStackSigninOrMain';
import DrvStackSignin from './DrvStackSignin';
import DrvStackMain from './DrvStackMain'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions';
import { prjCloudLogError } from 'DWcmn/prjCloudLog';

//NOTE that we test our context ... if someone else has created the navigation container then we will not
//Lets us be called by a multi-app that contains customer, shop and driver

const Stack = createStackNavigator();

firebase.firestore().settings({ ignoreUndefinedProperties: true })

export default function DrvApp() {
  const parentNavigation = useContext(NavigationContext);
  const notifySoundRef = useRef(null);

  useEffect(() => {
    //CLAUDE: borrowing the customer sound for now - rename when a driver-specific file exists
    const sound = new Sound('notify_cust.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) prjCloudLogError('DrvApp.SoundLoad', error);
    });
    notifySoundRef.current = sound;

    return () => {
      sound.release();
    };
  }, []);

  useEffect(() => {
    try {
      const unsubscribe = messaging().onMessage((remoteMessage) => {
        try {
          cmnAlertPopup({ title: JSON.stringify(remoteMessage?.notification?.body) });
          notifySoundRef.current?.play?.();
        } catch (error) {
          prjCloudLogError('DrvApp.OnMessageHandler', error);
        }
      });
      return unsubscribe;
    } catch (error) {
      prjCloudLogError('DrvApp.OnMessageSetup', error);
    }
  }, []);

  //CLAUDE: a stack keeps StackSigninOrMain underneath StackMain (the switch navigator discarded it). Leave via replace()/reset(), or switch to conditional screens on auth state.
  const stack = (
    <Stack.Navigator initialRouteName="StackSigninOrMain" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StackSigninOrMain" component={CdsStackSigninOrMain} initialParams={{ appType: 'drv' }} />
      <Stack.Screen name="StackSignin" component={DrvStackSignin} />
      <Stack.Screen name="StackMain" component={DrvStackMain} />
    </Stack.Navigator>)

  return parentNavigation ? stack : <SafeAreaProvider><NavigationContainer>{stack}</NavigationContainer></SafeAreaProvider>;
}