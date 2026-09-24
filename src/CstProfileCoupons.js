import React, { Component } from 'react'

import { View } from 'react-native'
import { CdsScreen } from './CdsScreen';
import { CstCouponList } from './CstCouponList'
import GCHeader from 'DWcmn/GCHeader'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'
import { dwdbfsCouponsGetForCustomer } from 'DWcmn/dwdbfsCoupons'

//20230214 created

//prop user
export class CstProfileCoupons extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isComponentInitialized: false,
      };
      this.coupons = []
   }

   async componentDidMount() {
      try {
         this.coupons = await dwdbfsCouponsGetForCustomer(this.props.user.id)
      } catch (error) {
         cmnAlertPopup(error.message)
      }
      this.setState({ isComponentInitialized: true })
   }

   render() {
      if (!this.state.isComponentInitialized) { return (null); }

      return (
         <CdsScreen>

            <GCHeader back={this.props.onOkay} titleI18n='cmnNEW.CouponCode' />
            <CstCouponList readonly coupons={this.coupons} />

         </CdsScreen >
      )
   }


}// end CstProfileCoupons
