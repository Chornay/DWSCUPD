import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { DsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterForIcons, GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import CdsSpinnerScreen from './CdsSpinnerScreen'
import { CmnQrScan } from 'DWcmn/CmnQrScan'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { prjToast } from 'DWcmn/PrjToast'
import { dwdbfsOrderAddQrCode, dwdbfsOrderGetByQrCodeThrows } from 'DWcmn/dwdbfsOrder'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'

//20250208 added check to make sure that order exists
//20251012 changed to navigate back two levels from detail ... skipping us.

//A screen to input a QR code to get an order id to be used to re-identify the current order

//nav param order
export function DsScanQrToAddCode() {

   const navigation = useNavigation()
   const { order = null } = useRoute().params ?? {}

   const [newCodeFromQr, setNewCodeFromQr] = useState(null)
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [applyMask, setApplyMask] = useState(false)

   useEffect(() => {
      setIsComponentInitialized(true)
   }, [])

   //if we get an valid id from the QR code, we prompt to allow the change
   //TODO check shop is correct
   const onScan = async (data, params) => {
      if (!data) { prjToast({ i18n: 'cmnNEW.MsgQRNoData' }) }
      else if (!params) { prjToast({ i18n: 'cmnNEW.MsgQRInvalid' }) }
      else if (!params.code) { prjToast({ i18n: 'cmnNEW.MsgQRNoCode' }) }
      else {
         let tempOrder
         try {
            tempOrder = await dwdbfsOrderGetByQrCodeThrows(params.code)
         }
         catch (error) {
            prjCloudLogError('DsScanQrToAddCode onScan', error, { toastI18n: "cmnNEW.MsgDbReadError" })
            return
         }
         if (tempOrder) {
            prjToast({ i18n: 'cmnNEW.MsgQROrderAlreadyExists' }, { code: params.code, id: tempOrder.id })
         }
         else {
            setNewCodeFromQr(params.code)
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
         {(applyMask) && <PrjBusyMask />}
         <GCHeader back titleI18n='cmnNEW.QrScanner' />
         {newCodeFromQr ? <>
            <View style={{ flex: 1 }}>

            </View>
            <GCFooterForIcons>
               <GCFooterCmdIcon code="ADD_QR_CODE" onPress={async () => {
                  setApplyMask(true)
                  try {
                     await dwdbfsOrderAddQrCode(order, newCodeFromQr)
                     //TODO CHECK THIS NEXT COMMENT????
                     //NOTE WE COMING FROM AN ORDER DETAIL THAT HAS CHANGED ...
                     //DON'T WANT TO GO BACK THERE ... SO POP 2 
                     navigation.pop(2)
                  }
                  catch (error) {
                     prjCloudLogError('DsScanQrToAddCode addQrCode', error, { toastI18n: 'cmnNEW.ErrorUpdatingOrder' })
                  }
                  finally {
                     setApplyMask(false)
                  }
               }
               } />
            </GCFooterForIcons>

         </> :
            <CmnQrScan onScan={onScan} />}
      </DsScreen >
   )

} //end DsScanQrToAddCode