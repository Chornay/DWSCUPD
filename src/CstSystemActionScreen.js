import React, { Component } from 'react';
import { Platform } from 'react-native'
import CdsQuestionScreen from './CdsQuestionScreen'
import { View, Linking, StyleSheet } from "react-native";
import { cstGetSystemHealth } from './cstCheckSystem';


//param payLoad .. the object returned from the checkSystem cloud function

//we are here if the user has done a system check and found that either
//  mustUpdate .. the user must update to a newer version
//  cannotContinue .. the system is not available .. will be a message in msgText
export class CstSystemActionScreen extends Component {

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

      if (!this.state.isComponentInitialized) return null

      const payLoad = this.props.navigation.getParam('payLoad')

      if (payLoad?.mustUpdate) {
         //NOTE that we do not provide a LATER option because there is nowhere for us to go
         //we can't popToTop because we will just end up back in the same place
         //logging them out would not do them any favours
         return (
            <CdsQuestionScreen
               text='cmnNEW.MsgRequireAppUpdate'
               onOkayCode='UPDATE'
               onOkay={() => {
                  Linking.openURL(
                     Platform.OS === "ios"
                        //TODO add link for iOS device
                        ? "itms-apps://itunes.apple.com/app/idYOUR_APP_ID"
                        : "https://play.google.com/store/apps/details?id=com.dobbywalla.cust"
                  )
               }}
            />
         )
      }
      else if (payLoad?.cannotContinue) { //DEBUG
         //NOTE that we do not provide a LATER option because there is nowhere for us to go
         //we can't popToTop because we will just end up back in the same place
         //logging them out would not do them any favours
         return (
            <CdsQuestionScreen
               text='cmnNEW.MsgSystemUnavailable'
               extra={payLoad.msgText}
               onOkay={async () => {
                  const newPayLoad = await cstGetSystemHealth()
                  if (!newPayLoad?.cannotContinue) { this.props.navigation.popToTop() }
               }}
            />
         )
      }
   }

}// end CstSystemActionScreen
