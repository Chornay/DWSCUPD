import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import cloneDeep from 'lodash/cloneDeep'
import { CstScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import CstSpinnerScreen from './CstSpinnerScreen'
import { CmnCouponList } from 'DWcmn/CmnCouponList';
import { CST } from './CST'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { dwdbfsCouponsGetForCustomer } from 'DWcmn/dwdbfsCoupons'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'

//NOTE that if there are no coupons we will navigate (actually replace) to the summary screen
export function CstCheckoutCoupon(props) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [selectedCoupon, setSelectedCoupon] = useState(null)
   const orderRef = useRef(null)
   const couponsRef = useRef([])
   const isMountedRef = useIsMounted()

   useEffect(() => {
      (async () => {
         try {
            orderRef.current = props.navigation.getParam('order', null)
            couponsRef.current = await dwdbfsCouponsGetForCustomer(orderRef.current.custId)
            if (!isMountedRef.current) { return }
            if (couponsRef.current.length == 0) {
               props.navigation.replace('CstCheckoutSummary', { 'order': orderRef.current })
            } else {
               setIsComponentInitialized(true)
            }
         } catch (error) {
            prjCloudLogError('CstCheckoutCoupon', error, {toast:'Error loading coupons'}) //OKAY
            if (isMountedRef.current) { setIsComponentInitialized(true) }
         }
      })()
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   if (!isComponentInitialized) { return (<CstSpinnerScreen />); }
   return (
      <CstScreen>
         <GCHeader back cancel
            titleI18n='cmnNEW.CouponCode' />
         <View style={{ height: 10 }} />
         <View style={{ flex: 1 }}>
            <CmnCouponList
               coupons={couponsRef.current}
               onSelect={(coupon) => { setSelectedCoupon(coupon) }}
            />
         </View>
         {/* we move to final review with or without coupon */}
         {selectedCoupon ?
            <GCFooterWithSingleIcon
               code='NEXT_IS_FINAL_WITH_COUPON'
               onPress={() => {
                  orderRef.current.coupon = cloneDeep(selectedCoupon)
                  props.navigation.navigate('CstCheckoutSummary', { 'order': orderRef.current })
               }} />
            :
            <GCFooterWithSingleIcon
               code='NEXT_IS_FINAL_REVIEW'
               onPress={() => {
                  orderRef.current.coupon = null
                  props.navigation.navigate('CstCheckoutSummary', { 'order': orderRef.current })
               }}
            />
         }
      </CstScreen >
   )

} //end CstCheckoutCoupon