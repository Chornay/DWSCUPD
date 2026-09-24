import React, { useState, useRef, useEffect } from 'react'
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import * as RNLocalize from "react-native-localize"
import DropDownPicker from 'react-native-dropdown-picker';
import { cmnSignoutFirebaseOnly } from 'DWcmn/CmnFunctions'

import { View, TouchableOpacity, Platform, StyleSheet, ImageBackground, Image, Linking } from 'react-native'
import I18n from 'i18n-js';
import { DW_PHONE_NUMBER, DW_WHATSAPP_NUMBER } from 'DWcmn/Global'
import { I18nLanguagePicker } from 'DWcmn/I18n.js'
import { GCI18n } from 'DWcmn/Gc'
import { PrjIconButton } from 'DWcmn/Prj'
import { PrjSpacer } from 'DWcmn/Prj';
import { CdsScreen } from './CdsScreen'
import CdsSpinnerScreen from './CdsSpinnerScreen'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import { LoginButton, AccessToken, LoginManager } from 'react-native-fbsdk-next';
// import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import { navigateForAuthorizedCust } from './CdsSigninFunctions'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { COLORS } from 'DWcmn/Global'

import { strX } from 'DWcmn/I18n';
import { dwdbfsUserGetByAuthAndAppType } from 'DWcmn/DWDBfs'
import CdsSigninCheckIfInArea from './CdsSigninCheckIfInArea'
import { CdsSigninButton, CdsSigninNotation } from './CdsSigninComponents'
import { GcdCIconWithText } from 'DWcmn/Gc'
import { GCCheckBox } from 'DWcmn/Gc'
import { prjNetworkStatus } from 'DWcmn/prjNetworkFunctions'
import SplashScreen from 'react-native-splash-screen' //think that we need this somewhere?
import i18n from 'i18n-js';
import { prjWhatsapp, prjCallOnPhone } from 'DWcmn/prjExternalApps'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import {prjCloudLogError} from 'DWcmn/prjCloudLog'

//20221124 CCCSigninMain removed from project
//20250524 added support contacts
//20260917 converted CdsSigninLogo from class to functional component

const MODES = {
  INIT: 0,
  MAIN: 10,
  CHECK_SERVICE: 20
}

//   providers: [
//     // 'anonymous',
//     // 'facebook',
//     // 'google',
//     // 'email',
//     // 'phone',
//     // 'apple',
//     // 'yahoo',
//     // 'github',
//     // 'twitter',
//     // 'microsoft'
//   ],

GoogleSignin.configure({
  // scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  webClientId: '906880565549-4eht3d0vre8g20r4rf08g7t3aq5t2lpl.apps.googleusercontent.com' // client ID of type WEB for your server (needed to verify user ID and offline access)
  // offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  // hostedDomain: 'https://console.firebase.google.com/u/0/project/dobbywalla-f8408/authentication/users', // specifies a hosted domain restriction
  // loginHint: 'soung.chornay21@gmail.com', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
  // forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  // accountName: 'dw_proj', // [Android] specifies an account name on the device that should be used
  // iosClientId: '', // [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
});

