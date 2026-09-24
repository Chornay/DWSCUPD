import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, View, Dimensions, TouchableOpacity, Image } from 'react-native'

import CstSpinnerScreen from './CstSpinnerScreen'
import { dwdbfsShopGetPriceList } from 'DWcmn/dwdbfsShop'
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import { CstScreen } from './CdsScreen'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { cdsMenuRenderSummaryBox } from './cdsMenuRenderSummaryBox'
import { cdsMenuRenderNoteAboutItemInfo } from './cdsMenuRenderNoteAboutItemInfo'
import { withNavigation } from 'react-navigation'
import CdsMenuCategoryTiled from './CdsMenuCategoryTiled'
import { CstMenuPriceList } from './CstMenuPriceList'
import { cdsMenuPricelistInit } from './cdsMenuPricelistInit'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { CST } from './CST'
import { COLORS } from 'DWcmn/Global';
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { PrjSpacer } from 'DWcmn/Prj'
import { PrjButtonSimple } from 'DWcmn/PrjButtonSimple'
import { cdsExtractCategories } from './cdsMenuFunctions'
import { prjVersionCheck } from 'DWcmn/prjVersionCheck'
import { PrjIconButton } from 'DWcmn/Prj';
import { prjToast } from 'DWcmn/PrjToast'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions';
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { useRefresh } from 'DWcmn/prjUseRefresh'

const { width: SCREEN_WIDTH } = Dimensions.get('window') || {};
const { height: SCREEN_HEIGHT } = Dimensions.get('window') || {};


//20220913 removed EZPICK
//TEMPORARY
//20250213 added orderIdFromQR parameter
//20250601 removed priceList from state
//         added selection of categories
//20250629 separated EZ and normal categories
//20250802 add categories style with image and description
//20260919 tightened selection layout, added CTA to detail choice, bulleted EZ copy, fixed typo
//20260924 functionalized


//NOTES on rendering the pricelist
//the priceList doubles as price list and order form
//it is divided into categories and each category has items
//each category can be expanded or collapsed BUT an item that has been selected will never disappear
//now the tricky bits.....
//when a line is changed it has to tell its component that it has changed .... because it (the line) may be disappearing
//  because it is not selected any more ... CdsMenuLineDisplay provides this.
//however the category flatlist must know to rerender .. hence extradata 'looks' at the toggle field
//at this level (main) we know that everything has rendered okay BUT we need to know the count so we as well
//  have to be informed .... countChanged() prop
//ahem ... we didn't use state variables to do all this .. maybe it would work, maybe not. It would NOT be simpler.

//param codeFromQr user has scanned a QR which has a code we want to save
//      WE ASSUME that it has been checked to be valid and not used....

const MODES = {
   INIT: 0,
   SELECT: 20,
   EZ: 30,
   DETAIL: 50
}

