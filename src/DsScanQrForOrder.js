import React, { useState, useEffect } from 'react'
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Linking } from 'react-native'
import { DsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import CdsSpinnerScreen from './CdsSpinnerScreen'
import { CmnQrScan } from 'DWcmn/CmnQrScan'
import { prjToast } from 'DWcmn/PrjToast'
import { dwdbfsOrderGetByQrCodeThrows } from 'DWcmn/dwdbfsOrder'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'

//20250208 added check to make sure that order exists
//20251012 changed to navigate back two levels from detail ... skipping us.

//A screen to input a QR code for driver/shop and display an order if:
// it is valid QR  data with a code parameter
// it exists
// it is 'ours'
//Order detail will be displayed by navigating to OrderDetail screen (different for driver/shop)
export function DsScanQrForOrder() {

   const navigation = useNavigation()

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)

   useEffect(() => {
      setIsComponentInitialized(true)
   }, [])

   //if we get an valid id fromt the QR then display its detail
   //NOTE we 'tell' OrderDetail to pop two levels so it won't come back to us on back arrow
   //TODO check shop is correct
   const onScan = async (data, params) => {
      if (!data) { prjToast({ i18n: 'cmnNEW.MsgQRNoData' }) }
      else if (!params) { prjToast({ i18n: 'cmnNEW.MsgQRInvalid' }) }
      else if (!params.code) { prjToast({ i18n: 'cmnNEW.MsgQrNoCode' }) }
      else {
         let order
         try {
            order = await dwdbfsOrderGetByQrCodeThrows(params.code)
         }
         catch (error) {
            prjCloudLogError('DsScanQrForOrder onScan', error, { toastI18n: "cmnNEW.MsgDbReadError" })
            return
         }
         if (!order) {
            prjToast({ i18n: 'cmnNEW.MsgQROrderDoesNotExist' }, { code: params.code })
         }
         else {
            //NOTE we 'replace' not 'navigate' .. don't want to come back here
            navigation.replace('OrderDetail', { 'id': order.id })
            return
         }
      }
   }

   if (!isComponentInitialized) { //not finished our preparation yet
      return (
         <CdsSpinnerScreen />
      );
   } //end if 
   return (
      <DsScreen>
         <GCHeader back titleI18n='cmnNEW.QrScanner' />
         <CmnQrScan onScan={onScan} />
      </DsScreen >
   )

} //end DsScanQrForOrder