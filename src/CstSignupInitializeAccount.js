
import React, { Component } from 'react'
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
import { prjCloudLogInfp } from 'DWcmn/prjCloudLog'


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

//param options 

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
export default class CstSignupInitializeAccount extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isComponentInitialized: false,
         mode: MODES.INIT,
         isCustomerDbInProgress: false,
         toggle: false
      };
      this.options = null
      this.fbauthUser = null
      // this.shopIdFromQRCode = "DEMO" //DEBUG
      // this.shopIdFromQRCode = "XXX" //DEBUG
      // this.shopIdFromQRCode = "DEMOBLDG" //DEBUG
      // this.shopIdFromQRCode = "MYDodel" //DEBUG
      // this.shopIdFromQRCode = "DEMOBLDG" //DEBUG
      this.shopIdFromQRCode = null

      this.initializeProfileData()
      this.shop = null

      this.newUser = null   //only define when a new user is created
   }

   //TODO may want to move init stuff from didMount to get email stuff etc.
   //we are trying to allow a case where we Cancel back to restart stuff
   initializeProfileData() {
      this.profileData = {
         //these fields may have come from auth
         authType: this.props.authType,
         email: null,
         phoneNumber: null,
         name: null,

         shopId: null,
         homeStop: { code: 'home' },
         altStop: { code: null }

      }
   }

   //TODO use this in DidMount
   loadAuthProfileData() {
      this.profileData.email = this.fbauthUser.email
      this.profileData.name = this.fbauthUser.displayName
      this.profileData.phoneNumber = this.fbauthUser.phoneNumber
      this.profileData.authType = this.options.authType
   }

   async componentDidMount() {

      this.options = this.props.navigation.getParam('options', null)
      this.fbauthUser = firebase.auth().currentUser
      let dbUser
      //First make sure our entry conditions are met, we have options and and logged in user
      if (!this.options) {
         prjAlert('missing option block', 'in CstSignupInitializeAccount')
         this.props.navigation.popToTop()
      }
      else if (!this.fbauthUser) {
         prjAlert('no fbauthUser', 'in CstSignupInitializeAccount')
         this.props.navigation.popToTop()
      }
      //TODO don't think this case happens?
      else if (dbUser = await dwdbfsCustGetByAuth(this.fbauthUser.uid)) {
         global.rootNav.navigate("StackMain", { 'user': dbUser })
      }
      else { //okay, we have stuff to do
         this.loadAuthProfileData()
         if (this.shopIdFromQRCode) { //shop identified on QR code
            this.shopFromQRCode = await dwdbfsShopGet(this.shopIdFromQRCode)
            if (!this.shopFromQRCode) {
               this.setState({ mode: MODES.QR_INVALID_SHOP })
               this.setState({ isComponentInitialized: true })
            }
            else if (this.shopFromQRCode.isBuildingService) {
               this.setState({ mode: MODES.QR_CONFIRM_BUILDING_SERVICE })
               this.setState({ isComponentInitialized: true })
            }
            else { //normal shop ..we will get address and then make sure we are in area of shop
               this.setState({ mode: MODES.QR_GET_ADDRESS })
               this.setState({ isComponentInitialized: true })
            }
         }
         else { //no QRcode shop specified
            this.setState({ mode: this.options.isNewUser ? MODES.START_REG : MODES.RETURN_WITHOUT_REG })
            this.setState({ isComponentInitialized: true })
         }

      }

      //we can NOT do this here ... it causes errors for the cases where we do
      //a navigate ... so BE SURE every case takes care of setting the flag if they 
      //are not going to navigate away.
      // this.setState({ isComponentInitialized: true })


   }

   render() {

      switch (this.state.mode) {

         case MODES.INIT:
            return (
               <CstSpinnerScreen />
            );
            break;

         //they have an auth but no db account, invite them to enter profile
         //NOTE that we can also 'cancel' our way back here
         case MODES.RETURN_WITHOUT_REG:
            //when they cancel their way back here we want to tidy up 
            this.initializeProfileData()
            this.loadAuthProfileData()

            return (
               <CdsQuestionScreen
                  text='cstNEW.RegistrationReturnWithout'
                  i18nCancel='cmnNEW.NotNowArrowLeft'
                  onCancelCode='PREV_IS_NOT_NOW'
                  onOkay={async () => {
                     this.setState({ mode: MODES.START_REG })
                  }}
                  onCancel={async () => {
                     await cmnSignout()
                     this.props.navigation.popToTop()
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
                        this.setState({ mode: MODES.RETURN_WITHOUT_REG })
                     }}
                     onSelect={(address, location) => { //
                        prjStopInitHomeStopWithAddressLoc(this.profileData.homeStop, address, location)
                        prjStopInitialize(this.profileData.altStop)
                        this.setState({ mode: MODES.GET_SHOP })
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
                  custLocation={this.profileData.homeStop.location}
                  onCancel={() => { this.setState({ mode: MODES.GET_ADDR }) }} //back to get address
                  onNoShop={() => { this.setState({ mode: MODES.NO_SHOP }) }}
                  onSelect={(shop) => {
                     this.shop = shop;
                     this.profileData.shopIsABuildingService = this.shop.isBuildingService
                     if (this.shop.isBuildingService) {
                        prjStopInitHomeStopFromBuildingService(this.profileData.homeStop, this.shop)
                        prjStopInitialize(this.profileData.altStop)
                        // this.profileData.homeStop.code = 'building'
                        // this.profileData.homeStop.buildingName = this.shop.buildingName
                     }
                     console.log('after shop', this.profileData)
                     this.setState({ mode: MODES.VERIFY_SHOP_AND_ADDRESS })
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
                     this.setState({ mode: MODES.PRIVACY })
                  }}
                  onCancel={() => {
                     const homeLocation = this.profileData?.homeStop?.location
                     const locationStr = homeLocation ? `[${homeLocation.latitude},${homeLocation.longitude}]` : '';
                     prjCloudLogInfo('CstSignupInitializeAccount','SHOP NOT FOUND - NO REG - '+locationStr)
                     this.setState({ mode: MODES.RETURN_WITHOUT_REG })
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
                     this.setState({ mode: MODES.GET_ADDR })
                  }}
                  onCancel={async () => {
                     await cmnSignout()
                     this.props.navigation.popToTop()
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
                        shop={this.shopFromQRCode}
                        selected={true}
                        clickable={false}
                        onPress={() => { }}
                     />
                  </View>
                  <GCFooterWithTwoIcons
                     onOkayCode='NEXT_IS_YES'
                     onCancelCode='PREV_IS_NO'
                     onOkay={() => {//we use the shop data to fill in user location. Unit will come later
                        this.shop = this.shopFromQRCode;
                        this.profileData.shopIsABuildingService = true
                        prjStopInitHomeStopFromBuildingService(this.profileData.homeStop, this.shop)
                        prjStopInitialize(this.profileData.altStop)
                        this.setState({ mode: MODES.VERIFY_SHOP_AND_ADDRESS })
                     }}
                     onCancel={() => this.setState({ mode: MODES.GET_ADDR })}
                  />
               </CdsScreen >
            )
            break;

         case MODES.QR_GET_ADDRESS:
            return (
               <CdsScreen>
                  <CmnAddressInput requestPermission
                     title={strX("cstNEW.RegistrationQRYourShopIs", { shop: this.shopFromQRCode.name })}
                     defaultAddress={null}
                     defaultLocation={null}
                     onCancel={() => { this.setState({ mode: MODES.RETURN_WITHOUT_REG }) }}
                     onSelect={(address, location) => {
                        const locOkay = prjcmnInShopArea(location, this.shopFromQRCode, false)
                        if (locOkay) {
                           prjStopInitHomeStopWithAddressLoc(this.profileData.homeStop, address, location)
                           prjStopInitialize(this.profileData.altStop)

                           this.shop = this.shopFromQRCode
                           this.profileData.shopId = this.shop.shopId
                           this.setState({ mode: MODES.VERIFY_SHOP_AND_ADDRESS })
                        }
                        else {
                           this.setState({ mode: MODES.QR_LOCATION_NOT_IN_SHOP_AREA })
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
                     this.setState({ mode: MODES.QR_GET_ADDRESS })
                  }}
                  onCancel={() => {
                     //go back to regular processing to look for other shops perhaps
                     this.setState({ mode: MODES.GET_ADDR })
                  }}
               />
            );
            break;

         //confirm their shop and address ... here we will insist on unit info building service
         case MODES.VERIFY_SHOP_AND_ADDRESS:
            this.profileData.shopIsABuildingService = prjStopType(this.profileData?.homeStop) == 'building'
            // console.log('verify start', this.profileData)
            return (
               <CstSignupVerifyShopAndAddress
               profileData = {this.profileData}
               chosenShop = {this.shop}
               onOkay = {()=>{this.setState({ mode: MODES.PRIVACY })}}
               onCancel = {()=>{this.setState({ mode: MODES.GET_ADDR })}}
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
                  onAccept={() => { this.setState({ mode: MODES.T_AND_C }) }}
                  onDecline={() => { this.setState({ mode: MODES.RETURN_WITHOUT_REG }) }}
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
                  onAccept={() => { this.setState({ mode: MODES.NOTIFICATIONS }) }}
                  onDecline={() => { this.setState({ mode: MODES.RETURN_WITHOUT_REG }) }}
               />)
            break;

         //ask for permission to send notifications
         case MODES.NOTIFICATIONS:
            return (
               <CstSignupNotificationPermission
                  onOkay={() => { this.setState({ mode: MODES.GET_PERSONAL_DETAILS }) }}
               />)
            break;

         //get the necessary personal information
         case MODES.GET_PERSONAL_DETAILS:
            return (
               <CstSignupProfilePersonal
                  shop={this.shop}
                  details={this.profileData}
                  onBack={() => { this.setState({ mode: MODES.RETURN_WITHOUT_REG }) }}
                  onForward={(name, phoneNumber, email) => {
                     this.profileData.name = name
                     this.profileData.phoneNumber = phoneNumber
                     this.profileData.email = email
                     this.setState({ mode: MODES.DONE })
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
                  {(this.state.isCustomerDbInProgress) && <PrjBusyMask />}
                  <CdsQuestionScreen
                     text='cstNEW.RegistrationComplete'
                     onOkay={async () => {
                        this.setState({ isCustomerDbInProgress: true })
                        this.newUser = await this.makeCustomer()
                        this.setState({ isCustomerDbInProgress: false })
                        if (this.newUser) { this.setState({ mode: MODES.SLIDE_INTRO }) }
                     }}
                     onCancel={() => {
                        this.setState({ mode: MODES.RETURN_WITHOUT_REG })
                     }}
                  />
               </>
            )
            break;

         //show our little usage demo
         // NOTE we know that this.newUser is defined .. only come here from .DONE
         case MODES.SLIDE_INTRO:
            return (
               <CstSignupSlideIntro
                  onOkay={async () => {
                     global.rootNav.navigate("StackMain", { 'user': this.newUser })
                  }}
               />

            )
            break;

         //invalid mode? hard to see how that would happen    
         default:
            prjAlert("Invalid mode in CstSignupInitializeAccount")
            this.props.navigation.goBack()
            return null
            break;
      }
   } //end render

   //toggle a state variable to cause a render
   toggle = () => {
      this.setState({ toggle: !this.state.toggle })
   } //toggle 

   //create a new customer using stuff in profileData map and the authId in the firebase auth block
   //returns the record if successful ow null
   //NOTE for convenience, if the selected shop is a building service we set flag in customer
   makeCustomer = async () => {
      let ref = null
      //TODO make sure that authid doesn't exist??
      this.profileData.shopId = this.shop ? this.shop.id : null
      //errors are caught and annunciated within the dwdb
      ref = await dwdbfsCustAdd(this.fbauthUser.uid, this.profileData)
      global.cstxRef = ref
      CST.setShop(ref ? await dwdbfsShopGet(ref.shopId) : null)
      await dwdbfsCouponsAddWelcome(ref.id)

      return ref
   }


}// end CstSignupInitializeAccount




