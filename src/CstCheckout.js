import React, { Component } from 'react'
import { View, ScrollView } from 'react-native'


import { CstScreen } from './CdsScreen';
import { CST } from './CST'
import CstSpinnerScreen from './CstSpinnerScreen';
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import GCHeader from 'DWcmn/GCHeader'
import CmnItemsList from 'DWcmn/CmnItemsList';
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { cstCheckoutOrderInit } from './cstCheckoutOrderInit';

//20230514 moved init code to a separate function




//nav parameter priceList

//CstCheckout takes data from the pricelist and creates an order
//  it picks out any items selected in the priceList and includes them in the order
//  it calculates pricing details (isPrice, totalPrice) including possible delivery charge 
//     or service level surcharge
//this order is used from here on, there should be no reference back to priceList
//NOTE that in the pricelist an item remark may or not be there (and we use that fact)
//     BUT in the order a 'missing' item remark is null

export default class CstCheckout extends Component {

   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
         toggle: false,
         remarks: null, //any remarks added will be here and put in order before we leave screen
      };
      this.fooOrder = null
   }

   async componentDidMount() {

      //VERIFY cust
      //VERIFY shop

      //extract all the pricelist categories that have selected entries
      //fill an array 'tasks' in every bundle which has the 'lineItem' from the pricelist
      let priceList = this.props.navigation.getParam('priceList', null);
      //VERIFY priceList

      this.fooOrder = await cstCheckoutOrderInit(priceList)

      this.setState({ isComponentInitialized: true });
   } //end componentDidMount


   render() {
      const shop = CST.getShop()

      if (!this.state.isComponentInitialized) {
         return (
            <CstSpinnerScreen />
         );
      } //end if 
      return (
         <CstScreen>

            <GCHeader back cancel titleI18n='cst.Your_Order' />

            {/* BODY SECTION */}
            <ScrollView style={{ flex: 1 }}>
               <View style={{
                  flex: 1, paddingLeft: 6,
                  marginHorizontal: GC_STD_MARGIN,
                  marginTop: 10, borderTopRightRadius: 20, borderTopLeftRadius: 20
               }}>
                  <View style={{ flex: .9 }}>
                     <CmnItemsList order={this.fooOrder} readonly></CmnItemsList>
                  </View>
                  <View style={{ flex: .1 }} />
               </View>

            </ScrollView>

            {/* allow choice of service level iff the shop supports it */}
            {(shop.surchargeExpress == -1 && shop.surchargeSameDay == -1) ?
               <GCFooterWithSingleIcon
                  code='NEXT_IS_PICKUP'
                  onPress={() => {
                     this.fooOrder.remarks = this.state.remarks
                     this.props.navigation.navigate('CstCheckoutSelectRoutePickup', { 'order': this.fooOrder })
                  }} />
               :
               <GCFooterWithSingleIcon
                  code='NEXT_IS_SERVICE_LEVEL'
                  onPress={() => {
                     this.fooOrder.remarks = this.state.remarks
                     this.props.navigation.navigate('CstCheckoutServiceLevel', { 'order': this.fooOrder })
                  }} />
            }
         </CstScreen >
      )
   } //end render

} //end CstCheckout
