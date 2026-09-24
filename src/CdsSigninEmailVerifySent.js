import CdsQuestionScreen from './CdsQuestionScreen'
import { cmnSignoutFirebaseOnly } from 'DWcmn/CmnFunctions'


export default function CdsSigninEmailVerifySent(props) {

   return (
      <CdsQuestionScreen
         text='cst.signin.VerifySent'
         onOkay={async () => {
            await cmnSignoutFirebaseOnly();
            props.navigation.popToTop();
         }}
      />
   )

}// end CdsSigninEmailVerifySent