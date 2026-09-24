import React, { useState, useRef, useEffect } from 'react'
import { Platform, StyleSheet, View, ScrollView } from 'react-native'
import { COLORS } from 'DWcmn/Global'
import { CstScreen } from './CdsScreen';
import CstSpinnerScreen from './CstSpinnerScreen';
import CmnItemsList from 'DWcmn/CmnItemsList'
import { PrjSpacer } from 'DWcmn/Prj';
import { dwdbfsOrderAddNew, dwdbfsOrderGetById } from 'DWcmn/DWDBfs'
import { dwdbfsOrderReschedule } from 'DWcmn/dwdbfsOrder'
import { prjUpdateOrderPricing } from 'DWcmn/prjUpdateOrderPricing'
import { CmnTouchableEdit } from 'DWcmn/CmnTouchableEdit'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { GCStopDetails } from 'DWcmn/GCStopDetails'
import { strX } from 'DWcmn/I18n';
import GCHeader from 'DWcmn/GCHeader' //NOTE doing the default import
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { PrjButtonWithConfirm } from 'DWcmn/PrjButtonWithConfirm'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { prjIconEditableBox } from 'DWcmn/PrjIconComponents'
import { cmnSendEmailAsync } from 'DWcmn/cmnSendEmailAsync'
import { prjFormatOrderForEmail } from 'DWcmn/prjFormatOrderForEmail'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
// import DateTimePicker from '@react-native-community/datetimepicker';

//20250210 added reschedule functionality

//This screen gives the customer a last look at the order before committing it to the db
//NOTE if the reschedule flag is set we are just reviewing a change in pickup and

// TODO we think that this color looks good '#0e9af1'

