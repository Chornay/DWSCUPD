import React, { Component } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import cloneDeep from 'lodash/cloneDeep'
import { CstScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import CstSpinnerScreen from './CstSpinnerScreen'
import { CstCouponList } from './CstCouponList';
import { CST } from './CST'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'
import { dwdbfsCouponsGetForCustomer } from 'DWcmn/dwdbfsCoupons'

//NOTE that if there are no coupons we will navigate (actually replace) to the summary screen
export class CstCheckoutCoupon extends Component {

   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
         selectedCoupon: null
      };
      this.order = null
      this.coupons = []
   } //end constructor 

   async componentDidMount() {
      try {
         this.order = this.props.navigation.getParam('order', null)
         this.coupons = await dwdbfsCouponsGetForCustomer(this.order.custId)
         if (this.coupons.length == 0) {
            this.props.navigation.replace('CstCheckoutSummary', { 'order': this.order })
         } else {
            this.setState({ isComponentInitialized: true })

         }
      } catch (error) {
         cmnAlertPopup(error.message)
         this.setState({ isComponentInitialized: true })
      }
   } //end componentDidMount

   render() {
      if (!this.state.isComponentInitialized) { return (<CstSpinnerScreen />); }
      return (
         <CstScreen>
            <GCHeader back cancel
               titleI18n='cmnNEW.CouponCode' />
            <View style={{ height: 10 }} />
            <View style={{ flex: 1 }}>
               <CstCouponList
                  coupons={this.coupons}
                  onSelect={(coupon) => { this.setState({ selectedCoupon: coupon }) }}
               />
            </View>
            {/* we move to final review with or without coupon */}
            {this.state.selectedCoupon ?
               <GCFooterWithSingleIcon
                  code='NEXT_IS_FINAL_WITH_COUPON'
                  onPress={() => {
                     this.order.coupon = cloneDeep(this.state.selectedCoupon)
                     this.props.navigation.navigate('CstCheckoutSummary', { 'order': this.order })
                  }} />
               :
               <GCFooterWithSingleIcon
                  code='NEXT_IS_FINAL_REVIEW'
                  onPress={() => {
                     this.order.coupon = null
                     this.props.navigation.navigate('CstCheckoutSummary', { 'order': this.order })
                  }}
               />
            }
         </CstScreen >
      )

   } //end render

} //end CstCheckoutCoupon

