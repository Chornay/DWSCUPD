import React, { useState, useRef, useEffect } from 'react'
import { View, ScrollView } from 'react-native'


import { CstScreen } from './CdsScreen';
import { CST } from './CST'
import CstSpinnerScreen from './CstSpinnerScreen';
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import GCHeader from 'DWcmn/GCHeader'
import CmnItemsList from 'DWcmn/CmnItemsList';
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
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

const CstCheckout = ({ navigation }) => {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   //CLAUDE remarks is never set anywhere in this component so it is always null .. placeholder for a remarks input?
   const [remarks] = useState(null) //any remarks added will be here and put in order before we leave screen
   const fooOrderRef = useRef(null)
   const isMountedRef = useIsMounted()

   useEffect(() => {

      const init = async () => {
         //VERIFY cust
         //VERIFY shop

         //extract all the pricelist categories that have selected entries
         //fill an array 'tasks' in every bundle which has the 'lineItem' from the pricelist
         const priceList = navigation.getParam('priceList', null);
         //VERIFY priceList

         const order = await cstCheckoutOrderInit(priceList) //never throws
         if (!isMountedRef.current) return

         fooOrderRef.current = order
         setIsComponentInitialized(true)
      } //end init

      init()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-time only, priceList nav param is read once
   }, [])


   const shop = CST.getShop()

   if (!isComponentInitialized) {
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
                  <CmnItemsList order={fooOrderRef.current} readonly></CmnItemsList>
               </View>
               <View style={{ flex: .1 }} />
            </View>

         </ScrollView>

         {/* allow choice of service level iff the shop supports it */}
         {/* CLAUDE -1 means 'not offered' .. should be a named constant */}
         {(shop.surchargeExpress == -1 && shop.surchargeSameDay == -1) ?
            <GCFooterWithSingleIcon
               code='NEXT_IS_PICKUP'
               onPress={() => {
                  fooOrderRef.current.remarks = remarks
                  navigation.navigate('CstCheckoutSelectRoutePickup', { 'order': fooOrderRef.current })
               }} />
            :
            <GCFooterWithSingleIcon
               code='NEXT_IS_SERVICE_LEVEL'
               onPress={() => {
                  fooOrderRef.current.remarks = remarks
                  navigation.navigate('CstCheckoutServiceLevel', { 'order': fooOrderRef.current })
               }} />
         }
      </CstScreen >
   )
} //end CstCheckout

export default CstCheckout