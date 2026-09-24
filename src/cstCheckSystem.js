import firestore from '@react-native-firebase/firestore';
import { functions, firebase } from '@react-native-firebase/functions';
import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { CST } from './CST'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'

//cstCheckSystem calls a cloud function which has the ability to cause one of the following:
//  mustUpdate .. we go to a screen which directs the user to the appropriate app store
//  cannotContinue .. we have decided that the system is currently unuseable .. go to same screen
//  msgAvail .. we give a popup of a message 

//prop navigation
export async function cstCheckSystem(navigation) {
   try {
      const payLoad = await cstGetSystemHealth()
      if (payLoad.mustUpdate || payLoad.cannotContinue) {
         navigation.navigate('CstSystemActionScreen', { payLoad: payLoad })
      }
      else if (payLoad.msgAvail) {
         cmnAlertPopup({ text: payLoad.msgText })
      }
   } catch (error) {
      cmnAlertPopup({ text: 'Error calling checkSystem ' + error.message })
   }

}

//cstGetSystemHealth
//packages the info necessary for the cloud function which we can change to quickly affect the operation 
//of all users
export async function cstGetSystemHealth() {

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
      //no annunciation .. our caller can take care of that
      // cmnAlertPopup({ text: 'Error calling checkSystem ' + error.message })
      return {
         cannotContinue: true,
         msgText: error.message
      }
   }

}
