import React from 'react'
import CdsQuestionScreen from './CdsQuestionScreen'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'

export function CdsSigninEmailForgotSent() {

   const navigation = useNavigation()

   return (
      <CdsQuestionScreen
         text='cmnNEW.EmailForgotSent'
         onOkay={async () => {
            navigation.popToTop();
         }}
      />
   )

}// end CdsSigninEmailForgotSent