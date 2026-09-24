import React, { Component } from 'react'
import { StyleSheet, View, FlatList, TouchableOpacity, Text, Linking } from 'react-native'
import { DsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import CdsSpinnerScreen from './CdsSpinnerScreen'
import { CmnQrScan } from 'DWcmn/CmnQrScan'
import { prjToast } from 'DWcmn/PrjToast'
import { dwdbfsOrderGetByQrCode } from 'DWcmn/dwdbfsOrder'

//20250208 added check to make sure that order exists
//20251012 changed to navigate back two levels from detail ... skipping us.

//A screen to input a QR code for driver/shop and display an order if:
// it is valid QR  data with a code parameter
// it exists
// it is 'ours'
//Order detail will be displayed by navigating to OrderDetail screen (different for driver/shop)
export default class DsScanQrForOrder extends Component {

   constructor() {
      super();

      this.state = {
         isComponentInitialized: false,
      };
   }

   async componentDidMount() {
      this.setState({ isComponentInitialized: true })
   }
   render() {

      if (!this.state.isComponentInitialized) { //not finished our preparation yet
         return (
            <CdsSpinnerScreen />
         );
      } //end if 
      return (
         <DsScreen>
            <GCHeader back titleI18n='cmnNEW.QrScanner' />
            <CmnQrScan onScan={this.onScan} />
         </DsScreen >
      )
   } //end render

   //if we get an valid id fromt the QR then display its detail
   //NOTE we 'tell' OrderDetail to pop two levels so it won't come back to us on back arrow
   //TODO check shop is correct
   onScan = async (data, params) => {
      if (!data) { prjToast({ i18n: 'cmnNEW.MsgQRNoData' }) }
      else if (!params) { prjToast({ i18n: 'cmnNEW.MsgQRInvalid' }) }
      else if (!params.code) { prjToast({ i18n: 'cmnNEW.MsgQrNoCode' }) }
      else {
         let order = await dwdbfsOrderGetByQrCode(params.code)
         if (!order) { 
            prjToast({ i18n: 'cmnNEW.MsgQROrderDoesNotExist' }, { code: params.code }) }
         else {
            //NOTE we 'replace' not 'navigate' .. don't want to come back here
            this.props.navigation.replace('OrderDetail', { 'id': order.id })
            return
         }
      }
   }

} //end DrvScanQrForOrder


