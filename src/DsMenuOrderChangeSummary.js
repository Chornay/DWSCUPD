import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { GCText, GCI18n } from 'DWcmn/Gc'
import CdsSpinnerScreen from './CdsSpinnerScreen'
import { DsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { CdsMenuLineDisplay } from './CdsMenuLineDisplay';
import { cdsMenuRenderSummaryBox } from './cdsMenuRenderSummaryBox'
import { COLORS } from 'DWcmn/Global';
import { cdsMenuPricelistUpdateTotals } from './cdsMenuPricelistUpdateTotals'
import { APP } from 'DWcmn/APP'
import { LogBox } from 'react-native'
import { GCFooterForIcons, GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'




//TODO driver/shop should NOT have write access to remarks/photos
//nav parameter priceList


export function DsMenuOrderChangeSummary() {

   const navigation = useNavigation()
   const { priceList = null } = useRoute().params ?? {}
   const refresh = useRefresh()

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)

   const stackRef = useRef([])
   const stackEZRef = useRef([])

   //recursively collect selected entries into stack or stackEZ depending on the top-level category's type
   function selectCategory(category, type) {
      category.entries.forEach((entry) => {
         if (entry.isCategory) {
            selectCategory(entry, type) //NOTICE we used parent's type
         }
         else {
            if (entry.included) {
               if (type == 'EZ') {
                  stackEZRef.current.push(entry)
               }
               else {
                  stackRef.current.push(entry)
               }
            }
         }
      })
   }

   function rebuildStacks() {
      stackRef.current = []
      stackEZRef.current = []
      priceList.top.entries.forEach((category) => {
         selectCategory(category, category.type)
      })
   }

   useEffect(() => {
      rebuildStacks()
      setIsComponentInitialized(true)
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup, as the class did in componentDidMount
   }, [])

   //turn off warnings because we get a pesky warning when items get removed by decrementing
   useEffect(() => {
      LogBox.ignoreAllLogs(true)
      return () => { LogBox.ignoreAllLogs(false) }
   }, [])


   useEffect(() => {
      return navigation.addListener('focus', updateAndRefreshScreen)
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh is a stable dispatch, navigation is stable per screen
   }, [])

   //recalc totals and cause a render
   function updateAndRefreshScreen() {
         cdsMenuPricelistUpdateTotals(priceList)
         rebuildStacks()
         refresh()
   } //updateAndRefreshScreen


   if (!isComponentInitialized) { //not finished our preparation yet
      return (
         <CdsSpinnerScreen />
      );
   }

   return (
      // <View><Text>Fooo</Text></View>
      <DsScreen>

         <GCHeader back cancel titleI18n='cmnNEW.ORDER_CHANGE_SUMMARY' />
         <View style={{ flex: 1 }}>
            {/* Stack EZ */}
            {(stackEZRef.current.length != 0) && <><View style={styles.titleBanner}>
               {/* //TODO add traslation */}
               <GCText large bold>EZ ORDER</GCText>
            </View>
               <ScrollView style={styles.eZContent}>
                  {stackEZRef.current.map((item, index) => {
                     return (<CdsMenuLineDisplay
                        onLeftTouch={() => { navigation.navigate('CdsMenuItemRemarkAndPhotoScreen', { 'line': item }) }}
                        changedSomething={() => {
                           cdsMenuPricelistUpdateTotals(priceList);
                           if (priceList.count <= 0) {
                              navigation.popToTop()
                           }
                           else {
                              refresh()
                           }
                        }}
                        line={item} key={index}
                        useLongName></CdsMenuLineDisplay>)
                  })}
               </ScrollView>

               <View style={styles.titleBanner}>
                  {/* //TODO add traslation */}
                  <GCText large bold>CHANGE ORDER</GCText>
               </View></>}

            <ScrollView style={styles.changeOrderContent}>
               {stackRef.current.map((item, index) => {
                  return (<CdsMenuLineDisplay
                     changedSomething={() => {
                        cdsMenuPricelistUpdateTotals(priceList);
                        if (priceList.count <= 0) {
                           navigation.popToTop()
                        }
                        else {
                           refresh()
                        }
                     }}
                     line={item} key={index}
                     useLongName></CdsMenuLineDisplay>)
               })}
            </ScrollView>
            {cdsMenuRenderSummaryBox(priceList)}

            {/* FOOTER SECTION */}
            <GCFooterForIcons>
               <GCFooterCmdIcon
                  code='SEARCH'
                  //??               hide={priceList.count == 0}
                  onPress={() => {
                     navigation.navigate('CdsMenuSearchScreen', { 'priceList': priceList })
                  }}
               />
               <GCFooterCmdIcon
                  code='NEXT_IS_ORDER_CHANGE_INVOICE'
                  onPress={() => {
                     navigation.navigate('DsMenuOrderChangeInvoice', { 'priceList': priceList })
                  }}
               />
            </GCFooterForIcons>
         </View>
      </DsScreen>

   );
} //end DsMenuOrderChangeSummary

const styles = StyleSheet.create({
   eZContent: {
      flexBasis: '50%',
      flexShrink: 1,
      flexGrow: 0,
   },
   changeOrderContent: {
      flexBasis: '50%',
      flexGrow: 1,
      flexShrink: 0,
   },
   titleBanner: {
      backgroundColor: COLORS.GC_HIGHLIGHT_IMPORTANT,
      flexDirection: 'row',
      height: 30,
      alignItems: 'center',
      justifyContent: 'center'
   }
})