export default function CdsSigninLogo(props) {

  const [mode, setMode] = useState(MODES.INIT)
  const [isLoginInProgress, setIsLoginInProgress] = useState(false)
  const [languageChoice, setLanguageChoice] = useState('en')
  const refresh = useRefresh()

  const addressRef = useRef(null)
  const locationRef = useRef(null)
  const shopRef = useRef(null)
  const signinAppTypeRef = useRef(null)

  useEffect(() => {
    (async () => {
      signinAppTypeRef.current = props.navigation.getParam('signinAppType');
      const fbauthUser = firebase.auth().currentUser;

      SplashScreen.hide()

      // const locales = RNLocalize.getLocales();

      // if (Array.isArray(locales)) {
      //   const languageCode = locales[0].languageCode; // e.g., 'en'
      //   console.log("Language Code---------------->:", languageCode);
      //   I18n.locale = languageCode;
      //   setLanguageChoice(languageCode)
      //   // console.log("Language Code:", languageCode);
      // }

      //if we already have someone logged in we check if they are in our database
      //if they are then we check if they are finished initializing their account
      //NOTE we believe this is the same condition that is handled in AuthOrMain
      //     but left the code in just in case.
      if (fbauthUser) {
        try {

          let dbUser = await dwdbfsUserGetByAuthAndAppType(signinAppTypeRef.current, fbauthUser.uid)

          // console.log("user from database", dbUser)
          //TODO this next does not seem right ... can't navigate to other stack?
          if (dbUser) { // we already have a db entry
            global.rootNav.navigate("StackMain", { 'user': dbUser, 'comeFrom': 'logo' })
          }
          else { // log them out and let them log in again
            await cmnSignoutFirebaseOnly()
          }
        }
        catch (error) {
         prjCloudLogError('CdsSigninLogo fbauth', error)
          //TODO what else to do here??
        }
      }
      await prjNetworkStatus(true)
      setMode(MODES.MAIN)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, mirrors original componentDidMount; navigation is stable and not expected to change
  }, [])

  //NOTE that there is a GoogleSigninButton that gives stock icon or text button but
  //     we wanted more control so we use our own icon
  //  <GoogleSigninButton
  // // style={{ width: 48, height: 48 }}
  // size={GoogleSigninButton.Size.Icon}
  // color={GoogleSigninButton.Color.Light}
  // onPress={async () =>
  function googleButton() {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={async () => {
          try {
            await GoogleSignin.hasPlayServices();
            const googleuserInfo = await GoogleSignin.signIn();
            setIsLoginInProgress(true)
            const credential = auth.GoogleAuthProvider.credential(googleuserInfo.idToken)
            await auth().signInWithCredential(credential);
            navigateForAuthorizedCust(props.navigation, signinAppTypeRef.current, { 'authType': 'google' },
              () => setIsLoginInProgress(false))

          } catch (error) { //don't annunciate 'regular' codes
            setIsLoginInProgress(false)
            switch (error.code) {
              case statusCodes.SIGN_IN_CANCELLED: break;
              //IN_PROGRESS
              //PLAY_SERVICES_NOT_AVAILABLE
              default: prjCloudLogError('CdsSigninLogo google', error); break;
            }
          }
        }}//end onPress
      // disabled={isLoginInProgress}
      >
        <Image source={require('../images/login/google.png')} style={styles.thumbNail} />

      </TouchableOpacity>
    )
  }//end googleButton

  function signinApple() {
    return (
      <TouchableOpacity
        style={styles.button}
        onPress={async () => {       // prjToast({ text: "IOS login not enabled in this version" })
          // return (null) //TODO apple on
          // Start the sign-in request
          const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
          });
          // Ensure Apple returned a user identityToken
          if (!appleAuthRequestResponse.identityToken) {
            throw new Error('Apple Sign-In failed - no identify token returned');
          }
          // Create a Firebase credential from the response
          const { identityToken, nonce } = appleAuthRequestResponse;
          const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
          // Sign the user in with the credential
          await auth().signInWithCredential(appleCredential);
          navigateForAuthorizedCust(props.navigation, signinAppTypeRef.current, { 'authType': 'apple' })

        }
        }
      // disabled={isLoginInProgress}
      >
        <Image source={require('../images/login/apple.png')} style={styles.thumbNail} />

      </TouchableOpacity>
    )
  }//end signinApple

  switch (mode) {

    case MODES.INIT:
      return (
        <CdsSpinnerScreen />
      );

    case MODES.MAIN:
      return (
        // light blue color #336699
        <CdsScreen signin padding={0}>
          <View style={{ flex: 1 }}>
            <View style={{ flex: .1, paddingTop: 20, alignSelf: 'flex-end' }}><I18nLanguagePicker onChange={code => { refresh() }} />
            </View>
            <View style={{ flex: .3 }}>
              <Image
                style={{ flex: 1, justifyContent: 'center', alignSelf: 'center', resizeMode: 'contain' }}
                source={require('../images/company/logoBlue.png')} />
            </View>
            <View style={{ flex: .1, justifyContent: 'space-evenly', alignItems: 'center' }}>
              {(signinAppTypeRef.current == 'drv') && <GCI18n size={60} color='gray' bold code='cmnNEW.DRIVER' />}
              {(signinAppTypeRef.current == 'shp') && <GCI18n size={60} color='gray' bold code='cmnNEW.SHOP' />}
              {(signinAppTypeRef.current == 'cst') && <CdsSigninNotation i18n='cmnNEW.AreWeInYourArea'
                onPress={() => { setMode(MODES.CHECK_SERVICE) }} />}
            </View>
            <View style={{ flex: .2, justifyContent: 'space-evenly', alignItems: 'center' }}>

              <CdsSigninButton icon='EMAIL_OUTLINE' i18n='cmnNEW.SigninWithEmail'
                onPress={() => {
                  props.navigation.navigate('CdsSigninEmail', { 'appType': signinAppTypeRef.current })
                }} />
              <View style={{ height: 20 }} />
              <CdsSigninButton icon='PHONE_OUTLINE' i18n='cmnNEW.SigninWithPhone'
                onPress={async () => {
                  if (await prjNetworkStatus(true)) { props.navigation.navigate('CdsSigninPhone', { 'appType': signinAppTypeRef.current }) }
                }} />
            </View>
            {/* <View style={{ flex: .1 }} /> */}
            <View style={{ flex: .2 }}>
              <View style={{ height: 20 }} />
              <CdsSigninNotation size={14} i18n='cmnNEW.OrSigninWith' />
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }} >
                {/* calling class component doesn't work so gc change to calling method same as googleButton */}
                {(Platform.OS === 'ios') && signinApple()}
                {googleButton()}
                {/* disable for now because of facebook developer app review reasion */}
                {/* <FacebookButton /> */}
              </View>
            </View>
            {/* flex:.1 */}
            <View style={styles.contactUs}>
              <GCI18n detail inverse code='cmnNEW.ContactSupport' />
              <PrjIconButton
                color={COLORS.GC_FOOTER_TEXT}
                style={[styles.iconShadow, { fontSize: 24 }]}
                id={'PHONE_OUTLINE'}
                onPress={async () => { await prjCallOnPhone({ support: true }) }}></PrjIconButton>
              <PrjIconButton
                color={COLORS.GC_FOOTER_TEXT}
                style={[styles.iconShadow, { fontSize: 24 }]}
                id={'WHATSAPP'}
                onPress={async () => { await prjWhatsapp({ support: true }) }}></PrjIconButton>
            </View>
          </View>

        </CdsScreen>
      )

    //check for service ... the component takes care of all dialog
    //onCancel called if they cancel or no shop is found
    //onOkay called if there is one or more shops
    //BUT we don't use the shop .. if they sign up they may have to select a shop
    case MODES.CHECK_SERVICE:
      return (
        <CdsSigninCheckIfInArea
          onOkay={(address, location, shop) => {
            addressRef.current = address
            locationRef.current = location
            shopRef.current = null
            setMode(MODES.MAIN)
          }}
          onCancel={() => { setMode(MODES.MAIN) }}
        />
      );

    //invalid mode? hard to see how that would happen
    default:
      prjCloudLogError('CdsSigninLogo', 'invalid mode in switch')
      props.navigation.goBack()
      return null
  }
}// end CdsSigninLogo

