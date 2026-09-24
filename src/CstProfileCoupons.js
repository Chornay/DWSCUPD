import React, { useEffect, useRef, useState } from 'react'

import { CdsScreen } from './CdsScreen';
import { CmnCouponList } from 'DWcmn/CmnCouponList'
import GCHeader from 'DWcmn/GCHeader'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { dwdbfsCouponsGetForCustomer } from 'DWcmn/dwdbfsCoupons'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'

//20230214 created
//20260919 converted to functional component

//prop user
//prop onOkay .. back button pressed
export function CstProfileCoupons({ user, onOkay }) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const isMountedRef = useIsMounted()

   const couponsRef = useRef([])


   //one-time setup: fetch the customer's coupons
   useEffect(() => {

      async function loadCoupons() {
         try {
            couponsRef.current = await dwdbfsCouponsGetForCustomer(user.id)
         } catch (error) {
            prjCloudLogError('CstProfileCoupons', error)
         }
         if (isMountedRef.current) { setIsComponentInitialized(true) }
      }

      loadCoupons()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup, as the class did in componentDidMount
   }, [])


   if (!isComponentInitialized) { return (null); }

   return (
      <CdsScreen>

         <GCHeader back={onOkay} titleI18n='cmnNEW.CouponCode' />
         <CmnCouponList readonly coupons={couponsRef.current} />

      </CdsScreen>
   )

}// end CstProfileCoupons