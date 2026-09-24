import React, { Component } from 'react'

import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import Sound from 'react-native-sound'
// import RingerMode from 'react-native-ringer-mode';

import CdsStackSigninOrMain from './CdsStackSigninOrMain';
import CstStackSignin from './CstStackSignin';
import CstStackMain from './CstStackMain'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'



import { prjAlertText } from 'DWcmn/PrjCmnFunctions'

//NOTE that route names are generic so that common login components can be used for Cust,Driv,Shop

const SwitchNavigator = createSwitchNavigator(
    {
        StackSigninOrMain: { screen: CdsStackSigninOrMain, params: { appType: 'cst' } },
        StackSignin: { screen: CstStackSignin },
        StackMain: { screen: CstStackMain },
    },
    {
        initialRouteName: 'StackSigninOrMain',
    });
const AppContainer = createAppContainer(SwitchNavigator);

export default class CstApp extends Component {

    constructor() {
        super();
        this.state = {
        }
        firebase.firestore().settings({ ignoreUndefinedProperties: true })
    } //end constructor 

    async componentDidMount() {
        
        //get the sound object ready to use
        this.notifySound = new Sound('notify_cust.mp3', Sound.MAIN_BUNDLE,
            (error) => {
                console.log('Sound', error)
            }) //TODO add error processing for sound init
        //This is the setting of the media player slider .... not what we want
        // this.notifySound.getSystemVolume((vol)=>{console.log(vol)})
        // var mode = await RingerMode.getRingerMode(); console.log(mode)

        //a notifications listener
        this.unsubscribeNotifications = messaging().onMessage(async remoteMessage => {
            // console.log('Fore ground message------------>', JSON.stringify(remoteMessage?.notification?.body))
            cmnAlertPopup({ title: JSON.stringify(remoteMessage?.notification?.body) })
            this.notifySound?.play?.()
        }); //end 

    }

    async componentWillUnmount() {
        this.unsubscribeNotifications && this.unsubscribeNotifications()
        this.notifySound.release()
    }

    render() {
        return (<AppContainer />);
    }
}// end CstApp