function CstMenuMain({ navigation }) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [mode, setMode] = useState(MODES.INIT)

   const priceListRef = useRef(null)
   const selectedCategoriesEZRef = useRef(null)
   const selectedCategoriesDetailRef = useRef(null)

   const isMountedRef = useIsMounted()
   const refresh = useRefresh()

   //async mount-time logic: fetch/init the price list, version check, then set mode
   //CLAUDE no try/catch here - dwdbfsShopGetPriceList/cdsMenuPricelistInit failures
   //currently become unhandled promise rejections with no user-facing toast or log.
   //Also note navigation.pop() below (on a stale app version) isn't isMounted-guarded -
   //if the user has already navigated away by the time the version check resolves,
   //this would pop on an unmounted screen.
   useEffect(() => {
      (async () => {
         const codeFromQr = navigation.getParam('codeFromQr', null)
         let priceList = await dwdbfsShopGetPriceList(CST.getShopId())
         if (!priceList) {
            priceList = { isCategory: true, isTiled: true, top: { entries: [] } }
         }

         await cdsMenuPricelistInit(priceList, codeFromQr)

         if (!isMountedRef.current) { return }

         if (!prjVersionCheck(priceList.appVersion)) {
            { prjToast({ type: 'warning', pad: 3, i18n: 'cmnNEW.PleaseUpdateYourApp' }) }
            navigation.pop()
         }

         priceListRef.current = priceList
         CstMenuPriceList.set(priceList)
         selectedCategoriesEZRef.current = cdsExtractCategories(priceList.top.entries, { EZ: true, normal: false })
         selectedCategoriesDetailRef.current = cdsExtractCategories(priceList.top.entries, {})

         setMode(selectedCategoriesEZRef.current.entries.length == 0 ? MODES.DETAIL : MODES.SELECT)
         setIsComponentInitialized(true)
      })()
   }, [])

   //focus listener
   useEffect(() => {
      const unsubscribeMenuMainFocusListener = navigation.addListener('didFocus', gotFocus)

      return () => {
         unsubscribeMenuMainFocusListener?.remove();
      }
   }, [])

   const gotFocus = () => {
      refresh()
   }

   const renderSelection = () => {
      return (
         <CstScreen>

            {/* Header .. give cancel button if order in progress otherwise a back arrow */}
            <GCHeader back={priceListRef.current.count == 0}
               noBottomPadding
               cancel={priceListRef.current.count != 0}
               titleI18n='cst.New_Order' />

            <View style={styles.selection}>
               {renderDetailChoice()}
               {renderDivider()}
               {renderEZ()}
            </View>

         </CstScreen>

      );
   }

   const renderCategories = (categories, allowSearch = true) => {
      return (
         <CstScreen>

            {/* Header .. give cancel button if order in progress otherwise a back arrow */}
            <GCHeader back={priceListRef.current.count == 0}
               noBottomPadding
               cancel={priceListRef.current.count != 0}
            >
               <View style={{ flexDirection: 'row' }}>
                  <GCI18n
                     style={[PRJ_STYLES.headerText]}
                     detail title code='cst.New_Order' />
                  {allowSearch && <>
                     <GCText>   </GCText>
                     <PrjIconButton id='SEARCH'
                        style={[PRJ_STYLES.headerIcon]}
                        onPress={() => { navigation.navigate('CdsMenuSearchScreen', { 'priceList': priceListRef.current }) }}
                     />
                  </>}
               </View>
            </GCHeader>
            <View style={{ flex: 1, alignItems: 'center' }}>
               <CdsMenuCategoryTiled
                  category={categories}
                  priceList={priceListRef.current}
               />
            </View>
            {priceListRef.current.count == 0 || priceListRef.current.top.isTiled || cdsMenuRenderNoteAboutItemInfo()}
            {cdsMenuRenderSummaryBox(priceListRef.current)}

            {/* FOOTER SECTION */}
            <GCFooterWithSingleIcon
               code='NEXT_IS_OPTIONS'
               hide={priceListRef.current.count == 0}
               onPress={() => {
                  navigation.navigate('CstMenuOptions', { 'priceList': priceListRef.current })
               }}
            />
         </CstScreen>

      );
   }

   //thin "or" divider between the two order-start choices
   const renderDivider = () => {
      return (
         <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            {/* //TODO put translation */}
            <GCText>OR</GCText>
            <View style={styles.dividerLine} />
         </View>
      )
   }
   
   const renderEZ = () => {
      return (
         <View style={styles.ez}>
            <View style={styles.cardHeaderRow}>
               <View style={styles.iconCircle}>
                  <Image
                     style={styles.image}
                     source={require('../images/pricelist/ezBag.png')}
                  />
               </View>
               <View style={{ flex: 1 }}>
                  <GCI18n title inverse bold code='cmnNEW.EZ_QUICK' />
                  {/* //TODO put translation */}
                  <GCText inverse detail>Fastest way to start</GCText>
               </View>
            </View>
            <PrjSpacer size={14} />
            <View>
               {/* //TODO put translation */}
               <GCText inverse style={styles.txtHorizSpc}>{'\u2713  '}Hand us your laundry bag</GCText>
               {/* //TODO put translation */}
               <GCText inverse style={styles.txtHorizSpc}>{'\u2713  '}We count items and update the price for you</GCText>
            </View>
            <PrjSpacer size={16} />
            <TouchableOpacity
               onPress={() => { setMode(MODES.EZ) }}
               style={styles.button}>
               {/* //TODO put translation */}
               <GCText title>Start EZ order</GCText>
            </TouchableOpacity>
         </View>
      )
   }


   const renderDetailChoice = () => {
      return (
         <View style={styles.detailChoice}>
            <View style={styles.cardHeaderRow}>
               <View style={styles.iconCircle}>
                  <Image
                     source={require('../images/pricelist/Detail.png')}
                     style={styles.image}
                  />
               </View>
               <View style={{ flex: 1 }}>
                  {/* //TODO put translation */}
                  <GCI18n title bold code='cmnNEW.ITEMIZE_YOUR_ORDER' />
                  {/* //TODO put translation */}
                  <GCText>Count each item yourself for full control.</GCText>
               </View>
            </View>
            <PrjSpacer size={16} />
            <TouchableOpacity
               onPress={() => { setMode(MODES.DETAIL) }}
               style={styles.buttonOutline}>
               {/* //TODO put translation */}
               <GCText title>Start manual order</GCText>
            </TouchableOpacity>
         </View>
      )

   }

   if (!isComponentInitialized) { //not finished our preparation yet
      return (
         <CstSpinnerScreen />
      );
   }

   switch (mode) {
      case MODES.INIT:
         return (
            <CstSpinnerScreen />
         )
      case MODES.SELECT:
         return (renderSelection())
      case MODES.EZ:
         return (renderCategories(selectedCategoriesEZRef.current, false))
      case MODES.DETAIL:
         return (renderCategories(selectedCategoriesDetailRef.current))
   }

}//end CstMenuMain
export default withNavigation(CstMenuMain)


