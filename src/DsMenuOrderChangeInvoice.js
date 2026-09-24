import React, { Component } from 'react'
import { Platform, StyleSheet, View, ScrollView } from 'react-native'
import { COLORS } from 'DWcmn/Global'
import { DsScreen } from './CdsScreen';
import CdsSpinnerScreen from './CdsSpinnerScreen';
import CmnItemsList from 'DWcmn/CmnItemsList'
import { PrjSpacer } from 'DWcmn/Prj';
import { dwdbfsOrderAddNew, dwdbfsOrderGetById } from 'DWcmn/DWDBfs'
import { dwdbfsOrderChange } from 'DWcmn/dwdbfsOrder'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'
import { prjUpdateOrderPricing } from 'DWcmn/prjUpdateOrderPricing'
import { CmnTouchableEdit } from 'DWcmn/CmnTouchableEdit'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { strX } from 'DWcmn/I18n';
import GCHeader from 'DWcmn/GCHeader' //NOTE doing the default import
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { PrjButtonWithConfirm } from 'DWcmn/PrjButtonWithConfirm'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { prjIconEditableBox } from 'DWcmn/PrjIconComponents'
import {goBackToScreen} from 'DWcmn/prjNavigation'
// import DateTimePicker from '@react-native-community/datetimepicker';

//20250210 added reschedule functionality
//20260206 moved processCategory to be local

//This screen gives the customer a last look at the order before committing it to the db
//NOTE if the reschedule flag is set we are just reviewing a change in pickup and

// TODO we think that this color looks good '#0e9af1'

//param priceList
export default class DsMenuOrderChangeInvoice extends Component {


   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
         applyMask: false,
      };
      this.order = null
   } //end constuctor


   async componentDidMount() {

      this.priceList = this.props.navigation.getParam('priceList', null)
      this.order = await dwdbfsOrderGetById(this.priceList?.orderId)

      //throw away all the order items and then move ours from the pricelist
      this.order.items = []
      this.priceList.top.entries.forEach((category) => {
         this.processCategory(category)
      })
      prjUpdateOrderPricing(this.order) //TODO check do we need first time flag set??

      this.setState({ isComponentInitialized: true });
   }


//NOTE this pattern is like that in cstCheckoutOrderInit but we are not initializing any fields
processCategory = (category) => {
   category.entries.forEach((entry) => {
      if (entry.isCategory) {
         processCategory(entry)
      }
      else {
         if (entry.included) {
            // console.log('before',entry)
            const item={...entry}
            // console.log('after',item)
            //NOTE we could exclude items if we want eg const { password, token, ...safeCopy } = original;
            this.order.items.push(item)
         }
      }
   })

}//end processCategory


   render() {

      if (!this.state.isComponentInitialized) {
         return (
            <CdsSpinnerScreen />
         );
      }

      //   const cancelConfirmI18n = this.reschedule ? "cmnNEW.DiscardTheseChanges_" : null
      //TODO replace EDITABLE BOX with method

      return (

         <DsScreen>
            {(this.state.applyMask) && <PrjBusyMask />}
            {/* <GCHeader back cancel cancelConfirmI18n={this.reschedule ? "cmnNEW.DiscardTheseChanges_" : null}
               titleI18n='cmnNEW.ORDER_CHANGE_INVOICE'
               noBottomPadding /> */}
            <GCHeader back cancel
               titleI18n='cmnNEW.ORDER_CHANGE_INVOICE'
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
                  <View style={{ height: 10 }} />
               </ScrollView>
               <View style={{ flex: .15, alignItems: 'center', justifyContent: 'center' }}>
                  <PrjButtonWithConfirm
                     // buttonStyle={{ color: COLORS.GC_THEME_DARK, fontWeight: 'bold'}}
                     buttonStyle={styles.orderButton}
                     i18n="cmnNEW.SUBMIT_CHANGES"
                     confirmI18n="cmnNEW.OrderChangesConfirm_"
                     onConfirm={async () => { await this.submitChanges() }}
                  />

               </View>
            </View>
         </DsScreen >
      );
   } //end render

   submitChanges = async () => {
      try {
         this.setState({ applyMask: true }) //
         let newId = await dwdbfsOrderChange(this.order)
         this.setState({ applyMask: false })
         //NOTE both driver and shop use this screen name
         goBackToScreen(this.props.navigation,'OrderDetail')
      }
      catch (error) {
         cmnAlertPopup({ titleI18n: 'cmnNEW.ERRORModifyingOrder', text: error.message })
         this.setState({ applyMask: false })
      }

   }

}// end DsMenuOrderChangeInvoice

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