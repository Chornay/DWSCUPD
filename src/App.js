// import React, { Component } from 'react'
// import { View } from 'react-native';
// import { createSwitchNavigator, createAppContainer } from 'react-navigation';
// import messaging from '@react-native-firebase/messaging';
// import firebase from '@react-native-firebase/app';
// import Sound from 'react-native-sound'
// import { PrjToast } from 'DWcmn/PrjToast'
// import { prjAlertText } from 'DWcmn/PrjCmnFunctions'
// // import RingerMode from 'react-native-ringer-mode';

// import CdsStackSigninOrMain from './CdsStackSigninOrMain';
// import CstStackSignin from './CstStackSignin';
// import CstStackMain from './CstStackMain'
// import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'

// //NOTE that route names are generic so that common login components can be used for Cust,Driv,Shop

// const SwitchNavigator = createSwitchNavigator(
//   {
//     StackSigninOrMain: { screen: CdsStackSigninOrMain, params: { appType: 'cst' } },
//     StackSignin: { screen: CstStackSignin },
//     StackMain: { screen: CstStackMain },
//   },
//   {
//     initialRouteName: 'StackSigninOrMain',
//   });
// const AppContainer = createAppContainer(SwitchNavigator);

// export default class App extends Component {

//   constructor() {
//     super();
//     this.state = {
//     }
//     firebase.firestore().settings({ ignoreUndefinedProperties: true })
//   } //end constructor 

//   async componentDidMount() {
    
//     //get the sound object ready to use
//     this.notifySound = new Sound('notify_cust.mp3', Sound.MAIN_BUNDLE,
//       (error) => {
//         console.log('Sound', error)
//       }) //TODO add error processing for sound init

//     this.unsubscribeNotifications = messaging().onMessage(async remoteMessage => {
//       cmnAlertPopup({ title: JSON.stringify(remoteMessage?.notification?.body) })
//       this.notifySound?.play?.()
//     }); //end 

//   }

//   async componentWillUnmount() {
//     // this.unsubscribeNotifications()
//     this.notifySound.release()
//   }

//   render() {
//     return (
//       <View style={{ flex: 1 }}>
//         <AppContainer />
//         <PrjToast />
//       </View>
//     );
//   }
// }// end App

/////////////////////////////////////////////////////////////////////////////////////////////////
// //WE USE BELOW FOR MULTI-APP CASE
import React from 'react'
import 'react-native-gesture-handler' //Claude says put this way up here
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack';
import '@react-native-firebase/firestore'; //Claude wanted this 
import firebase from '@react-native-firebase/app';
import { PrjToast } from 'DWcmn/PrjToast'

import CstApp from './AppForCustInMulti'
import DrvApp from './DrvApp'
import UtilTop from './UtilTop'
import ShpApp from './ShpApp'
import Main from './Main';

const Stack = createStackNavigator()

firebase.firestore().settings({ ignoreUndefinedProperties: true })

export default function App() {

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Main" component={Main} />
          <Stack.Screen name="CstApp" component={CstApp} />
          <Stack.Screen name="DrvApp" component={DrvApp} />
          <Stack.Screen name="ShpApp" component={ShpApp} />
          <Stack.Screen name="UtilTop" component={UtilTop} />
        </Stack.Navigator>
      </NavigationContainer>
      <PrjToast/>
    </View>
  );
} //end App