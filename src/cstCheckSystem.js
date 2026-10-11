import firestore from '@react-native-firebase/firestore';
import { functions, firebase } from '@react-native-firebase/functions';
import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { CST } from './CST'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'

//cstCheckSystem calls a cloud function which has the ability to cause one of the following:
//  cloudFnError .. if unsuccessful calling the function
//  mustUpdate .. we go to a screen which directs the user to the appropriate app store
//  cannotContinue .. we have decided that the system is currently unuseable .. go to same screen
//  msgAvail .. we give a popup of a message 

//prop navigation
export async function cstCheckSystemSafe(navigation) {
   const payLoad = await cstGetSystemHealthSafe()
   if (payLoad.msgAvail) {
      cmnAlertPopup({ text: payLoad.msgText })
      return
   }
   if (payLoad.mustUpdate || payLoad.cannotContinue || payLoad.cloudFnError) {
      navigation.navigate('CstSystemActionScreen', { payLoad: payLoad })
      return
   }
   //TODO have cloud function return a healthy signal then fail closed
   return

}

//cstGetSystemHealthSafe
//packages the info necessary for the cloud function which we can change to quickly affect the operation 
//of all users
//we do not examine the payload BUT
//if there is an cloud function error we will return a payload {cloudFnError,error}
export async function cstGetSystemHealthSafe() {

   try {
      //NOTE we removed the data property from return and rename it payload
      const { data: payLoad } = await firebase.app().functions('asia-southeast2').httpsCallable('checkSystem')({
         custId: CST.getCustId(),
         shopId: CST.getShopId(),
         platform: Platform.OS,
         version: DeviceInfo.getVersion(),
         buildNumber: DeviceInfo.getBuildNumber(),
      });
      return payLoad

   } catch (error) {
      return {
         cloudFnError: true,
         msgText: error.message
      }
   }

}