//param order
//param reschedule flag true iff this is an existing order begin rescheduled
export default function CstCheckoutSummary({ navigation }) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [applyMask, setApplyMask] = useState(false)
   const orderRef = useRef(null)
   const rescheduleRef = useRef(false)
   const refresh = useRefresh()
   const isMountedRef = useIsMounted()

   //set delivery address as pickup address by default
   useEffect(() => {
      orderRef.current = navigation.getParam('order', null)
      rescheduleRef.current = navigation.getParam('reschedule', false)
      if (!rescheduleRef.current) { prjUpdateOrderPricing(orderRef.current) } //don't mess with order if this is a reschedule
      setIsComponentInitialized(true)
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only; navigation param read is a one-time init, not a reactive dependency
   }, [])

   if (!isComponentInitialized) {
      return (
         <CstSpinnerScreen />
      );
   }

   const order = orderRef.current
   const reschedule = rescheduleRef.current

   const titleI18n = reschedule ? 'cmnNEW.ReviewYourSchedule' : 'cst.Checkout_Summary'
   const cancelConfirmI18n = reschedule ? "cmnNEW.DiscardTheseChanges_" : null
   //TODO replace EDITABLE BOX with method

   const submitOrder = async () => {

      let newOrder
      let newId

      setApplyMask(true)

      try {
         newId = await dwdbfsOrderAddNew(order)
         newOrder = await dwdbfsOrderGetById(newId)
      }
      catch (error) {
         //oops. we won't navigate from this screen .. so just return
         prjCloudLogError('CstCheckoutSummary.submitOrder', error, { toastI18n: 'cmnNEW.ERRORCreatingOrder' })
         if (isMountedRef.current) { setApplyMask(false) }
         return
      }
      //NOTE .. error in creating order means we go no further .. 
      //     we stay on the screen and they get another chance (which may be a problem..multiple?)

      try {
         //NOTE awaited (wasn't in the class version) so the catch below actually catches a rejection instead of it becoming an unhandled promise rejection
         await cmnSendEmailAsync({
            to: newOrder.shopEmail,
            subject: `order ${newId} created.`,
            html: prjFormatOrderForEmail(newOrder)
         })
      }
      catch (error) {
         // quietly log error
         //TODO we really do want this to work .. any way to do something other than log?
         prjCloudLogError('CstCheckoutSummary.submitOrder', error, {toast:false})
      }
      finally {
         if (isMountedRef.current) { setApplyMask(false) }
      }

      //NOTE we end up here if we have successfully created the order.
      //email may have been sent
      //applyMask is false
      //TODO should be guard against dismount
      navigation.navigate('CstPaymentOptions', { 'order': newOrder, 'isNewOrder': true }) //CLAUDE 'CstPaymentOptions' is a bare route-name string literal - candidate for a named constant if other screens reference it too
   }

   //TODO do the order schedule changes in DB
   const commitScheduleChanges = async (orderMod) => {
      setApplyMask(true)
      try {
         await dwdbfsOrderReschedule(orderMod)
         navigation.popToTop()
      }
      catch (error) {
         prjCloudLogError('CstCheckoutSummary.commitScheduleChanges', error, {toastI18n:'CMNnre'})
         //cmnAlertPopup({ titleI18n: 'cmnNEW.ERRORModifyingOrder', text: error.message }) //confirmed
      }
      finally {
         if (isMountedRef.current) { setApplyMask(false) }
      }
   }

   return (

      <CstScreen>
         {(applyMask) && <PrjBusyMask />}
         <GCHeader back cancel cancelConfirmI18n={cancelConfirmI18n}
            titleI18n={titleI18n}
            noBottomPadding />
         <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
            <ScrollView style={{ flex: .85 }}>
               <CmnItemsList order={order} readonly></CmnItemsList>
               <PrjSpacer size={10} />
               <View style={styles.tile}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                     <GCText title>{strX('cmnNEW.REMARKS')}</GCText>
                     <CmnTouchableEdit
                        specialEditBox
                        disabled={reschedule}
                        titleI18n='cmnNEW.RemarksForOrder'
                        initial={order.remarks}
                        onOkay={(newValue) => { order.remarks = newValue; refresh() }}
                        onCancel={() => { }}
                        onDelete={() => { order.remarks = null; refresh() }}>
                        {prjIconEditableBox()}

                     </CmnTouchableEdit>
                  </View>
                  <GCText detail light>{order.remarks}</GCText>
               </View>
               <View style={styles.tile}>
                  <GCI18n title code='cmn.PICKUP' />
                  <GCStopDetails routeTime={order.pickupRouteTime} routeDescrip={order.pickupRouteDescrip} stop={order.pickupStop} />
               </View>
               <View style={styles.tile}>
                  <GCI18n title code='cmn.DELIVERY' />
                  <GCStopDetails routeTime={order.deliveryRouteTime} routeDescrip={order.deliveryRouteDescrip} stop={order.deliveryStop} />
               </View>
               <View style={{ height: 10 }} />
            </ScrollView>
            <View style={{ flex: .15, alignItems: 'center', justifyContent: 'center' }}>
               {reschedule ?
                  <PrjButtonWithConfirm
                     buttonStyle={styles.orderButton}
                     i18n="cmnNEW.RESCHEDULE"
                     confirmI18n="cmnNEW.ChangeYourSchedule_"
                     onConfirm={async () => { await commitScheduleChanges(order) }}
                  /> :
                  <PrjButtonWithConfirm
                     buttonStyle={styles.orderButton}
                     i18n="cstNEW.SUBMIT_ORDER"
                     confirmI18n="cstNEW.SubmitOrderConfirm"
                     onConfirm={async () => { await submitOrder() }}
                  />
               }
            </View>
         </View>
      </CstScreen>
   );

}// end CstCheckoutSummary

const styles = StyleSheet.create({
   tile: {
      justifyContent: 'center',
      width: '100%',
      height: 'auto',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 6,
      marginBottom: 10,
      borderColor: COLORS.GC_TILE_BORDER,
      borderWidth: 1.5,
      backgroundColor: COLORS.GC_ABS_WHITE
   },

   orderButton: {
      justifyContent: 'center',
      alignItems: 'center',
      // borderRadius: 40,
      borderRadius: Platform.OS == 'ios' ? 20 : 40,
      borderStyle: 'solid',
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 30,
      paddingRight: 30,
      width: 'auto',
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