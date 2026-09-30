import React, { Component } from 'react'
import { View, Dimensions } from 'react-native'

import { dwdbfsShopGetPriceList } from 'DWcmn/dwdbfsShop'
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import { DsScreen } from './CdsScreen'
import { cdsMenuRenderSummaryBox } from './cdsMenuRenderSummaryBox'
import CdsMenuCategoryTiled from './CdsMenuCategoryTiled'
import { cdsMenuPricelistInit } from './cdsMenuPricelistInit'
import { cdsMenuPricelistUpdateTotals } from './cdsMenuPricelistUpdateTotals'
import { dsLoadPriceListFromOrder } from './dsMenuOrderChangeFunctions'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'


//this is a simplified CstMenuMain used when shop is reviewing and changing an order

//param order
export default class DsMenuOrderChangeStart extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isComponentInitialized: false
      };
      this.EZpick = false
      this.priceList = null

   }// end constructor()


   async componentDidMount() {

      const origOrder = this.props.navigation.getParam('order', null)
      this.priceList = await dwdbfsShopGetPriceList(origOrder.shopId)
         if (!this.priceList) {
         cmnAlertPopup({ text: "Error loading pricelist, can't continue" }) //OK
         this.props.navigation.pop()
      }

      await cdsMenuPricelistInit(this.priceList, null /*no QROrderCode*/)
      if (!dsLoadPriceListFromOrder(this.priceList, origOrder)){
         //removed the alert ... it is already annunciated ... and with more detail.
         // cmnAlertPopup({ text: "Error loading order into pricelist, can't continue" })
         this.props.navigation.pop()
      }
      cdsMenuPricelistUpdateTotals(this.priceList)
      //  ?? CstMenuPriceList.set(priceList)

      this.unsubscribeOrderChangeStartFocusListener = await this.props.navigation.addListener('didFocus', this.gotFocus)
      this.setState({ isComponentInitialized: true });
   }

   componentWillUnmount() {
      this.unsubscribeOrderChangeStartFocusListener?.remove();
   }

   gotFocus = () => {
      this.forceUpdate()
   }

   render() {

      if (!this.state.isComponentInitialized) { return null }

      return (
         <DsScreen>

            <GCHeader
               back={this.priceList.orderChangeCount == 0}
               cancel={this.priceList.orderChangeCount != 0}
               cancelConfirmI18n='cmnNEW.DiscardTheseChanges_'
               titleI18n='cmnNEW.CHANGE_ORDER' />

            {/* <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}> */}
            <View style={{ flex: 1, alignItems: 'center' }}>
               <CdsMenuCategoryTiled
                  category={this.priceList.top}
                  priceList={this.priceList}
               />

            </View>
            {cdsMenuRenderSummaryBox(this.priceList)}

            {/* FOOTER SECTION */}
            <GCFooterWithSingleIcon
               code='NEXT_IS_ORDER_CHANGE_SUMMARY'
               onPress={() => {
                  this.props.navigation.navigate('DsMenuOrderChangeSummary', { 'priceList': this.priceList })
               }}
            />
         </DsScreen>

      );
   } //end render

}//end DsMenuOrderChangeStart

