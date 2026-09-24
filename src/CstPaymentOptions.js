import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { BackHandler } from 'react-native'
import { Platform } from 'react-native'

import GCHeader from 'DWcmn/GCHeader'
import { CstScreen } from './CdsScreen';
import { PaymentMethodEnum } from 'DWcmn/Global'
import { dwdbfsOrderUpdateFieldsThrows } from 'DWcmn/dwdbfsOrder'
import { hasBeenPickedUp } from 'DWcmn/PrjCmnFunctions'
import { GCI18n, GCText } from 'DWcmn/Gc'
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import CstSpinnerScreen from './CstSpinnerScreen';
import { COLORS } from 'DWcmn/Global'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'

//20241017 removed the NO CHANGE command at bottom
//  if this is an existing order they can use BACK at header
//  for a new order they have to choose an option .. which will be written to db



// import DateTimePicker from '@react-native-community/datetimepicker';

// TODO we think that this color looks good '#0e9af1'
//TODO change so that we don't write record if payment option doesn't change.
//TODO change so that we don't update record until they say OKAY (new order only?)
//TODO what is payment status if online payment fails ... still init??

//param order
//param isNewOrder
export default function CstPaymentOptions({ navigation }) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [applyMask, setApplyMask] = useState(false)
   const orderRef = useRef(null)
   const isNewOrderRef = useRef(false)
   const isMountedRef = useIsMounted()

   //pull nav params and mark initialized
   useEffect(() => {
      orderRef.current = navigation.getParam('order', null)
      isNewOrderRef.current = navigation.getParam('isNewOrder', false)
      setIsComponentInitialized(true)
   }, [])

   //android hardware back handler subscription
   useEffect(() => {
      if (Platform.OS !== 'android') { return }
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => { return true })
      return () => { subscription.remove() }
   }, [])

   const titleText = (code) => {
      return (
         <GCI18n title code={code} style={{ textAlign: 'center' }} />
      )
   }

   //method will update the db and if successful do a nav goBack
   //on error it annunicates and returs
   const handleClick = async (orderId, method) => {
      setApplyMask(true)
      try {
         await dwdbfsOrderUpdateFieldsThrows(orderRef.current.id, { paymentMethod: method.enumKey })
         navigation.popToTop()
      }
      catch (error) {
         prjCloudLogError('CstPaymentOptions', error, { toast: 'Error changing payment method' }) //OKAY
      }
      finally {
         if (isMountedRef.current) { setApplyMask(false) }
      }
   }

   if (!isComponentInitialized) {
      return (
         <CstSpinnerScreen />
      );
   }

   //NOTE order is approved only for a shop that approves all fully priced orders by cust
   let cashOnPickupOkay = (orderRef.current.isApproved && orderRef.current.allowCashOnPickup && !hasBeenPickedUp(orderRef.current.status))
   //TODO add special case where unpriced, driver can weigh and no specials //TODO

   return (
      <CstScreen>
         {applyMask && <PrjBusyMask />}
         <GCHeader titleI18n='cstNEW.PaymentOptions'
            back={!isNewOrderRef.current} />
         <View style={styles.spacyBox}>
            <View style={{ flex: .5, justifyContent: 'center', alignItems: 'center' }}>
               {isNewOrderRef.current && titleText('cstNEW.PaymentOptionsNewOrder')}

               {(orderRef.current.isApproved) ? <View>
                  {titleText('cstNEW.PaymentOptionsApproved')}
               </View>
                  : <View>
                     {titleText('cstNEW.PaymentOptionsUnapproved')}
                  </View>}
            </View>

            {/* give pay now option if pay online available AND order is approved*/}
            {/* REALISTICALLY pay online will always be available                */}
            <View style={{ flex: .3 }}>
               <View style={styles.paymentOption}>
                  {(orderRef.current.allowOnline && orderRef.current.isApproved) &&
                     <PaymentOption
                        id="KEYBOARD"
                        i18n="cstNEW.PayNow"
                        onPress={() => {
                           navigation.navigate('CstPayment', { 'order': orderRef.current })
                        }
                        } />}

                  {/* give cash on pickup option if available*/}
                  {(cashOnPickupOkay) &&
                     <PaymentOption
                        id="ARROW_UP_OUTLINE"
                        i18n="cstNEW.PayCashOnPickup"
                        onPress={async () => {
                           await handleClick(orderRef.current.id, PaymentMethodEnum.payPickup)
                        }} />
                  }

                  {/* give cash on delivery option if available */}
                  {orderRef.current.allowCashOnDelivery &&
                     <PaymentOption
                        id="ARROW_DOWN_OUTLINE"
                        i18n="cstNEW.PayCashOnDelivery"
                        onPress={async () => {
                           await handleClick(orderRef.current.id, PaymentMethodEnum.payDelivery)
                        }} />
                  }
                  {/* if no online payment then pay later makes no sense — they will choose pay on P or D */}
                  {(orderRef.current.allowOnline) &&
                     <PaymentOption
                        id="CLOCK"
                        i18n={!orderRef.current.isApproved ? "cmn.OKAY" : "cstNEW.PayOnlineLater"}
                        onPress={async () => {
                           await handleClick(orderRef.current.id, PaymentMethodEnum.payLater)
                        }} />
                  }
               </View>
            </View>
            <View style={{ flex: .2 }} />
         </View>
         <View style={{ flex: .1 }} />

      </CstScreen>
   )

}// end CstPaymentOptions

//prop id .. the icon id
//prop i18n .. the text
//prop onPress
function PaymentOption({ id, i18n, onPress }) {
   return (
      <TouchableOpacity
         onPress={onPress}>
         <View style={styles.button}>
            <PrjIcon style={{ fontSize: 16, color: 'white' }} id={id} />
            <GCText>    </GCText>
            <GCI18n style={{ fontSize: 16, color: 'white' }} code={i18n} />
         </View>
      </TouchableOpacity>
   )
}

const styles = StyleSheet.create({
   paymentOption: {},
   spacyBox: {
      flex: .9,
      width: 'auto',
      height: 'auto',
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 10,
      borderWidth: 3,
      borderRadius: 10,
      borderColor: COLORS.GC_THEME_DARK,
   },
   button: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: Platform.OS == 'ios' ? 20 : 40,
      borderStyle: 'solid',
      marginBottom: 20,
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 30,
      paddingRight: 30,
      width: 300,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOpacity: 2,
      shadowRadius: 5,
      shadowOffset: { height: 4 }, // SC added shadowOffset for iOS
      elevation: 5,
      backgroundColor: COLORS.GC_BUTTON_BKG,
      color: 'white',
      overflow: 'hidden', //add to show borderRadius on iOS
   }
})