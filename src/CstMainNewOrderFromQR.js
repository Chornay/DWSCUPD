import React, { useState, useEffect } from 'react'
import { StyleSheet } from 'react-native'
import { CstScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import CstSpinnerScreen from './CstSpinnerScreen'
import { CmnQrScan } from 'DWcmn/CmnQrScan'
import { prjToast } from 'DWcmn/PrjToast'
import { dwdbfsOrderGetByQrCode } from 'DWcmn/dwdbfsOrder'

//20250208 new

//Screen allows a customer to scan a QR code to start the process of a new order.
//This QR code may have come from their previous order or they may have obtained it in a building lobby
//or a promotion

export default function CstMainNewOrderFromQR(props) {

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
         //CLAUDE no isMounted guard around this await - if the user backs out while this
         //lookup is in flight, the navigation.replace below still fires on an unmounted screen
         if (tempOrder = await dwdbfsOrderGetByQrCode(params.code)) {
            prjToast({ i18n: 'cmnNEW.MsgQROrderAlreadyExists' }, { code: params.code, id: tempOrder.id })
            props.navigation.replace('OrderDetail', { 'id': tempOrder.id });
         }
         else {
            //TODO readonly flag for order?
            props.navigation.replace('CstMenuMain', { 'codeFromQr': params.code })
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