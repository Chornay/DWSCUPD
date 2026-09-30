import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import { CstScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'

//TODO GCFooterWithSingleIcon not tested yet

//nav param order
export function CstPayment() {

   const navigation = useNavigation()
   const { order = null } = useRoute().params ?? {}

   const [confirmationAvailable, setConfirmationAvailable] = useState(false)
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)

   useEffect(() => {
      //TODO check totalPrice etc

      setIsComponentInitialized(true)
   }, [])

   if (!isComponentInitialized) return null
   return (
      <CstScreen background>
         <GCHeader style={{ backgroundColor: 'transparent' }} />
         <View style={{ flex: 1 }} >
            <WebView
               //There are several stages after the Form is submitted by our web page
               //We can tell when ipay88 is displaying the final status by the title
               //Confirmation means they are displaying a transaction summary (pass or fail)
               //PaymentCancel means there is no display but we are finished
               //In both the above cases a final navstate change follows (immediately for cancel)
               onNavigationStateChange={(navState)=>{
                  // console.log(navState)
                  //if we already have a success/failure screen, next state change is a timeout
                  //or if we are at the last screen (ipay88response)
                  if(confirmationAvailable ||
                     navState.url.includes("ipay88response")){
                     navigation.popToTop()
                  }
                  //ow if it is the confirmation screen give them a button to navigate away
                  else if (navState.title.includes("Confirmation") ||
                     navState.title.includes("PaymentCancel") ){
                     setConfirmationAvailable(true)
                  }
               }} 
               style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
               originWhitelist={['*']}
               source={{
                  uri: "https://asia-southeast2-dobby-ba6e8.cloudfunctions.net/ipay88payment" +
                  "?RefNo=" + order.id +
                     // "&Amount=1.00" + //INTEGRATION TESTING
                     "&Amount=" + order.totalPrice.toFixed(2) +
                     "&UserName=" + order.name +
                     "&UserEmail=" + order?.email +
                     "&UserContact=" + order.phoneNumber
               }}
            />
         </View>

         {confirmationAvailable&&<GCFooterWithSingleIcon
            onPress={async () => {
               //NOTE the payment status will be changed by cloud function called by ipay88
               //TOTO but we could verify the paid status here perhaps
               navigation.popToTop()
            }}
         />}
      </CstScreen>
   )
} //end CstPayment