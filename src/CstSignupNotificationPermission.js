import React, { Component } from 'react';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PERMISSIONS, requestNotifications } from 'react-native-permissions';
import CdsQuestionScreen from './CdsQuestionScreen'



//prop onOkay
export class CstSignupNotificationPermission extends Component {

    constructor() {
        super();
        this.state = {
            isComponentInitialized: false,
        };
    }

    componentDidMount() {
        this.setState({ isComponentInitialized: true });
    }

    render() {

        return (
            <CdsQuestionScreen
                text='cmnNEW.EnableNotifications'
                onOkay={async () => {
                    //NOTE we don't care whether they enabled it
                    if (Platform.OS === 'android') {
                        await requestNotifications(['alert', 'sound'])
                    }
                    else { //ios
                        await messaging().requestPermission({})
                    }
                    this.props.onOkay()
                }}
            />
        )
    }

}// end CstSignupNotificationPermission
