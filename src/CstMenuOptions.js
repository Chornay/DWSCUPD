import React, { useEffect, useRef, useState } from 'react'
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
import { cstPriceListCatNameInTitle } from './CstMenuPriceList'
import { CdsMenuInfoIcon } from './CdsMenuInfoIcon'
import { cdsExtractCategories } from './cdsMenuFunctions'
import { useRefresh } from 'DWcmn/prjUseRefresh'


//nav param priceList
export default function CdsMenuOptions({ navigation }) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const refresh = useRefresh()

   const priceListRef = useRef(null)
   const optionsCategoryRef = useRef(null)


   //one-time setup: pull the priceList from nav params and find the options category
   useEffect(() => {

      priceListRef.current = navigation.getParam("priceList", null)

      //CLAUDE: a null priceList (or one without .top.entries) will throw here - needs protection/logging
      //CLAUDE: cdsExtractCategories could also throw - consider try/catch + prjCloudLogError
      //check for an options category
      const sel = cdsExtractCategories(priceListRef.current.top.entries, { options: true, normal: false })
      //check this is what we want
      if (!sel || sel.entries.length == 0) {
         navigation.replace('CstMenuShoppingCart', { 'priceList': priceListRef.current })
      }
      else {
         optionsCategoryRef.current = sel.entries[0]
         setIsComponentInitialized(true)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup; navigation is stable for the life of this screen
   }, [])


   //redraw whenever we regain focus (e.g. coming back from the shopping cart)
   useEffect(() => {
      const focusSubscription = navigation.addListener('didFocus', refresh)
      return () => focusSubscription.remove()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- navigation is stable for the life of this screen
   }, [refresh])


   //recalc totals and cause a render
   function recalculateScreen() {
      cdsMenuPricelistUpdateTotals(priceListRef.current)
      refresh()
   } //recalculateScreen


   if (!isComponentInitialized) { return null }

   const priceList = priceListRef.current
   const category = optionsCategoryRef.current
   category.isTop = true //we don't want a header for the options display
   return (
      <CstScreen blah={priceList.count}>

         {/* Header .. give cancel button if order in progress */}
         {/* We always show a back arrow to get back 'up' a level */}
         <GCHeader back
            cancel={priceList.count != 0}>
            <GCText style={PRJ_STYLES.headerText}>{prjPriceListItemLongName(category)}   <CdsMenuInfoIcon line={category} /></GCText>
         </GCHeader>

         {/* The options can only be a list  */}
         <View style={{ flex: 1 }}>
            <CdsMenuCategory countChanged={recalculateScreen}
               navigation={navigation}
               category={category}
               priceList={priceList}
               isTop={true} />
         </View>

         {cdsMenuRenderSummaryBox(priceList)}

         {/* FOOTER SECTION */}
         <GCFooterWithSingleIcon
            code='NEXT_IS_SHOPPING_CART'
            onPress={() => {
               navigation.navigate('CstMenuShoppingCart', { 'priceList': priceList })
            }}
         />

      </CstScreen>

   );
} //end CdsMenuOptions