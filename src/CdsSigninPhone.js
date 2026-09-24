import React, { useState, useEffect, useRef } from 'react'
import { Platform, View, Keyboard, ImageBackground, TouchableOpacity } from 'react-native';
import { SpinnerXYZ } from 'DWcmn/GCNB';
import auth from '@react-native-firebase/auth';
import { isBlank } from 'DWcmn/PrjCmnFunctions'
import GCHeader from 'DWcmn/GCHeader'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { CdsScreen } from './CdsScreen'
import firebase from '@react-native-firebase/app';
import { strX } from 'DWcmn/I18n.js'
import { GCI18n, GCText } from 'DWcmn/Gc'
import { navigateForAuthorizedCust } from './CdsSigninFunctions'
import { CdsSigninButton, CdsSigninNotation } from './CdsSigninComponents'
import DeviceInfo from 'react-native-device-info';
import DeviceCountry from 'react-native-device-country';
import PhoneInput from 'react-native-phone-number-input'
import OTPTextInput from 'react-native-otp-textinput'
import { PrjButtonSimple } from 'DWcmn/PrjButtonSimple'
import { COLORS } from 'DWcmn/Global'
import * as RNLocalize from "react-native-localize"
import { prjToast } from 'DWcmn/PrjToast'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'


//param appType
export default function CdsSigninPhone(props) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false);
   const [isLoginInProgress, setIsLoginInProgress] = useState(false);
   const [receivedCallback, setReceivedCallback] = useState(false);

   const appTypeRef = useRef(null) //set on mount
   const defaultPhoneNumberRef = useRef("") //we currently don't provide any help for phone number
   const otpRef = useRef("")
   const confirmationMethodRef = useRef(null) //callback return from firebase auth to confirm the otp
   const countryCodeRef = useRef(null) //country code that we try to get from phone (DeviceCountry)
   const phoneNumberRef = useRef(null)
   const phoneInputPointerRef = useRef(null) //a pointer to the PhoneInput component
   const otpInputPointerRef = useRef(null) //a pointer to the OTP component

   const isMountedRef = useIsMounted()

   //NOTE that we check for an auth state change .... which should indicate that the user's
   //phone has automatically used the otp code that was sent
   useEffect(() => {
      const unsubscribeFromAuthStateChanges = auth().onAuthStateChanged(onAuthStateChanged);

      return () => {
         unsubscribeFromAuthStateChanges()
      }
   }, [])

   useEffect(() => {

      appTypeRef.current = props.navigation.getParam('appType');

      (async () => {
         try {
            if (Platform.OS === 'android') {
               let countryObject = await DeviceCountry.getCountryCode()
               countryCodeRef.current = countryObject.code.toUpperCase()
            }
            // Device country doesn't work with ios so we use RNLocalize
            else { //ios
               countryCodeRef.current = RNLocalize.getCountry()
            }
         }
         catch (error) {
            //no need to annunciate an error ... just make sure country code is not null
            countryCodeRef.current = ""
         }
         setIsComponentInitialized(true);
      })()
   }, [])

   //NOTE we use an auth state listener because we can either get the otp code entered or it may
   //happen automatically from the phone processing the otp
   const onAuthStateChanged = (user) => {
      if (user) {
         navigateForAuthorizedCust(props.navigation, appTypeRef.current, { 'authType': 'phone' },
            () => { if (isMountedRef.current) setIsLoginInProgress(false) })
      }
   }

   const backButtonProcessing = () => {

      //if we are in phase 2, BACK just takes us back to phase 1 .. to enter different phone number
      //NOTE we have to set default phone number to display the number they just tried.
      if (receivedCallback) {
         setReceivedCallback(null)
         defaultPhoneNumberRef.current = phoneNumberRef.current
      }
      else {
         props.navigation.goBack()
      }
   }

   const renderContent = () => {

      if (!isComponentInitialized) {
         return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
               <SpinnerXYZ color='white' />
            </View>)
      }

      //Phase 1 get the phone number from the user
      //  when they hit send we first check validity
      //  we send the phone number to firebase auth which will return a method to call
      if (!receivedCallback) {
         return (
            <View style={{ flex: 1, alignItems: 'center' }}>
               <View height={40} />
               <PhoneInput
                  ref={component => phoneInputPointerRef.current = component}
                  defaultValue={defaultPhoneNumberRef.current}
                  defaultCode={countryCodeRef.current}
                  layout="first"
                  onChangeFormattedText={(text) => {
                     phoneNumberRef.current = text
                  }}
                  withDarkTheme
                  withShadow
                  autoFocus
               />
               <View height={40} />

               <CdsSigninButton
                  i18n='cmnNEW.Send'
                  onPress={async () => {
                     const isValid = phoneInputPointerRef.current.isValidNumber(phoneNumberRef.current)
                     if (!isValid) {
                        prjToast({ i18n: 'cmnNEW.ERRORInvalidPhoneNumber' }) //OK
                     }
                     else {
                        try {
                           setIsLoginInProgress(true)
                           confirmationMethodRef.current = await auth().signInWithPhoneNumber(phoneNumberRef.current);
                           setReceivedCallback(true)
                           setIsLoginInProgress(false)
                        }
                        catch (error) {
                           prjToast({ type: 'danger', text: error.message })
                           setIsLoginInProgress(false)
                        }

                     }
                  }}
               />
            </View>

         )
      }

      //phase 2 get the code from the user
      //when they hit send we call the callback from phase 1 with the entered code
      //if success then we sign them up
      return (
         <View style={{ flex: 1, alignItems: 'center' }}>
            <View height={40} />
            <View style={{ alignItems: 'center' }}>
               <GCI18n style={{ color: 'white' }} code="cmnNEW.OtpMessage" />
               <GCText></GCText>
               <GCText inverse>{phoneNumberRef.current}</GCText>
            </View>
            <OTPTextInput
               ref={e => (otpInputPointerRef.current = e)}
               textInputStyle={{ color: COLORS.GC_SIGNIN_TEXT }}
               inputCount={6}
               handleTextChange={(text) => {
                  otpRef.current = text
               }}
            />
            <View height={40} />
            <CdsSigninButton
               i18n='cmnNEW.Verify'
               onPress={async () => {
                  if (otpRef.current.length != 6) {
                     prjToast({ i18n: 'cmnNEW.ERROREnterCode' })
                  }
                  else {
                     try {
                        setIsLoginInProgress(true)
                        const result = await confirmationMethodRef.current.confirm(otpRef.current)
                        //we do not have to do anything here .... we will get an auth state change
                        //and our listener will send us to the user
                     }
                     catch (error) {
                        if (error.code === 'auth/invalid-verification-code') {
                           prjToast({ i18n: 'cmnNEW.ERRORIncorrectCode' })
                        }
                        else if (error.code === 'auth/session-expired') {
                           prjToast({ i18n: 'cmnNEW.ERRORCodeExpired' })
                        }
                        else {
                           prjToast({ type: 'danger', text: error.message })
                        }
                        setIsLoginInProgress(false)
                     }

                  }
               }}
            />

         </View>

      )

   }//end renderContent

   return (
      <CdsScreen signin padding={0}>

         {isLoginInProgress && <PrjBusyMask />}

         <View style={{ flex: 1, paddingHorizontal: 20, marginTop: 40 }}>
            <GCHeader back={backButtonProcessing} transparent
               iconColor={COLORS.GC_THEME_LIGHT}
               image={require('../images/company/textNoShadow.png')} />

            {renderContent()}

         </View>
      </CdsScreen>)

}// end CdsSigninPhone