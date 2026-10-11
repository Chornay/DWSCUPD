import React, { useState, useEffect, useRef } from 'react'
import { View } from 'react-native'
import firebase from '@react-native-firebase/app';
import { cmnSignout } from 'DWcmn/CmnFunctions'

import { CdsScreen } from './CdsScreen';
import { PrjSpacer } from 'DWcmn/Prj';
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { isBlank } from 'DWcmn/PrjCmnFunctions'

import CstSpinnerScreen from './CstSpinnerScreen'
import CdsQuestionScreen from './CdsQuestionScreen'
import CstSignupWebViewWithAccept from './CstSignupWebViewWithAccept'
import CstSignupSlideIntro from './CstSignupSlideIntro'
import CstSignupShopSelect from './CstSignupShopSelect';
import { COLORS } from 'DWcmn/Global'

import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { dwdbfsCustGetByAuth, dwdbfsCustAdd } from 'DWcmn/dwdbfsCust'
import { dwdbfsShopGet } from 'DWcmn/dwdbfsShop'
import CstSignupProfilePersonal from './CstSignupProfilePersonal'
import { CmnAddressInput } from 'DWcmn/CmnAddressInput'
import { prjcmnInShopArea } from 'DWcmn/prjcmnLocationFunctions'
import { strX } from 'DWcmn/I18n';
import { GCI18n, GCText } from 'DWcmn/Gc'
import { GCFooterWithTwoIcons } from 'DWcmn/GCFooterForIcons'
import GCHeader from 'DWcmn/GCHeader'
import { CstShopTile } from './CstShopTile';
import { ScTile } from './ScTile'
import { prjStopType } from 'DWcmn/prjStopFunctions'
import { prjStopInitialize, prjStopInitHomeStopFromBuildingService } from 'DWcmn/prjStopFunctions'
import { prjStopInitHomeStopWithAddressLoc } from 'DWcmn/prjStopFunctions'
import { prjToast } from 'DWcmn/PrjToast'
import { CST } from './CST'
import { CstSignupNotificationPermission } from './CstSignupNotificationPermission'
import { CstSignupVerifyShopAndAddress } from './CstSignupVerifyShopAndAddress';
import { dwdbfsCouponsAddWelcome } from 'DWcmn/dwdbfsCoupons'
import { prjCloudLogInfo } from 'DWcmn/prjCloudLog'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'


//20210909 allowed write of null shopId to new customer
//20241017 removed address details .. alternates will have to be added in profile
//20250628 use prjStopInitHomeStopFromBuildingService
//20250721 added Welcome coupon on signup

const MODES = {
   INIT: 0,
   RETURN_WITHOUT_REG: 20,
   START_REG: 30,
   GET_ADDR: 50,
   NO_SHOP: 51,
   VERIFY_SHOP_AND_ADDRESS: 53,
   PRIVACY: 55,
   T_AND_C: 60,
   NOTIFICATIONS: 65,
   GET_PERSONAL_DETAILS: 600,
   GET_ADDRESS_DETAILS: 650,
   DONE: 800,
   QR_INVALID_SHOP: 200,
   QR_GET_ADDRESS: 210,
   QR_LOCATION_NOT_IN_SHOP_AREA: 220,
   QR_CONFIRM_BUILDING_SERVICE: 230,
   QR_GET_UNIT_NUMBER: 240,
   GET_ADDRESS_OLD: 300,
   GET_SHOP: 310,
   SLIDE_INTRO: 900
}

//TODO - the following are Claude comments
// Side effects during render preserved as-is: the original class literally mutates this.profileData
//  inside render() for RETURN_WITHOUT_REG and VERIFY_SHOP_AND_ADDRESS — unusual, but I kept that exact
//  behavior (now mutating profileDataRef.current in the function body on each render reaching those
//  cases) rather than moving it into an effect, since changing when that runs could change behavior
//  and you didn't ask for that fix.

//nav param options

