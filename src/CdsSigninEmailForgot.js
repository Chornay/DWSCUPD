import React, { useState, useEffect, useRef } from 'react'
import { View, Keyboard } from 'react-native';
import { Form } from 'native-base';
import { XFormInput, validateForm } from 'DWcmn/PrjFormInput'
import GCHeader from 'DWcmn/GCHeader'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { CdsScreen } from './CdsScreen'
import firebase from '@react-native-firebase/app';
import { PrjMsgBox } from 'DWcmn/PrjMsgBox'
import { CdsSigninButton, CdsSigninNotation } from './CdsSigninComponents'
import { prjToast } from 'DWcmn/PrjToast'
import { COLORS } from 'DWcmn/Global'
import { useRefresh } from 'DWcmn/prjUseRefresh'

//20241016 removed all sorts of commented old code

export default function CdsSigninEmailForgot(props) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false);
   const [errorMessage, setErrorMessage] = useState(null);
   const [isLoginInProgress, setIsLoginInProgress] = useState(false);
   const refresh = useRefresh();

   const emailAddressRef = useRef("");

   // NOTE: stable identity across renders — validateForm mutates these field
   // objects to track per-field error state, and XFormInput reads that back
   // on re-render. A plain const rebuilt every render would silently drop it.
   const fieldsRef = useRef([
      {
         key: 1,
         mandatory: true,
         title: "Email",
         type: "email",
         assign: (val) => { emailAddressRef.current = val }
      },
   ]);
   const fields = fieldsRef.current;

   useEffect(() => {
      setIsComponentInitialized(true);
   }, []);

   const handleReset = async () => {
      if (!validateForm(fields)) {
         refresh();
         setErrorMessage(null);
         return
      }
      Keyboard.dismiss();
      setIsLoginInProgress(true)
      try {
         await firebase.auth().sendPasswordResetEmail(emailAddressRef.current)
         setIsLoginInProgress(false)
         props.navigation.navigate("CdsSigninEmailForgotSent");
      } catch (error) {
         setIsLoginInProgress(false)
         prjToast({ type: 'danger', text: error.message }) //OK
      }
   } //handleReset

   return (
      <CdsScreen signin padding={0}>
         {isLoginInProgress && <PrjBusyMask />}
         <View style={{ flex: 1, marginHorizontal: 20, marginTop: 40 }}>
            <GCHeader back transparent
               iconColor={COLORS.GC_THEME_LIGHT}
               image={require('../images/company/textNoShadow.png')} />
            {/* TODO changing is .1 seem to break ImageBackground */}
            <View style={{ flex: .2, justifyContent: 'flex-end', alignItems: 'center' }}>
               <CdsSigninNotation i18n='cmnNEW.FORGET_PASSWORD' />
               <View style={{ height: 20 }} />
               <CdsSigninNotation size={14} i18n='cmnNEW.EnterEmailAddress' />
            </View>
            <View style={{ flex: .4, justifyContent: 'center' }}>
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
               <CdsSigninButton i18n='cmnNEW.RESET'
                  onPress={handleReset}
               />

            </View>
         </View>

      </CdsScreen>
   )
}// end CdsSigninEmailForgot