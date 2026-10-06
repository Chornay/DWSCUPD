import React from 'react'
import CdsQuestionScreen from './CdsQuestionScreen'
import { cmnSignoutFirebaseOnly } from 'DWcmn/CmnFunctions'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'


export function CdsSigninEmailVerifySent() {

   const navigation = useNavigation()

   return (
      <CdsQuestionScreen
         text='cst.signin.VerifySent'
         onOkay={async () => {
            await cmnSignoutFirebaseOnly();
            navigation.popToTop();
         }}
      />
   )

}// end CdsSigninEmailVerifySent