// class FacebookButton extends Component {
//   render() {
//     return (
//       <View>
//         <TouchableOpacity
//           onPress={() => { this.signinFacebook() }}
//         >
//           <Thumbnail small style={styles.shadowStyle}
//             source={require('../images/login/facebook.png')} />
//         </TouchableOpacity>
//       </View>)

//   }
//   async signinFacebook() {
//     // prjToast({text:"Facebook login not enabled in this version"})
//     // return (null) //TODO facebook signin uncomment
//     console.warn("facebook")
//     const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

//     if (result.isCancelled) {
//       throw 'User cancelled the login process';
//     }
//     if (!data) {
//       throw 'Something went wrong obtaining access token';
//     }
//     // Once signed in, get the users AccesToken
//     const data = await AccessToken.getCurrentAccessToken();
//     console.log(data.accessToken.toString());
//     const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
//     await auth().signInWithCredential(facebookCredential);
//     console.log(auth().signInWithCredential(facebookCredential));
//     navigateForAuthorizedCust(this.props.navigation, this.signinAppType, { 'authType': 'facebook' })
//   }
// }//end FacebookButton

const styles = StyleSheet.create({

  contactUs: {
    flex: .1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 80,
    paddingBottom: 20
  },
  iconShadow: {
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  // Change for button style look to meet with App Store requirement
  thumbNail: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white'
  }
})