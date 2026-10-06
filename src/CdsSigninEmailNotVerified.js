import React from 'react'
import CdsQuestionScreen from './CdsQuestionScreen'
import firebase from '@react-native-firebase/app';
import { cmnSignoutFirebaseOnly } from 'DWcmn/CmnFunctions'
import { prjToast } from 'DWcmn/PrjToast'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'

//on entry we expect an authorized user
//when they are finished here they will be logged out and sent back to top

export function CdsSigninEmailNotVerified() {

   const navigation = useNavigation()
   const user = firebase.auth().currentUser
   return (
      <CdsQuestionScreen
         text='cstNEW.EmailNotVerified'
         onOkayCode="NEXT_IS_SEND_EMAIL"
         onOkay={async () => {
            try {
               await user.sendEmailVerification();
               // NOTE next page will log us out
               navigation.navigate("CdsSigninEmailVerifySent");
            } catch (error) {
               prjToast({ type: 'danger', text: error.message })
            }
         }}
         onCancel={async () => {
            await cmnSignoutFirebaseOnly();
            navigation.popToTop();
         }}
      />
   )

}// end CdsSigninEmailNotVerified