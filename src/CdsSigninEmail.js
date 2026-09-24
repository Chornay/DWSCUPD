import React, { useState, useEffect, useRef } from 'react'
import { View, Keyboard, ImageBackground } from 'react-native';
import { XFormInput, validateForm } from 'DWcmn/PrjFormInput'
import GCHeader from 'DWcmn/GCHeader'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { CdsScreen } from './CdsScreen'
import firebase from '@react-native-firebase/app';
import { strX } from 'DWcmn/I18n.js'
import { navigateForAuthorizedCust } from './CdsSigninFunctions'
import { PrjMsgBox } from 'DWcmn/PrjMsgBox'
import { CdsSigninButton, CdsSigninNotation } from './CdsSigninComponents'
import { COLORS } from 'DWcmn/Global'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'


export default function CdsSigninEmail(props) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false);
   const [isLoginInProgress, setIsLoginInProgress] = useState(false);
   const [errorMessage, setErrorMessage] = useState(null);
   const refresh = useRefresh();
   const isMountedRef = useIsMounted()

   // genuine refs: mutable values that must survive renders without triggering one
   const emailAddressRef = useRef("");
   const emailPasswordRef = useRef("");
   const appTypeRef = useRef('');

   // NOTE: this must keep stable identity across renders — validateForm mutates
   // these field objects to track per-field error state, and XFormInput reads
   // that mutated state back on re-render. A plain const rebuilt every render
   // silently discards that state (this was a real bug, not just a style choice).
   const fieldsRef = useRef([
      {
         key: 1,
         mandatory: true,
         showKeyboard: true,
         title: "Email",
         type: "email",
         assign: (val) => { emailAddressRef.current = val }
      },
      {
         key: 2,
         mandatory: true,
         title: "Password",
         type: "password",
         assign: (val) => { emailPasswordRef.current = val }
      }
   ]);
   const fields = fieldsRef.current;

   useEffect(() => {
      appTypeRef.current = props.navigation.getParam('appType');
      setIsComponentInitialized(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- appType is fixed
   }, []);

   const handleSignIn = async () => {
      ////DEBUG
      // emailAddressRef.current = "GRAMMY@FOOBAR.COM"
      // emailPasswordRef.current = "Test%000"
      // emailAddressRef.current = "DEMO@FOOBAR.COM"
      // emailPasswordRef.current = "Demo1234"
      // emailAddressRef.current = "Novum@FOOBAR.COM"
      // emailPasswordRef.current = "Test%000"
      if (!validateForm(fields)) {
         // if(false){
         //DEBUG
         refresh();
         setErrorMessage(null);
         return
      }
      Keyboard.dismiss();
      try {
         //TODO fs checks for valid username (unless foobar.com domain)
         //NOTE we have to be careful resetting isLoginInProgress
         setIsLoginInProgress(true)
         const { user } = await firebase.auth().signInWithEmailAndPassword(emailAddressRef.current, emailPasswordRef.current);
         if (!(user.email.toLowerCase().includes('foobar.com') || user.emailVerified)) {
            setIsLoginInProgress(false)
            props.navigation.navigate('CdsSigninEmailNotVerified')
         }
         else {
            //NOTE isLoginInProgress is not reset until we have read the database
            await navigateForAuthorizedCust(props.navigation, appTypeRef.current, { 'authType': 'email' })
         }
      } catch (error) { //unsuccessful login goes here
         if (error.code === 'auth/user-not-found') {
            setErrorMessage(strX('cmnNEW.EmailNotFound'))
         }
         else if (error.code === 'auth/wrong-password') {
            setErrorMessage(strX('cmnNEW.EmailBadPassword'))
         }
         else if (error.code === 'auth/invalid-credential') { //replaces bad user or password depending on config
            setErrorMessage(strX('cmnNEW.EmailInvalidCredential'))
         }
         else if (error.code === 'auth/invalid-email') {
            setErrorMessage(strX('cmnNEW.EmailInvalid'))
         }
         else if (error.code === 'auth/user-disabled') {
            setErrorMessage(strX('cmnNEW.EmailUserDisabled'))
         }
         else if (error.code === 'auth/too-many-requests') {
            setErrorMessage(strX('cmnNEW.EmailTooManyAttempts'))
         }
         else if (error.code === 'auth/network-request-failed') {
            setErrorMessage(strX('cmnNEW.EmailNetworkError'))
         }
         else { //unexpected .. customer gets something readable, we get the real error
            setErrorMessage(strX('cmnNEW.EmailSomethingWentWrong'))
            prjCloudLogError('CdsSigninEmail', error, { toast: false }) //No need for a toast
         }
      } finally {
         if (isMountedRef.current) { setIsLoginInProgress(false) }
      }
   } //handleSignIn

   return (
      <CdsScreen signin padding={0}>
         {isLoginInProgress && <PrjBusyMask />}
         <View style={{ flex: 1, marginHorizontal: 20, marginTop: 40 }}>
            <GCHeader back transparent
               iconColor={COLORS.GC_THEME_LIGHT}
               image={require('../images/company/textNoShadow.png')} />
            {/* TODO changing is .1 seem to break ImageBackground */}
            <View style={{ flex: .6, justifyContent: 'center' }}>
               <View>
                  {fields.map((field) => {
                     return (
                        <XFormInput signin key={field.key} options={field} />
                     )
                  })}
               </View>
               {errorMessage && <PrjMsgBox text={errorMessage} />}
            </View>

            <View style={{ height: 30 }} />
            <View style={{ flex: .3, alignItems: 'center' }}>
               <CdsSigninButton i18n='cst.signin.SIGN_IN'
                  onPress={handleSignIn} />

               <View style={{ height: 20 }} />
               <CdsSigninNotation size={14} i18n='cstNEW.ForgotYourPassword'
                  onPress={() => {
                     // validateForm(fields) //have to do this to load the email address
                     props.navigation.navigate("CdsSigninEmailForgot", { 'emailAddress': emailAddressRef.current });
                  }}
               />

               <View style={{ height: 40 }} />
               {(appTypeRef.current == 'cst') && <CdsSigninNotation i18n='cst.signin.NEW_USER'
                  onPress={() => { props.navigation.navigate("CstSigninEmailSignup"); }}
               />}
            </View>
         </View>

      </CdsScreen>
   )
}// end CdsSigninEmail