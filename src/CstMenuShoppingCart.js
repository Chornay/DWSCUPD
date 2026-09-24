import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'



import CstSpinnerScreen from './CstSpinnerScreen'
import { CstScreen } from './CdsScreen';
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import GCHeader from 'DWcmn/GCHeader'
import { CdsMenuLineDisplay } from './CdsMenuLineDisplay';
import { cdsMenuRenderSummaryBox } from './cdsMenuRenderSummaryBox'
import { cdsMenuPricelistUpdateTotals } from './cdsMenuPricelistUpdateTotals'
import { cdsMenuRenderNoteAboutItemInfo } from './cdsMenuRenderNoteAboutItemInfo'
import { APP } from 'DWcmn/APP'
import { LogBox } from 'react-native'
import { useRefresh } from 'DWcmn/prjUseRefresh'




//nav parameter priceList


export default function CstMenuShoppingCart({ navigation }) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const refresh = useRefresh()

   const priceListRef = useRef(null)
   const stackRef = useRef([]) //will contain the 'active' pricelist entries


   //one-time setup: pull the priceList from nav params and collect the selected entries
   useEffect(() => {

      //recursively collect every selected (included) entry into the stack
      function selectCategory(category) {
         category.entries.forEach((entry) => {
            if (entry.isCategory) {
               selectCategory(entry)
            }
            else {
               if (entry.included) {
                  stackRef.current.push(entry)
               }
            }
         })
      }

      priceListRef.current = navigation.getParam('priceList', null);

      //CLAUDE: a null priceList (or one without .top.entries) will throw here - needs protection/logging
      //extract all the pricelist entries that have been selected
      //this list will not change even if they decrement an item to zero
      stackRef.current = []
      priceListRef.current.top.entries.forEach((category) => {
         selectCategory(category)
      })

      setIsComponentInitialized(true)
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup, as the class did in componentDidMount
   }, [])


   //turn off warnings because we get a pesky warning when items get removed by decrementing
   useEffect(() => {
      LogBox.ignoreAllLogs(true)
      return () => LogBox.ignoreAllLogs(false)
   }, [])


   if (!isComponentInitialized) { //not finished our preparation yet
      return (
         <CstSpinnerScreen />
      );
   }

   const priceList = priceListRef.current

   return (
      <CstScreen>

         <GCHeader back cancel titleI18n='cmnNEW.ShoppingCart' />

         <ScrollView style={{ flex: 1 }}>
            <View style={{ height: 10 }} />
            {stackRef.current.map((item, index) => {
               return (<CdsMenuLineDisplay
                  onLeftTouch={() => { navigation.navigate('CdsMenuItemRemarkAndPhotoScreen', { 'line': item }) }}
                  changedSomething={() => {
                     cdsMenuPricelistUpdateTotals(priceList);
                     if (priceList.count <= 0) {
                        navigation.navigate('CstMenuMain')
                     }
                     else {
                        refresh()
                     }
                  }}
                  line={item} key={index}
                  useLongName></CdsMenuLineDisplay>)
            })}
         </ScrollView>

         {cdsMenuRenderNoteAboutItemInfo()}
         {cdsMenuRenderSummaryBox(priceList)}

         {/* FOOTER SECTION */}
         <GCFooterWithSingleIcon
            code='NEXT_IS_ORDER_REVIEW'
            hide={priceList.count == 0}
            onPress={() => {
               navigation.navigate('CstCheckout', { 'priceList': priceList })
            }}
         />
      </CstScreen>

   );
} //end CstMenuShoppingCart


const styles = StyleSheet.create({
})