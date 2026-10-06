import React, { useState, useEffect, useRef } from 'react'
import { View, Dimensions } from 'react-native'

import { dwdbfsShopGetPriceListThrows } from 'DWcmn/dwdbfsShop'
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import { DsScreen } from './CdsScreen'
import { cdsMenuRenderSummaryBox } from './cdsMenuRenderSummaryBox'
import CdsMenuCategoryTiled from './CdsMenuCategoryTiled'
import { cdsMenuPricelistInit } from './cdsMenuPricelistInit'
import { cdsMenuPricelistUpdateTotals } from './cdsMenuPricelistUpdateTotals'
import { dsLoadPriceListFromOrderThrows } from './dsMenuOrderChangeFunctions'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'


//this is a simplified CstMenuMain used when shop is reviewing and changing an order

//nav param order
export function DsMenuOrderChangeStart() {

   const navigation = useNavigation()
   const { order: origOrder = null } = useRoute().params ?? {}
   const refresh = useRefresh()

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)

   const priceListRef = useRef(null)

   useEffect(() => {
      (async () => {

         try {
            priceListRef.current = await dwdbfsShopGetPriceListThrows(origOrder.shopId)

            cdsMenuPricelistInit(priceListRef.current, null /*no QROrderCode*/)

            dsLoadPriceListFromOrderThrows(priceListRef.current, origOrder)
            cdsMenuPricelistUpdateTotals(priceListRef.current)
            setIsComponentInitialized(true)
         }
         catch (error) {
            prjCloudLogError('DsMenuOrderChangeStart pricelist read', error, { toastI18n: "cmnNEW.MsgDbReadError" })
            navigation.pop()
         }

      })()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, mirrors original componentDidMount
   }, [])

   useEffect(() => {
      return navigation.addListener('focus', refresh)
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh is a stable dispatch, navigation is stable per screen
   }, [])

   if (!isComponentInitialized) { return null }

   return (
      <DsScreen>

         <GCHeader
            back={priceListRef.current.orderChangeCount == 0}
            cancel={priceListRef.current.orderChangeCount != 0}
            cancelConfirmI18n='cmnNEW.DiscardTheseChanges_'
            titleI18n='cmnNEW.CHANGE_ORDER' />

         {/* <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}> */}
         <View style={{ flex: 1, alignItems: 'center' }}>
            <CdsMenuCategoryTiled
               category={priceListRef.current.top}
               priceList={priceListRef.current}
            />

         </View>
         {cdsMenuRenderSummaryBox(priceListRef.current)}

         {/* FOOTER SECTION */}
         <GCFooterWithSingleIcon
            code='NEXT_IS_ORDER_CHANGE_SUMMARY'
            onPress={() => {
               navigation.navigate('DsMenuOrderChangeSummary', { 'priceList': priceListRef.current })
            }}
         />
      </DsScreen>

   );
}//end DsMenuOrderChangeStart