//we expect an options block which contains:
//  authType: 'google' (login info from google signin)
//            'email'  (email signin)
//            'facebook' 
//  isNewUser:(optional) DEPRECATED? DON'T KNOW HOW TO PROVIDE THIS //TODO
// FOLLOWING ARE DEPRECATED ... just let them select again.
//  //address:  (optional) they may have looked at on the logo screen (suggestion only)
//  //location: (optional) iff address is there
//  //shop:     (optional) they may have selected on logo screen (verify)  
//NOTE we get further user credentials from auth().currentUser (including uid)
export function CstSignupInitializeAccount() {

   const navigation = useNavigation()
   const { options = null } = useRoute().params ?? {}

   const [mode, setMode] = useState(MODES.INIT)
   const [isCustomerDbInProgress, setIsCustomerDbInProgress] = useState(false)

   const fbauthUserRef = useRef(null)
   // this.shopIdFromQRCode = "DEMO" //DEBUG
   // this.shopIdFromQRCode = "XXX" //DEBUG
   // this.shopIdFromQRCode = "DEMOBLDG" //DEBUG
   // this.shopIdFromQRCode = "MYDodel" //DEBUG
   // this.shopIdFromQRCode = "DEMOBLDG" //DEBUG
   const shopIdFromQRCodeRef = useRef(null)
   const shopFromQRCodeRef = useRef(null)
   const shopRef = useRef(null)
   const newUserRef = useRef(null) //only defined when a new user is created
   const profileDataRef = useRef(null)

   //TODO may want to move init stuff from mount effect to get email stuff etc.
   //we are trying to allow a case where we Cancel back to restart stuff
   function initializeProfileData() {
      profileDataRef.current = {
         //these fields may have come from auth
         //CLAUDE: original read this.props.authType here, but this screen takes no custom props
         //(only the nav route param 'options') - this value is always overwritten by
         //loadAuthProfileData() below before it's ever used, so behaviour is unchanged
         authType: null,
         email: null,
         phoneNumber: null,
         name: null,

         shopId: null,
         homeStop: { code: 'home' },
         altStop: { code: null }

      }
   }
   if (profileDataRef.current === null) { initializeProfileData() }

   //TODO use this in mount effect
   function loadAuthProfileData() {
      profileDataRef.current.email = fbauthUserRef.current.email
      profileDataRef.current.name = fbauthUserRef.current.displayName
      profileDataRef.current.phoneNumber = fbauthUserRef.current.phoneNumber
      profileDataRef.current.authType = options.authType
   }

   useEffect(() => {
      (async () => {

         fbauthUserRef.current = firebase.auth().currentUser
         let dbUser
         //First make sure our entry conditions are met, we have options and and logged in user
         if (!options) {
            prjAlert('missing option block', 'in CstSignupInitializeAccount')
            navigation.popToTop()
         }
         else if (!fbauthUserRef.current) {
            prjAlert('no fbauthUser', 'in CstSignupInitializeAccount')
            navigation.popToTop()
         }
         //TODO don't think this case happens?
         else if (dbUser = await dwdbfsCustGetByAuth(fbauthUserRef.current.uid)) {
            navigation.replace("StackMain", { 'user': dbUser })
         }
         else { //okay, we have stuff to do
            loadAuthProfileData()
            if (shopIdFromQRCodeRef.current) { //shop identified on QR code
               shopFromQRCodeRef.current = await dwdbfsShopGet(shopIdFromQRCodeRef.current)
               if (!shopFromQRCodeRef.current) {
                  setMode(MODES.QR_INVALID_SHOP)
               }
               else if (shopFromQRCodeRef.current.isBuildingService) {
                  setMode(MODES.QR_CONFIRM_BUILDING_SERVICE)
               }
               else { //normal shop ..we will get address and then make sure we are in area of shop
                  setMode(MODES.QR_GET_ADDRESS)
               }
            }
            else { //no QRcode shop specified
               setMode(options.isNewUser ? MODES.START_REG : MODES.RETURN_WITHOUT_REG)
            }
         }
      })()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, mirrors original componentDidMount; options is a nav param read once
   }, [])

   //create a new customer using stuff in profileData map and the authId in the firebase auth block
   //returns the record if successful ow null
   //NOTE for convenience, if the selected shop is a building service we set flag in customer
   const makeCustomer = async () => {
      let ref = null
      //TODO make sure that authid doesn't exist??
      profileDataRef.current.shopId = shopRef.current ? shopRef.current.id : null
      //errors are caught and annunciated within the dwdb
      ref = await dwdbfsCustAdd(fbauthUserRef.current.uid, profileDataRef.current)
      global.cstxRef = ref //NOTE not used anywhere
      CST.setShop(ref ? await dwdbfsShopGet(ref.shopId) : null)
      await dwdbfsCouponsAddWelcome(ref.id)

      return ref
   }

   switch (mode) {

      case MODES.INIT:
         return (
            <CstSpinnerScreen />
         );
         break;

      //they have an auth but no db account, invite them to enter profile
      //NOTE that we can also 'cancel' our way back here
      case MODES.RETURN_WITHOUT_REG:
         //when they cancel their way back here we want to tidy up 
         initializeProfileData()
         loadAuthProfileData()

         return (
            <CdsQuestionScreen
               text='cstNEW.RegistrationReturnWithout'
               i18nCancel='cmnNEW.NotNowArrowLeft'
               onCancelCode='PREV_IS_NOT_NOW'
               onOkay={async () => {
                  setMode(MODES.START_REG)
               }}
               onCancel={async () => {
                  await cmnSignout()
                  navigation.popToTop()
               }}
            />
         );
         break;

      //first get their location (by phone location or from map)
      case MODES.START_REG:
      case MODES.GET_ADDR:
         return (
            <CdsScreen>
               <CmnAddressInput requestPermission
                  title={strX("cstNEW.Your_Location")}
                  defaultAddress={null}
                  defaultLocation={null}
                  onCancel={() => {
                     setMode(MODES.RETURN_WITHOUT_REG)
                  }}
                  onSelect={(address, location) => { //
                     prjStopInitHomeStopWithAddressLoc(profileDataRef.current.homeStop, address, location)
                     prjStopInitialize(profileDataRef.current.altStop)
                     setMode(MODES.GET_SHOP)
                  }} />
            </CdsScreen >
         );
         break;

      //use the location to look for a shop
      //if there is only one or they choose one then onSelect will be called
      //if they cancel or there is no shop (they will be told) onCancel will be called
      //NOTE we can return null shop onSelect
      case MODES.GET_SHOP: //then let them select a shop 
         return (
            <CstSignupShopSelect
               title={strX("cstNEW.ChooseYourShop")}
               custLocation={profileDataRef.current.homeStop.location}
               onCancel={() => { setMode(MODES.GET_ADDR) }} //back to get address
               onNoShop={() => { setMode(MODES.NO_SHOP) }}
               onSelect={(shop) => {
                  shopRef.current = shop;
                  profileDataRef.current.shopIsABuildingService = shopRef.current.isBuildingService
                  if (shopRef.current.isBuildingService) {
                     prjStopInitHomeStopFromBuildingService(profileDataRef.current.homeStop, shopRef.current)
                     prjStopInitialize(profileDataRef.current.altStop)
                     // this.profileData.homeStop.code = 'building'
                     // this.profileData.homeStop.buildingName = this.shop.buildingName
                  }
                  console.log('after shop', profileDataRef.current)
                  setMode(MODES.VERIFY_SHOP_AND_ADDRESS)
               }}
            ></CstSignupShopSelect>
         );
         break;

      //no shop ... give them a chance to register...
      case MODES.NO_SHOP:
         return (
            <CdsQuestionScreen
               text='cstNEW.RegistrationContinue'
               onCancelCode='PREV_IS_NO_THANKS'
               onOkay={async () => {
                  setMode(MODES.PRIVACY)
               }}
               onCancel={() => {
                  const homeLocation = profileDataRef.current?.homeStop?.location
                  const locationStr = homeLocation ? `[${homeLocation.latitude},${homeLocation.longitude}]` : '';
                  prjCloudLogInfo('CstSignupInitializeAccount','SHOP NOT FOUND - NO REG - '+locationStr)
                  setMode(MODES.RETURN_WITHOUT_REG)
               }}
            />
         );
         break;

      ////////////////////////////////////SPECIAL QR CODE PROCESSING

      //the shop in the QR code does not exist
      case MODES.QR_INVALID_SHOP:
         return (
            <CdsQuestionScreen
               text='cstNEW.RegistrationQRShopNotFound'
               onCancelCode="PREV_IS_NO_THANKS"
               onOkay={async () => {
                  setMode(MODES.GET_ADDR)
               }}
               onCancel={async () => {
                  await cmnSignout()
                  navigation.popToTop()
               }}
            />
         );
         break;

      //the shop in the QR code is a building service so we let them just acknowledge that they are in that
      //building without any address input
      case MODES.QR_CONFIRM_BUILDING_SERVICE:
         return (
            <CdsScreen>
               {/* <GCHeader titleI18n='cmnNEW.ShopSelection' /> */}

               <PrjSpacer size={40} />
               <View style={{ flex: .2 }}>
                  <GCI18n large code='cstNEW.RegistrationQRIsThisYourBuilding' style={{ textAlign: 'center' }} />
               </View>
               <View style={{ flex: .8 }}>
                  <CstShopTile
                     shop={shopFromQRCodeRef.current}
                     selected={true}
                     clickable={false}
                     onPress={() => { }}
                  />
               </View>
               <GCFooterWithTwoIcons
                  onOkayCode='NEXT_IS_YES'
                  onCancelCode='PREV_IS_NO'
                  onOkay={() => {//we use the shop data to fill in user location. Unit will come later
                     shopRef.current = shopFromQRCodeRef.current;
                     profileDataRef.current.shopIsABuildingService = true
                     prjStopInitHomeStopFromBuildingService(profileDataRef.current.homeStop, shopRef.current)
                     prjStopInitialize(profileDataRef.current.altStop)
                     setMode(MODES.VERIFY_SHOP_AND_ADDRESS)
                  }}
                  onCancel={() => setMode(MODES.GET_ADDR)}
               />
            </CdsScreen >
         )
         break;

      case MODES.QR_GET_ADDRESS:
         return (
            <CdsScreen>
               <CmnAddressInput requestPermission
                  title={strX("cstNEW.RegistrationQRYourShopIs", { shop: shopFromQRCodeRef.current.name })}
                  defaultAddress={null}
                  defaultLocation={null}
                  onCancel={() => { setMode(MODES.RETURN_WITHOUT_REG) }}
                  onSelect={(address, location) => {
                     const locOkay = prjcmnInShopArea(location, shopFromQRCodeRef.current, false)
                     if (locOkay) {
                        prjStopInitHomeStopWithAddressLoc(profileDataRef.current.homeStop, address, location)
                        prjStopInitialize(profileDataRef.current.altStop)

                        shopRef.current = shopFromQRCodeRef.current
                        profileDataRef.current.shopId = shopRef.current.shopId
                        setMode(MODES.VERIFY_SHOP_AND_ADDRESS)
                     }
                     else {
                        setMode(MODES.QR_LOCATION_NOT_IN_SHOP_AREA)
                     }
                  }} />
            </CdsScreen >
         );
         break;

      case MODES.QR_LOCATION_NOT_IN_SHOP_AREA:
         return (
            <CdsQuestionScreen
               text='cstNEW.RegistrationQRNotInShopArea'
               onOkayCode='NEXT_IS_WRONG_ADDRESS_'
               onCancelCode='PREV_IS_WRONG_SHOP_'
               onOkay={() => {
                  //try different addresses for the QR shop
                  setMode(MODES.QR_GET_ADDRESS)
               }}
               onCancel={() => {
                  //go back to regular processing to look for other shops perhaps
                  setMode(MODES.GET_ADDR)
               }}
            />
         );
         break;

      //confirm their shop and address ... here we will insist on unit info building service
      case MODES.VERIFY_SHOP_AND_ADDRESS:
         profileDataRef.current.shopIsABuildingService = prjStopType(profileDataRef.current?.homeStop) == 'building'
         // console.log('verify start', profileDataRef.current)
         return (
            <CstSignupVerifyShopAndAddress
            profileData = {profileDataRef.current}
            chosenShop = {shopRef.current}
            onOkay = {()=>{setMode(MODES.PRIVACY)}}
            onCancel = {()=>{setMode(MODES.GET_ADDR)}}
            />
         )
         break;

      //get agreement to our privacy policy
      case MODES.PRIVACY:
         //NOTE that we pass the key parameter so r/n will remount webView
         return (
            <CstSignupWebViewWithAccept
               key={1}
               titleI18n='cst.signin.Privacy_Policy'
               url='https://www.dobbywalla.com/app-privacypolicy'
               onAccept={() => { setMode(MODES.T_AND_C) }}
               onDecline={() => { setMode(MODES.RETURN_WITHOUT_REG) }}
            />)
         break;

      //get agreement to our terms and conditions
      case MODES.T_AND_C:
         //NOTE that we pass the key parameter so r/n will remount webView
         return (
            <CstSignupWebViewWithAccept
               key={2}
               titleI18n='cst.signin.Terms_and_Conditions'
               url='https://www.dobbywalla.com/apps-termsandcondition'
               onAccept={() => { setMode(MODES.NOTIFICATIONS) }}
               onDecline={() => { setMode(MODES.RETURN_WITHOUT_REG) }}
            />)
         break;

      //ask for permission to send notifications
      case MODES.NOTIFICATIONS:
         return (
            <CstSignupNotificationPermission
               onOkay={() => { setMode(MODES.GET_PERSONAL_DETAILS) }}
            />)
         break;

      //get the necessary personal information
      case MODES.GET_PERSONAL_DETAILS:
         return (
            <CstSignupProfilePersonal
               shop={shopRef.current}
               details={profileDataRef.current}
               onBack={() => { setMode(MODES.RETURN_WITHOUT_REG) }}
               onForward={(name, phoneNumber, email) => {
                  profileDataRef.current.name = name
                  profileDataRef.current.phoneNumber = phoneNumber
                  profileDataRef.current.email = email
                  setMode(MODES.DONE)
               }}
            />
         )
         break;

      // //get the necessary address data and alternate address
      // case MODES.GET_ADDRESS_DETAILS:
      //    return (
      //       <CstSignupProfileAddresses
      //          shop={this.shop}
      //          details={this.profileData}
      //          onBack={() => { this.setState({ mode: MODES.GET_PERSONAL_DETAILS }) }}
      //          onForward={() => {
      //             this.setState({ mode: MODES.DONE })
      //          }}
      //       />
      //    )
      //    break;

      //write the customer record to db
      //any error will be annunciated and we will stay in this mode
      //but if successful move on to the intro slides
      case MODES.DONE:
         return (
            <>
               {(isCustomerDbInProgress) && <PrjBusyMask />}
               <CdsQuestionScreen
                  text='cstNEW.RegistrationComplete'
                  onOkay={async () => {
                     setIsCustomerDbInProgress(true)
                     newUserRef.current = await makeCustomer()
                     setIsCustomerDbInProgress(false)
                     if (newUserRef.current) { setMode(MODES.SLIDE_INTRO) }
                  }}
                  onCancel={() => {
                     setMode(MODES.RETURN_WITHOUT_REG)
                  }}
               />
            </>
         )
         break;

      //show our little usage demo
      // NOTE we know that newUserRef.current is defined .. only come here from .DONE
      case MODES.SLIDE_INTRO:
         return (
            <CstSignupSlideIntro
               onOkay={async () => {
                  navigation.replace("StackMain", { 'user': newUserRef.current })
               }}
            />

         )
         break;

      //invalid mode? hard to see how that would happen    
      default:
         prjAlert("Invalid mode in CstSignupInitializeAccount")
         navigation.goBack()
         return null
         break;
   }
}// end CstSignupInitializeAccount