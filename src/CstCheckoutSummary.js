import React, { Component } from 'react'
import { Platform, StyleSheet, View, ScrollView } from 'react-native'
import { COLORS } from 'DWcmn/Global'
import { CstScreen } from './CdsScreen';
import CstSpinnerScreen from './CstSpinnerScreen';
import CmnItemsList from 'DWcmn/CmnItemsList'
import { PrjSpacer } from 'DWcmn/Prj';
import { dwdbfsOrderAddNew, dwdbfsOrderGetById } from 'DWcmn/DWDBfs'
import { dwdbfsOrderReschedule } from 'DWcmn/dwdbfsOrder'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'
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
// import DateTimePicker from '@react-native-community/datetimepicker';

//20250210 added reschedule functionality

//This screen gives the customer a last look at the order before committing it to the db
//NOTE if the reschedule flag is set we are just reviewing a change in pickup and

// TODO we think that this color looks good '#0e9af1'

//param order
//param reschedule flag true iff this is an existing order begin rescheduled
export default class CstCheckoutSummary extends Component {


   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
         applyMask: false,
      };
      this.order = null
      this.reschedule = false
   } //end constuctor


   //set delivery address as pickup address by default
   componentDidMount() {
      this.order = this.props.navigation.getParam('order', null)
      this.reschedule = this.props.navigation.getParam('reschedule', false)
      if (!this.reschedule) { prjUpdateOrderPricing(this.order) } //don't mess with order if this is a reschedule
      this.setState({ isComponentInitialized: true });
   }


   render() {

      if (!this.state.isComponentInitialized) {
         return (
            <CstSpinnerScreen />
         );
      }

      const titleI18n = this.reschedule ? 'cmnNEW.ReviewYourSchedule' : 'cst.Checkout_Summary'
      const cancelConfirmI18n = this.reschedule ? "cmnNEW.DiscardTheseChanges_" : null
      //TODO replace EDITABLE BOX with method

      return (

         <CstScreen>
            {(this.state.applyMask) && <PrjBusyMask />}
            <GCHeader back cancel cancelConfirmI18n={this.reschedule ? "cmnNEW.DiscardTheseChanges_" : null}
               titleI18n={this.reschedule ? 'cmnNEW.ReviewYourSchedule' : 'cst.Checkout_Summary'}
               noBottomPadding />
            <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
               <ScrollView style={{ flex: .85 }}>
                  <CmnItemsList order={this.order} readonly></CmnItemsList>
                  <PrjSpacer size={10} />
                  <View style={styles.tile}>
                     <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <GCText title>{strX('cmnNEW.REMARKS')}</GCText>
                        <CmnTouchableEdit
                           specialEditBox
                           disabled={this.reschedule}
                           titleI18n='cmnNEW.RemarksForOrder'
                           initial={this.order.remarks}
                           onOkay={(newValue) => { this.order.remarks = newValue; this.setState({ toggle: !this.state.toggle }) }}
                           onCancel={() => { }}
                           onDelete={() => { this.order.remarks = null; this.setState({ toggle: !this.state.toggle }) }}>
                           {prjIconEditableBox()}

                        </CmnTouchableEdit>
                     </View>
                     <GCText detail light>{this.order.remarks}</GCText>
                  </View>
                  <View style={styles.tile}>
                     <GCI18n title code='cmn.PICKUP' />
                     <GCStopDetails routeTime={this.order.pickupRouteTime} routeDescrip={this.order.pickupRouteDescrip} stop={this.order.pickupStop} />
                  </View>
                  <View style={styles.tile}>
                     <GCI18n title code='cmn.DELIVERY' />
                     <GCStopDetails routeTime={this.order.deliveryRouteTime} routeDescrip={this.order.deliveryRouteDescrip} stop={this.order.deliveryStop} />
                  </View>
                  <View style={{ height: 10 }} />
               </ScrollView>
               <View style={{ flex: .15, alignItems: 'center', justifyContent: 'center' }}>
                  {this.reschedule ?
                     <PrjButtonWithConfirm
                        buttonStyle={styles.orderButton}
                        i18n="cmnNEW.RESCHEDULE"
                        confirmI18n="cmnNEW.ChangeYourSchedule_"
                        onConfirm={async () => { await this.commitScheduleChanges(this.order) }}
                     /> :
                     <PrjButtonWithConfirm
                        // buttonStyle={{ color: COLORS.GC_THEME_DARK, fontWeight: 'bold'}}
                        buttonStyle={styles.orderButton}
                        i18n="cstNEW.SUBMIT_ORDER"
                        confirmI18n="cstNEW.SubmitOrderConfirm"
                        onConfirm={async () => { await this.submitOrder() }}
                     />
                  }
               </View>
            </View>
         </CstScreen >
      );
   } //end render

   submitOrder = async () => {

      let newOrder
      let newId

      try {
         this.setState({ applyMask: true }) //
         newId = await dwdbfsOrderAddNew(this.order)
         newOrder = await dwdbfsOrderGetById(newId)
      }
      catch (error) {
         //oops. we won't navigate from this screen .. so just return
         cmnAlertPopup({ titleI18n: 'cmnNEW.ERRORCreatingOrder', text: error.message }) //confirmed
         this.setState({ applyMask: false })
         return
      }

      try {
         cmnSendEmailAsync({
            to: newOrder.shopEmail,
            subject: `order ${newId} created.`,
            html: prjFormatOrderForEmail(newOrder)
         })
      }
      catch (error) {
         // annunciate error but we continue
         cmnAlertPopup({ title: 'Error sending email', text: error.message })
      }
      
      this.setState({ applyMask: false })
      this.props.navigation.navigate('CstPaymentOptions', { 'order': newOrder, 'isNewOrder': true })

   }

   //TODO do the order schedule changes in DB
   commitScheduleChanges = async (orderMod) => {
      try {
         this.setState({ applyMask: true }) //
         await dwdbfsOrderReschedule(orderMod)
         this.setState({ applyMask: false })
         this.props.navigation.popToTop()
      }
      catch (error) {
         cmnAlertPopup({ titleI18n: 'cmnNEW.ERRORModifyingOrder', text: error.message }) //confirmed
         this.setState({ applyMask: false })
      }

   }

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