import React, { useEffect, useState } from 'react'
import { View, FlatList } from 'react-native'

import { SpinnerXYZ } from 'DWcmn/GCNB'

import { CstScreen } from './CdsScreen';
import { GCI18n } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import CstOrderTile from './CstOrderTile'
import { dwdbfsOrderGetCustHistoryAsArray } from 'DWcmn/dwdbfsOrder'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { CST } from './CST'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'

//20250302 removed readonly from CstOrderTile render
//20260919 converted to functional component

//TODO disable back handler?
//prop onOkay
export function CstProfileHistory({ onOkay }) {

   const [orders, setOrders] = useState([])
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const isMountedRef = useIsMounted()


   //one-time setup: fetch the customer's archived orders
   useEffect(() => {

      async function loadOrders() {
         try {
            const loadedOrders = await dwdbfsOrderGetCustHistoryAsArray(CST.getCustId())
            if (isMountedRef.current) { setOrders(loadedOrders) }
         } catch (error) {
            prjCloudLogError('CstProfileHistory', error)
         }
         if (isMountedRef.current) { setIsComponentInitialized(true) }
      }

      loadOrders()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup, as the class did in componentDidMount
   }, [])


   function renderContent() {

      if (!isComponentInitialized) {
         return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
               <SpinnerXYZ />
            </View>)
      }

      if (orders.length == 0) {
         return (
            <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN, justifyContent: 'center', alignItems: 'center' }}>
               <GCI18n large code='cmnNEW.NoOrdersArchived' style={{ textAlign: 'center' }} />
            </View>)
      }

      return (
         <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
            <FlatList
               data={orders}
               keyExtractor={(item, index) => index.toString()}
               renderItem={({ item }) => {
                  return (
                     <CstOrderTile order={item} />
                  )
               }}
            />
         </View>)

   }//end renderContent


   return (
      <CstScreen>
         <GCHeader back={onOkay} titleI18n='cmnNEW.OrderHistory' />
         <View style={{ height: 10 }} />
         {renderContent()}
      </CstScreen>
   )

} //end CstProfileHistory