const styles = StyleSheet.create({
   selection: {
      flex: 1,
      paddingTop: 20,
      paddingHorizontal: GC_STD_MARGIN,
   },

   cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
   },
   iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
      overflow: 'hidden',
   },
   image: {
      width: 26,
      height: 26,
      resizeMode: 'contain',
   },
   cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
   },
   cardTitleInverse: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
      color: COLORS.GC_ABS_WHITE,
   },
   cardSubtitle: {
      fontSize: 13,
      opacity: 0.7,
   },
   cardSubtitleAccent: {
      fontSize: 13,
      color: COLORS.GC_BUTTON_TEXT,
   },
   txtHorizSpc: {
      marginBottom: 4,
   },

   dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 12,
   },
   dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: COLORS.GC_TILE_BORDER || 'rgba(0,0,0,0.1)',
   },
   dividerText: {
      marginHorizontal: 10,
      fontSize: 12,
      opacity: 0.6,
   },

   detailChoice: {
      justifyContent:'space-between',
      width: '100%',
      height:200,
      padding: 20,
      borderRadius: 10,
      backgroundColor: COLORS.GC_ABS_WHITE,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOpacity: 2,
      shadowRadius: 5,
      shadowOffset: { height: 4 }, // SC added shadowOffset for iOS
      elevation: 5,

   },
   ez: {
      justifyContent:'space-between',
      width: '100%',
      height:200,
      padding: 20,
      borderRadius: 10,
      backgroundColor: COLORS.GC_THEME_DARK,

      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOpacity: 2,
      shadowRadius: 5,
      shadowOffset: { height: 4 }, // SC added shadowOffset for iOS
      elevation: 5,

   },
   button: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      borderStyle: 'solid',
      paddingTop: 10,
      paddingBottom: 10,
      width: '100%',
      height: 44,
      backgroundColor: COLORS.GC_BUTTON_TEXT
   },
   buttonOutline: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.GC_THEME_DARK,
      borderStyle: 'solid',
      paddingTop: 10,
      paddingBottom: 10,
      width: '100%',
      height: 44,
      backgroundColor: 'transparent'
   },
   image: {
      flex: 1,
      resizeMode: 'contain',
      width: '100%'
   },
   detailImageWrap: {
      width: 50,
      height: 50,
      marginRight: 12
   },
   bodyTile: {
      flexDirection: 'row',
      alignItems: 'center'
   }

})