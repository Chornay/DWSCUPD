import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import CstSpinnerScreen from './CstSpinnerScreen'
import { CdsMenuCategory } from './CdsMenuCategory'
import { CstScreen } from './CdsScreen'
import GCHeader from 'DWcmn/GCHeader'
import { GCText } from 'DWcmn/Gc'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import CdsMenuCategoryTiled from './CdsMenuCategoryTiled';
import { prjPriceListItemLongName } from 'DWcmn/PrjCmnFunctions'
import { cdsMenuRenderSummaryBox } from './cdsMenuRenderSummaryBox'
import { cdsMenuPricelistUpdateTotals } from './cdsMenuPricelistUpdateTotals'
import { cdsMenuRenderNoteAboutItemInfo } from './cdsMenuRenderNoteAboutItemInfo'
import { cstPriceListCatNameInTitle } from './CstMenuPriceList'
import { CdsMenuInfoIcon } from './CdsMenuInfoIcon'
import { PrjIconButton } from 'DWcmn/Prj';
import { useRefresh } from 'DWcmn/prjUseRefresh'

//nav param category
//nav param priceList
//NOTE this component need priceList ONLY to be able to display the summary screen ... it's a bit gross
//NOTE we have a focus listener .. we refresh when we regain focus .. because changes may have happened
//     several levels down
export default function CdsMenuCategoryScreen({ navigation }) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const refresh = useRefresh()


   //redraw whenever we regain focus, then show the screen
   useEffect(() => {
      const focusSubscription = navigation.addListener('didFocus', refresh)
      setIsComponentInitialized(true)
      return () => focusSubscription.remove()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- subscribe once, as the class did in componentDidMount
   }, [])


   if (!isComponentInitialized) {
      return (
         <CstSpinnerScreen />
      );
   }

   //CLAUDE: null nav params for category/priceList will throw below - needs protection/logging
   const category = navigation.getParam("category", null)
   const priceList = navigation.getParam("priceList", null)


   //recalc totals and cause a render
   function toggle() {
      cdsMenuPricelistUpdateTotals(priceList)
      refresh()
   } //toggle


   return (
      <CstScreen blah={priceList.count}>

         {/* Header .. give cancel button if order in progress */}
         {/* We always show a back arrow to get back 'up' a level */}
         <GCHeader back
            cancel={priceList.count != 0}>
            <View style={{ flexDirection: 'row' }}>
               <GCText style={[PRJ_STYLES.headerText]}>{prjPriceListItemLongName(category)}   <CdsMenuInfoIcon line={category} />
               </GCText>
               <GCText>   </GCText>
               <PrjIconButton id='SEARCH'
                  style={[PRJ_STYLES.headerIcon]}
                  onPress={() => { navigation.navigate('CdsMenuSearchScreen', { 'priceList': priceList, 'category': category }) }}
                  // onPress={() => { navigation.navigate('CdsMenuSearchScreen', { 'priceList': priceList}) }}
               />
            </View>

            {/* {cstPriceListCatNameInTitle(category)} */}
         </GCHeader>

         {/* Display the contents of this category as either tiles or line items */}
         <View style={{ flex: 1 }}>
            {category.isTiled ?
               <CdsMenuCategoryTiled
                  category={category}
                  priceList={priceList}
               />
               :
               <CdsMenuCategory countChanged={toggle}
                  navigation={navigation}
                  category={category}
                  priceList={priceList}
                  isTop={true} />
            }
         </View>

         {priceList.count == 0 || category.isTiled || cdsMenuRenderNoteAboutItemInfo()}
         {cdsMenuRenderSummaryBox(priceList)}

         {/* FOOTER SECTION */}
         {priceList.orderChangeInProgress ?
            <GCFooterWithSingleIcon
               code='NEXT_IS_ORDER_CHANGE_SUMMARY'
               onPress={() => {
                  navigation.navigate('DsMenuOrderChangeSummary', { 'priceList': priceList })
               }}
            /> :
            <GCFooterWithSingleIcon
               code='NEXT_IS_OPTIONS'
               hide={priceList.count == 0}
               onPress={() => {
                  navigation.navigate('CstMenuOptions', { 'priceList': priceList })
               }}
            />
         }

      </CstScreen>

   );
} //end CdsMenuCategoryScreen