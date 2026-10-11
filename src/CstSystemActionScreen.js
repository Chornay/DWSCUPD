import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native'
import CdsQuestionScreen from './CdsQuestionScreen'
import { View, Linking, StyleSheet } from "react-native";
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'
import { cstGetSystemHealthSafe } from './cstCheckSystem';
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'


//param payLoad .. the object returned from the checkSystem cloud function

//we are here if the user has done a system check and found that either
//  mustUpdate .. the user must update to a newer version
//  cannotContinue .. the system is not available   .. will be a message in msgText
export function CstSystemActionScreen() {

   const navigation = useNavigation()
   const { payLoad = null } = useRoute().params ?? {}
   const isMountedRef = useIsMounted()

   if (payLoad?.mustUpdate) {
      return (
         <CdsQuestionScreen
            text='cmnNEW.MsgRequireAppUpdate'
            onOkayCode='UPDATE'
            onOkay={() => {
               //CLAUDE: the store URLs/package id are hard-coded literals, candidates for named constants
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
   return (
      <CdsQuestionScreen
         text='cmnNEW.MsgSystemUnavailable'
         onOkay={async () => {
            const newPayLoad = await cstGetSystemHealthSafe() //never throws
            if (!isMountedRef.current) return

            if (newPayLoad?.mustUpdate || newPayLoad?.cannotContinue || newPayLoad?.cloudFnError) {
               navigation.replace('CstSystemActionScreen', { payLoad: newPayLoad })
               return
            }
            if (newPayLoad?.msgAvail) {
               cmnAlertPopup({ text: newPayLoad.msgText })
            }
            navigation.pop()
         }} />   )
}


// end CstSystemActionScreen