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

function CstMenuMain(props) {

   const [toggle, setToggle] = useState(false) //NOTE unused elsewhere - carried over as-is
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
         const codeFromQr = props.navigation.getParam('codeFromQr', null)
         let priceList = await dwdbfsShopGetPriceList(CST.getShopId())
         if (!priceList) {
            priceList = { isCategory: true, isTiled: true, top: { entries: [] } }
         }

         await cdsMenuPricelistInit(priceList, codeFromQr)

         if (!isMountedRef.current) { return }

         if (!prjVersionCheck(priceList.appVersion)) {
            { prjToast({ type: 'warning', pad: 3, i18n: 'cmnNEW.PleaseUpdateYourApp' }) }
            props.navigation.pop()
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
      const unsubscribeMenuMainFocusListener = props.navigation.addListener('didFocus', gotFocus)

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
                        onPress={() => { props.navigation.navigate('CdsMenuSearchScreen', { 'priceList': priceListRef.current }) }}
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
                  props.navigation.navigate('CstMenuOptions', { 'priceList': priceListRef.current })
               }}
            />
         </CstScreen>

      );
   }

   const renderEZ = () => {
      return (
         <View style={styles.ez}>
            {/* Big title */}
            <View style={{ flex: .3 }}>
               <Image
                  style={styles.image}
                  source={require('../images/pricelist/ezBag.png')}
               />
            </View>
            <PrjSpacer size={10} />
            {/* Image and description*/}
            <View style={{ flex: .7 }}>
               <View style={{}}>
                  <GCI18n fit large bold inverse code='cmnNEW.EZ_QUICK' />
               </View>
               <PrjSpacer size={10} />
               <View>
                  {/* //TODO put translation */}
                  <GCText inverse>Give use your laundry bag</GCText>
                  <GCText inverse>We will count your items and update the price in the app for you</GCText>
               </View>
               <PrjSpacer size={10} />
               <TouchableOpacity
                  onPress={() => { setMode(MODES.EZ) }}
                  style={styles.button}>
                  <GCText title>START EZ ORDER</GCText>
               </TouchableOpacity>
            </View>
         </View>
      )
   }

   const renderDetailChoice = () => {
      return (
         <TouchableOpacity
            onPress={() => { setMode(MODES.DETAIL) }}
         >
            <View style={styles.detailChoice}>
               {/* Big title */}
               <View style={{ flex: .3 }}>
                  <GCI18n fit large bold code='cmnNEW.ITEMIZE_YOUR_ORDER' />
               </View>
               <PrjSpacer size={10} />
               {/* Image and description*/}
               <View style={{ flex: .7, }}>
                  <View style={styles.bodyTile}>
                     <View style={{ flex: .3, paddingRight: 10 }}>
                        <Image
                           source={require('../images/pricelist/Detail.png')}
                           style={styles.image}
                        />
                     </View>
                     {/* //TODO put translation */}
                     <View style={{ flex: .7 }}>
                        <GCText>Prefer to count your own clothes? List your own items for full control and clarity.</GCText>
                     </View>
                  </View>
               </View>
            </View>
         </TouchableOpacity>
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
         return (renderCategories(selectedCategoriesEZRef.current, allowSearch = false))
      case MODES.DETAIL:
         return (renderCategories(selectedCategoriesDetailRef.current))
   }

}//end CstMenuMain
export default withNavigation(CstMenuMain)


const styles = StyleSheet.create({
   selection: {
      flex: 1,
      justifyContent: 'space-between',
      paddingTop: 100,
      paddingHorizontal: GC_STD_MARGIN,
      backgroundColor: COLORS.GC_TILE_BK,

      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOpacity: 2,
      shadowRadius: 5,
      shadowOffset: { height: 4 }, // SC added shadowOffset for iOS
      elevation: 5,
      borderWidth: 10,
      borderTopColor: COLORS.GC_ABS_WHITE,
      borderLeftColor: COLORS.GC_ABS_WHITE,
      borderRightColor: COLORS.GC_ABS_WHITE,

   },

   detailChoice: {
      width: '100%',
      height: 200,
      padding: 20,
      borderRadius: 10,
      marginBottom: 10,
      backgroundColor: COLORS.GC_ABS_WHITE,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOpacity: 2,
      shadowRadius: 5,
      shadowOffset: { height: 4 }, // SC added shadowOffset for iOS
      elevation: 5,

   },
   ez: {
      flexDirection: 'row',
      width: '100%',
      height: 200,
      padding: 20,
      borderRadius: 10,
      marginBottom: 10,
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
      paddingLeft: 30,
      paddingRight: 30,
      width: 'auto',
      height: 40,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOpacity: 2,
      shadowRadius: 5,
      shadowOffset: { height: 4 }, // SC added shadowOffset for iOS
      elevation: 5,
      backgroundColor: COLORS.GC_BUTTON_TEXT
   },
   image: {
      flex: 1,
      resizeMode: 'contain',
      width: '100%'
   },
   bodyTile: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
   }

})