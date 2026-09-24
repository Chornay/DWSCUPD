import React, { useState, useEffect, useRef } from 'react'
// import firebase from '@react-native-firebase/app';
// import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import { functions, firebase } from '@react-native-firebase/functions';

import { View, TouchableOpacity, FlatList, BackHandler, Image, ImageBackground, StyleSheet, Text, Dimensions, ScrollView } from 'react-native'
import storage from '@react-native-firebase/storage';
import { Platform, Linking } from 'react-native'
import { withNavigation } from 'react-navigation';
import { SpinnerXYZ } from 'DWcmn/GCNB'
import { strX } from 'DWcmn/I18n'
import DeviceInfo from 'react-native-device-info'
import { SliderBox } from "react-native-image-slider-box";
// import firestore from '@react-native-firebase/firestore';
import GLOBALS from 'DWcmn/Global';
import { COLORS } from 'DWcmn/Global'
import { CstScreen } from './CdsScreen';
import { GCText, GCI18n } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import { PrjIcon } from 'DWcmn/PrjIconComponents'
import { PrjButtonSimple } from 'DWcmn/PrjButtonSimple'
import CmnCmdModal from 'DWcmn/CmnCmdModal'
import CstOrderTile from './CstOrderTile'
import { dwdbfsOrderLoadSnapshots } from 'DWcmn/DWDBfs'
import SplashScreen from 'react-native-splash-screen'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { PrjSpacer } from 'DWcmn/Prj'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import { CST } from './CST'
import { cmnSendEmailAsync } from 'DWcmn/cmnSendEmailAsync'
import { prjToast } from 'DWcmn/PrjToast'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'
import { cstCheckSystem } from './cstCheckSystem'


// import { LoginManager } from 'react-native-fbsdk-next';

import { cmnSignout } from 'DWcmn/CmnFunctions'
import { version } from 'react/cjs/react.production.min';
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { useRefresh } from 'DWcmn/prjUseRefresh'


//TODO disable back handler?
//TODO i18nPicker disabled for now

//20220913 removed EZPick
//20221218 removed greeting and picture for the 'no order' case
//20230211 added 'no order' image and use image for add button
//20230425 remove this.user ?
//20230501 tidy up and improve spinner
//20241001 sc image slider with url's from shops
//20241112 remove special processing for single order case
//         added QR code button, use icon footer instead of buttons
//20250218 load imageSlider from folder in firebase storage

// const { width, height } = Dimensions.get('window');
// const sliderBoxWidth = width / 2; // Height for each image, fitting 2 images vertically
const { width } = Dimensions.get('window');
const sliderBoxWidth = width; // Full screen width
const sliderBoxHeight = width / 2; // Each image's height to fit two images horizontally


const defaultImages = [
   require('../images/carousel/defaultSilder1.png'),
   require('../images/carousel/defaultSlider2.png'),
]

