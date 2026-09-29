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
import React, { Component } from 'react'
import { View } from 'react-native';
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack';
import firebase from '@react-native-firebase/app';
import { PrjToast } from 'DWcmn/PrjToast'

import CstApp from './AppForCustInMulti'
import DrvApp from './DrvApp'
import UtilTop from './UtilTop'
import ShpApp from './ShpApp'
import Main from './Main';

const TopStackNavigator = createStackNavigator({
  Main: {
    screen: Main,
  },
  CstApp: {
    screen: CstApp,
  },
  DrvApp: {
    screen: DrvApp,
  },
  ShpApp: {
    screen: ShpApp,
  },
  UtilTop: {
    screen: UtilTop,
  }
}, {
  initialRouteName: "Main",
  defaultNavigationOptions: {
    header: null,
  }

}) // end of TopStackNavigator

const AppContainer = createAppContainer(TopStackNavigator);

export default class App extends Component {

  constructor() {
    super();
    this.state = {
    }
    firebase.firestore().settings({ ignoreUndefinedProperties: true })
  } //end constructor

  componentDidMount() {
  } //end componentDidMount

  render() {

    return (
      <View style={{ flex: 1 }}>
        <AppContainer />
        <PrjToast/>
      </View>
    )
      ;

  } //end render
} //end class App
