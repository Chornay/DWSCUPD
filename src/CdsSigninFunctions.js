import firebase from '@react-native-firebase/app';
import { dwdbfsUserGetByAuthAndAppType } from 'DWcmn/DWDBfs'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'

//we expect to be signed in to firebase
//if there is a db entry for this user we go to the main stack 
//otherwise we navigate to the initialization code in the auth stack
//NOTE the method as 3rd parameter ... currently email login masks the display and we don't
//      want to remove the display until after we have accessed the customer db
export async function navigateForAuthorizedCust(navigation, appType, options, removeMask) {
   const fbUser = firebase.auth().currentUser
   if (fbUser) { //THIS SHOULD ALWAYS BE TRUE
      try {
         let dbUser = await dwdbfsUserGetByAuthAndAppType(appType, fbUser.uid)
         if (dbUser) {
            //CLAUDE: v5 - Try replace() once the back-button test passes
            navigation.navigate("StackMain", { 'user': dbUser })
         }
         else if (appType === 'cst') { //ONLY customer will setup an account
            navigation.navigate("CstSignupInitializeAccount", { 'options': options })
         }
         else {
            prjCloudLogError('navigateForAuthorizedCust', 'non-customer tries to setup account')
            // prjToast({ type: 'danger', text: 'Unexpected action to set up account' })
            // prjCloudLog('navigateForAuthorized non-customer tries to setup account')
         }
      } catch (error) {
         prjCloudLogError('navigateForAuthorizedCust', error, { toastI18n: "cmnNEW.MsgDbReadError" })
         // prjToast({ type: 'danger', text: 'Unspecified error retrieving account' })
         // prjCloudLog('navigateForAuthorized ' + error.message)
      } finally {
         //CLAUDE: with navigate the old screen stays mounted, so this is safe; with replace() it would fire on an unmounted screen. Better for each caller to await this function and own/guard its mask in its own finally
         removeMask?.()
      }
   }
   else {
      //CLAUDE: effectively an assert - signed-in flow with no currentUser. Logged only; the user is already in the sign-in stack, so there is nowhere sensible to send them
      prjCloudLogError('navigateForAuthorizedCust', 'no firebase currentUser after sign-in')
      removeMask?.() //the finally above doesn't cover this path
   }
}//end navigateForAuthorizedCust