function CstMain(props) {

   const [orders, setOrders] = useState([])
   const [country, setCountry] = useState('en') //NOTE unused elsewhere - carried over as-is
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [selIndex, setSelIndex] = useState(-1) //NOTE unused elsewhere - carried over as-is

   const sliderCarouselRef = useRef([]) //will hold urls for images/urls to display

   const unsubscribeOrdersRef = useRef(null)
   const unsubscribeCustMainFocusListenerRef = useRef(null)
   const unsubscribeBackHandlerRef = useRef(null)

   const isMountedRef = useIsMounted()
   const refresh = useRefresh()

   const getOrders = (querySnapshot) => {
      const newOrders = dwdbfsOrderLoadSnapshots(querySnapshot)
      if (isMountedRef.current) {
         setOrders(newOrders)
         setIsComponentInitialized((wasInitialized) => {
            if (!wasInitialized) {
               SplashScreen.hide() //have to do this in case we navigate right here without logo screen
            }
            return true
         })
      }
   } //end getOrders

   //NOTE there's no direct hook equivalent of class forceUpdate() ... use the shared
   //useRefresh hook (per convention) rather than a manual toggle-state pattern
   const gotFocus = () => {
      refresh()
   }

   const refreshImageSlider = async () => {

      sliderCarouselRef.current = []

      //TODO use shopId
      //TODO what about the case where shopId is null?
      //CLAUDE no try/catch around these Storage calls - listAll()/getDownloadURL()
      //failures currently bubble up unhandled to the caller
      const comboShopPath = '/ComboShops/' + CST.getComboShopId() + '/Carousel'
      const shopPath = '/ComboShops/' + CST.getComboShopId() + '/Shops/' + CST.getShopId() + '/Carousel'
      const comboShopImageRefList = await firebase.storage().ref().child(comboShopPath).listAll();
      const shopImageRefList = await firebase.storage().ref().child(shopPath).listAll();

      for (const item of comboShopImageRefList.items) {
         sliderCarouselRef.current.push(await item.getDownloadURL())
      }
      for (const item of shopImageRefList.items) {
         sliderCarouselRef.current.push(await item.getDownloadURL())
      }
      if (sliderCarouselRef.current.length == 0) {
         for (const image of defaultImages) {
            sliderCarouselRef.current.push(image)
         }
      }

   }

   //async mount-time logic: system check, image slider preload, then the orders
   //listener (kept together since the listener genuinely can't be set up until
   //the check/preload above finish)
   //CLAUDE no try/catch here - cstCheckSystem/refreshImageSlider failures currently
   //become unhandled promise rejections with no user-facing toast or log
   useEffect(() => {
      (async () => {
         // the following may navigate to 'must update'/'can't continue' screens or do popup
         await cstCheckSystem(props.navigation)

         await refreshImageSlider()

         if (isMountedRef.current) {
            //CLAUDE onSnapshot only has a success callback - no error callback passed,
            //so a permissions error or dropped connection on this listener has nowhere to go
            unsubscribeOrdersRef.current = firestore().collection("Orders")
               .where("archive", "==", false)
               .where("custId", "==", CST.getCustId())
               .orderBy("creationDate", "desc")
               .onSnapshot(getOrders);
         }
      })()

      return () => {
         unsubscribeOrdersRef.current && unsubscribeOrdersRef.current();
      }
   }, [])

   //focus listener ... we need to know when we get focus because user may have changed in profile
   useEffect(() => {
      unsubscribeCustMainFocusListenerRef.current = props.navigation.addListener('didFocus', gotFocus)

      // NOTE not we don't set init flag until first db read.

      return () => {
         unsubscribeCustMainFocusListenerRef.current && unsubscribeCustMainFocusListenerRef.current.remove();
      }
   }, [])

   //hardware back key listener (returns true means no action taken)
   useEffect(() => {
      if (Platform.OS === 'android') {
         unsubscribeBackHandlerRef.current = BackHandler.addEventListener(
            'hardwareBackPress', () => { return true })
      }

      return () => {
         if (Platform.OS === 'android') { unsubscribeBackHandlerRef.current && unsubscribeBackHandlerRef.current.remove() }
      }
   }, [])

   //method links to the play store // app store
   const navigateToUpdateAtStore = async () => {
      const link = (Platform.OS === 'ios') ?
         'https://apps.apple.com/us/app/dobby-walla/id1658976462'
         : 'http://play.google.com/store/apps/details?id=com.dobbywalla.cust'
      try { await Linking.openURL(link) }
      catch (error) {
         // console.log(error.message)
         //CLAUDE error is silently discarded here - candidate for prjCloudLogError
      }
   }//end navigateToUpdateAtStore

   // renderFooter will render a footer with the appropriate buttons
   const renderFooter = () => {
      if (CST.getShopId()) {
         return (
            <GCFooterForIcons>
               <GCFooterCmdIcon code="PLACE_NEW_ORDER" onPress={() => props.navigation.navigate('CstMenuMain')} />
               <GCFooterCmdIcon code="SCAN_NEW_QR" onPress={() => props.navigation.navigate('CstMainNewOrderFromQR')} />
            </GCFooterForIcons>
         )
      }
      else {
         return (
            <GCFooterForIcons>
               <GCFooterCmdIcon code="SELECT_A_SHOP" onPress={() => props.navigation.navigate('CstMainShopSelect')} />
            </GCFooterForIcons>
         )
      }
   }

   const renderImageSlider = () => {

      return (
         <View style={styles.container}>
            <SliderBox
               images={sliderCarouselRef.current}
               sliderBoxHeight={sliderBoxHeight} // Height for each image
               sliderBoxWidth={sliderBoxWidth} // Full width of the screen
               ImageComponentStyle={styles.image}
               onCurrentImagePressed={index => console.log(`image ${index} pressed`)}
               dotColor="#204e94"
               inactiveDotColor="#90A4AE"
               paginationBoxStyle={styles.paginationBox}
               paginationBoxVerticalPadding={0}
               paginationBoxMargin={0}
               activeOpacity={0.5}
               autoplay
               autoplayInterval={5000}
               circleLoop
               resizeMode={'stretch'}
            />
         </View>
      )
   }

   const initDone = isComponentInitialized

   // NOTE - the pre-init screen looks just like the 'no-order' screen
   //        without the settings burger or new order button
   if ((!initDone) || (orders.length == 0)) {

      return (
         <CstScreen background>
            {initDone ?
               <GCHeader style={{ backgroundColor: 'transparent' }}
                  optionsBurger={() => { props.navigation.navigate('CstProfile') }}>
                  <Image
                     style={{ flex: 1, width: '80%', resizeMode: 'contain' }}
                     source={require('../images/company/textNoShadowDepthDarkLight.png')} />

               </GCHeader> :
               <GCHeader />}
            <View style={{ flex: 1, paddingHorizontal: GC_STD_MARGIN }}>
               <View style={{ flex: .3, bottom: 20, paddingTop: 10 }}>
                  {renderImageSlider()}
               </View>
               {/* <PrjSpacer size={20} /> */}
               <View style={{ flex: .1 }} />
               <View style={{ flex: .3, justifyContent: 'flex-start', alignItems: 'center', bottom: 20 }}>
                  <Image
                     style={{ flex: 1, width: '80%', resizeMode: 'cover' }}
                     source={require('../images/company/logoDoubleBlueNoText.png')} />
                  {/* source={require('../images/company/logoBlueNoShadow.png')} /> */}
               </View>
               <View style={{ flex: .25, justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                     style={{ flex: 1, width: '80%', resizeMode: 'contain' }}
                     source={require('../images/company/letBlue.png')} />
               </View>
               <View style={{ flex: .05 }} />
            </View>
            {initDone ? renderFooter() : <SpinnerXYZ />}

         </CstScreen >

      )
   }

   // else (have at least one order)
   return (
      <CstScreen background>
         <GCHeader style={{ backgroundColor: 'transparent' }}
            image={require('../images/company/textNoShadowDepthDarkLight.png')}
            optionsBurger={() => { props.navigation.navigate('CstProfile') }} />
         <View style={{ flex: 1, paddingHorizontal: GC_STD_MARGIN }}>
            <View style={{ flex: .3, }}>
               {renderImageSlider()}
            </View>
            <PrjSpacer size={20} />
            <View style={{ flex: .65 }}>
               <FlatList
                  data={orders}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => {
                     return (
                        <CstOrderTile order={item} />
                     )
                  }}
               ></FlatList>
            </View>
         </View>
         {renderFooter()}
      </CstScreen >
   )

} //end CstMain
const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
   image: {
      height: sliderBoxHeight,
      width: sliderBoxWidth,
      // width: '96%', // doesn't take the whole width of the screen...give some margin in between the images
   },
   paginationBox: {
      position: 'absolute',
      alignSelf: 'center',
      padding: 0,
      bottom: '5%', //Push the dots position higher
   },

});
export default withNavigation(CstMain); //FIX surely this is not necessary?