import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { BackHandler } from 'react-native'
import { Platform } from 'react-native'

import { ListItem } from 'native-base';
import GCHeader from 'DWcmn/GCHeader'
import { CstScreen } from './CdsScreen';
import { PaymentMethodEnum } from 'DWcmn/Global'
import { dwdbfsOrderUpdateFields } from 'DWcmn/dwdbfsOrder'
import { hasBeenPickedUp } from 'DWcmn/PrjCmnFunctions'
import { GCI18n, GCText } from 'DWcmn/Gc'
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import CstSpinnerScreen from './CstSpinnerScreen';
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { prjToast } from 'DWcmn/PrjToast'
import { CST } from './CST'
import { COLORS } from 'DWcmn/Global'

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
export default class CstPaymentOptions extends Component {


   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
      };
      this.order = null
      this.isNewOrder = false
   } //end constuctor


   async componentDidMount() {
      this.order = this.props.navigation.getParam('order', null)
      this.isNewOrder = this.props.navigation.getParam('isNewOrder', false)
      if (Platform.OS === 'android') {
         this.unsubscribeBackHandler = BackHandler.addEventListener(
            'hardwareBackPress', () => { return true })
      }

      this.setState({ isComponentInitialized: true });
   }

   componentWillUnmount() {
      if (Platform.OS === 'android') { this.unsubscribeBackHandler && this.unsubscribeBackHandler.remove() }
   } //end componentWillUnmount


   render() {

      if (!this.state.isComponentInitialized) {
         return (
            <CstSpinnerScreen />
         );
      }

      //NOTE order is approved only for a shop that approves all fully priced orders by cust
      let cashOnPickupOkay = (this.order.isApproved && this.order.allowCashOnPickup && !hasBeenPickedUp(this.order.status))
      //TODO add special case where unpriced, driver can weigh and no specials //TODO

      return (
         <CstScreen>
            <GCHeader titleI18n='cstNEW.PaymentOptions'
               back={!this.isNewOrder} />
            <View style={styles.spacyBox}>
               <View style={{ flex: .5, justifyContent: 'center', alignItems: 'center' }}>
                  {this.isNewOrder && this.titleText('cstNEW.PaymentOptionsNewOrder')}

                  {(this.order.isApproved) ? <View>
                     {this.titleText('cstNEW.PaymentOptionsApproved')}
                  </View>
                     : <View>
                        {this.titleText('cstNEW.PaymentOptionsUnapproved')}
                     </View>}
               </View>

               {/* give pay now option if pay online available AND order is approved*/}
               {/* REALISTICALLY pay online will always be available                */}
               <View style={{ flex: .3 }}>
                  <View style={styles.paymentOption}>
                     {(this.order.allowOnline && this.order.isApproved) &&
                        <PaymentOption
                           id="KEYBOARD"
                           i18n="cstNEW.PayNow"
                           onPress={() => {
                              // if (true) { //TODO //DEBUG NO PAYMENT NOW
                              //    // if (CST.isDemoUser()) {
                              //    prjToast({ type: 'warning', text: 'Payment not allowed in demo mode' })
                              // }
                              // else {
                              //    this.props.navigation.navigate('CstPayment', { 'order': this.order })
                              // }
                              this.props.navigation.navigate('CstPayment', { 'order': this.order })
                           }
                           } />}

                     {/* give cash on pickup option if available*/}
                     {(cashOnPickupOkay) &&
                        <PaymentOption
                           id="ARROW_UP_OUTLINE"
                           i18n="cstNEW.PayCashOnPickup"
                           onPress={async () => {
                              await this.handleClick(this.order.id, PaymentMethodEnum.payPickup)
                           }} />
                     }

                     {/* give cash on delivery option if available */}
                     {this.order.allowCashOnDelivery &&
                        <PaymentOption
                           id="ARROW_DOWN_OUTLINE"
                           i18n="cstNEW.PayCashOnDelivery"
                           onPress={async () => {
                              await this.handleClick(this.order.id, PaymentMethodEnum.payDelivery)
                              // await dwdbfsOrderUpdatePaymentMethod(this.order.id, PaymentMethodEnum.payDelivery)
                              // this.props.navigation.popToTop()
                           }} />
                     }
                     {/* <View style={{ flex: .2, justifyContent: 'center', alignItems: 'center' }}> */}
                     {/* if no online payment then pay later makes no sense  */}
                     {/* they will choose pay on P or D */}
                     {(this.order.allowOnline) &&
                        <PaymentOption
                           id="CLOCK"
                           i18n={!this.order.isApproved ? "cmn.OKAY" : "cstNEW.PayOnlineLater"}
                           onPress={async () => {
                              await this.handleClick(this.order.id, PaymentMethodEnum.payLater)
                              // await dwdbfsOrderUpdatePaymentMethod(this.order.id, PaymentMethodEnum.payLater)
                              // this.props.navigation.popToTop()
                           }} />
                     }
                  </View>
               </View>
               <View style={{ flex: .2 }} />
            </View>
            {/* give padding at the buttom */}
            <View style={{ flex: .1 }} />

            {/* <GCFooterWithSingleIcon
               hide={this.order.paymentMethod == PaymentMethodEnum.initial}
               onPress={() => {
                  this.props.navigation.popToTop()
               }} /> */}

         </CstScreen>
      )
   } //end render

   titleText = (code) => {
      return (
         <GCI18n title code={code} style={{ textAlign: 'center' }} />
      )

   }

   //method will update the db and if successful do a nav goBack
   //on error it annunicates and returs
   handleClick = async (orderId, method) => {
      try {

         await dwdbfsOrderUpdateFields(this.order.id, { paymentMethod: method.enumKey })
         this.props.navigation.popToTop()
      }
      catch (error) {
         //any errors should have been handled by the dwdbfs call
      }
   }

}// end CstPaymentOptions 

//prop id .. the icon id
//prop i18n .. the text
//prop onPress
class PaymentOption extends Component {
   render() {
      return (
         <TouchableOpacity
            onPress={this.props.onPress}>
            <View style={styles.button}>
               <PrjIcon style={{ fontSize: 16, color: 'white' }} id={this.props.id} />
               <GCText>    </GCText>
               <GCI18n style={{ fontSize: 16, color: 'white' }} code={this.props.i18n} />
            </View>
         </TouchableOpacity>
      )
   }
   renderOLD() {
      return (
         <ListItem style={{ paddingTop: 10, paddingBottom: 10, marginLeft: 0 }} >
            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-start', width: '100%', alignItems: 'center' }}
               onPress={this.props.onPress}>
               <PrjIcon style={{ fontSize: 20, color: 'grey' }} id={this.props.id} />
               <GCText>    </GCText>
               <GCI18n style={{ fontSize: 20, color: 'grey' }} code={this.props.i18n} />
            </TouchableOpacity>
         </ListItem>
      )
   }
}

const styles = StyleSheet.create({
   paymentOption: {
      // borderWidth: .2,
      // borderColor: 'grey',
      // borderRadius: 10,
      // paddingTop: 10,
      // paddingBottom: 30,
      // paddingLeft: 20,
      // marginHorizontal: 10,
      // justifyContent: 'center',
      // alignItems: 'center',
      // backgroundColor: '#f7f7f7',
      // shadowColor: 'rgba(0, 0, 0, 0.1)',
      // shadowOpacity: .1,
      // elevation: 5,
      // shadowRadius: .8
   },
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
