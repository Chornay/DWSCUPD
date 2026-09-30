import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { CstScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import CstSpinnerScreen from './CstSpinnerScreen'
import { CmnQrScan } from 'DWcmn/CmnQrScan'
import { prjToast } from 'DWcmn/PrjToast'
import { dwdbfsOrderGetByQrCodeThrows } from 'DWcmn/dwdbfsOrder'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'

//20250208 new

//Screen allows a customer to scan a QR code to start the process of a new order.
//This QR code may have come from their previous order or they may have obtained it in a building lobby
//or a promotion

export function CstMainNewOrderFromQR() {

   const navigation = useNavigation()
   const isMountedRef = useIsMounted()

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [qrData, setQrData] = useState(null) //NOTE unused elsewhere - carried over as-is

   useEffect(() => {
      setIsComponentInitialized(true)
   }, [])

   //verify the QR data. We expect to find an 'order' url parameter
   const onScan = async (data, params) => {
      let tempOrder
      if (!data) { prjToast({ i18n: 'cmnNEW.MsgQRNoData' }) }
      else if (!params) { prjToast({ i18n: 'cmnNEW.MsgQRInvalid' }) }
      else if (!params.code) { prjToast({ i18n: 'cmnNEW.MsgQrNoCode' }) }
      else {
         //TODO check if the order is 'ours' before display .. may be a db exception
         //if order doesn't exist then we will use it
         try {
            tempOrder = await dwdbfsOrderGetByQrCodeThrows(params.code)
         } catch (error) {
            prjCloudLogError('CstMainNewOrderFromQR', error)
            return
         }
         if (!isMountedRef.current) return //user backed out while the lookup was in flight
         if (tempOrder) {
            prjToast({ i18n: 'cmnNEW.MsgQROrderAlreadyExists' }, { code: params.code, id: tempOrder.id })
            navigation.replace('OrderDetail', { 'id': tempOrder.id });
         }
         else {
            //TODO readonly flag for order?
            navigation.replace('CstMenuMain', { 'codeFromQr': params.code })
            return
         }
      }

      //if we did not successfully proceed to MenuMain then we just go back
      //CORRECTION we can NOT go back because we want TOast to display. User will have to do back arrow
      // props.navigation.goBack()
   }

   //TODO if order already exists error message and goBack And is correct shop?
   //TODO goto CstMenuMain with order id set.

   if (!isComponentInitialized) {
      return (<CstSpinnerScreen />
      );
   }

   return (
      <CstScreen>
         <GCHeader back titleI18n='cmnNEW.QrScanner' />
         <CmnQrScan onScan={onScan} />
      </CstScreen >
   )

} //end CstMainNewOrderFromQR

const styles = StyleSheet.create({
   camera: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
   },
   capture: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      width: 400, height: '100%'
   }

});