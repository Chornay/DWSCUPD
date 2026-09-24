import React, { useState, useEffect, useRef } from 'react'
import { View, Keyboard, ImageBackground } from 'react-native';
import { Form } from 'native-base';
import { XFormInput, validateForm } from 'DWcmn/PrjFormInput'
import { isBlank } from 'DWcmn/PrjCmnFunctions'
import GCHeader from 'DWcmn/GCHeader'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { CdsScreen } from './CdsScreen'
import firebase from '@react-native-firebase/app';
import { strX } from 'DWcmn/I18n.js'
import { GCI18n } from 'DWcmn/Gc'
import { navigateForAuthorizedCust } from './CdsSigninFunctions'
import { PrjMsgBox } from 'DWcmn/PrjMsgBox'
import { CdsSigninButton, CdsSigninNotation } from './CdsSigninComponents'
import { COLORS } from 'DWcmn/Global'
import { useRefresh } from 'DWcmn/prjUseRefresh'


export default function CdsSigninEmail(props) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false);
   const [isLoginInProgress, setIsLoginInProgress] = useState(false);
   const [errorMessage, setErrorMessage] = useState(null);
   const refresh = useRefresh();

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
         // setIsLoginInProgress(false) ///used to do it here
         if (!(user.email.toLowerCase().includes('foobar.com') || user.emailVerified)) {
            setIsLoginInProgress(false)
            props.navigation.navigate('CdsSigninEmailNotVerified')
         }
         else {
            //NOTE isLoginInProgress is not reset until we have read the database
            navigateForAuthorizedCust(props.navigation, appTypeRef.current, { 'authType': 'email' },
               () => setIsLoginInProgress(false))
         }
      }
      catch (e) { //unsuccessful login goes here
         setIsLoginInProgress(false)
         if (e.code === 'auth/user-not-found') {
            setErrorMessage(strX('cmnNEW.EmailNotFound'))
         }
         else if (e.code === 'auth/wrong-password') {
            setErrorMessage(strX('cmnNEW.EmailBadPassword'))
         }
         else {
            setErrorMessage(e.message);
         }
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
               <Form >
                  {fields.map((field) => {
                     return (
                        <XFormInput signin key={field.key} options={field} />
                     )
                  })}
               </Form>
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