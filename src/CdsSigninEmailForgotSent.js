import React from 'react'
import CdsQuestionScreen from './CdsQuestionScreen'


export default function CdsSigninEmailForgotSent(props) {

   return (
      <CdsQuestionScreen
         text='cmnNEW.EmailForgotSent'
         onOkay={async () => {
            props.navigation.popToTop();
         }}
      />
   )

}// end CdsSigninEmailForgotSent