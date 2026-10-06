import React, { useState, useEffect, useRef } from 'react'
import { View, Keyboard, ImageBackground, KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native'
import { XFormInput, validateForm } from 'DWcmn/PrjFormInput'
import firebase from '@react-native-firebase/app';
import { strX } from 'DWcmn/I18n.js'
import '@react-native-firebase/auth';
// import { LoginButton, AccessToken } from 'react-native-fbsdk-next';
import { CdsScreen } from './CdsScreen'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { CdsSigninButton } from './CdsSigninComponents';
import { GCI18n } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import { COLORS } from 'DWcmn/Global'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'



//NOTE keyboard avoiding does not work well on this screen so we make the SIGNUP button
// disappear when the keyboard is up (using the keyboard listener)


export function CstSigninEmailSignup() {

   const navigation = useNavigation()
   const refresh = useRefresh()

   const [keyboardVisible, setKeyboardVisible] = useState(false)
   const [isLoginInProgress, setIsLoginInProgress] = useState(false)

   const emailAddressRef = useRef(null)
   const emailPasswordRef = useRef(null)
   const confirmPasswordRef = useRef(null)

   // NOTE: stable identity across renders — validateForm mutates these field
   // objects to track per-field error state, and XFormInput reads that back
   // on re-render. A plain const rebuilt every render would silently drop it.
   const fieldsRef = useRef([
      {
         key: 1,
         mandatory: true,
         title: "Email Address",
         type: "email",
         assign: (val) => { emailAddressRef.current = val }
      },
      {
         key: 2,
         mandatory: true,
         title: "Password",
         type: "password",
         assign: (val) => { emailPasswordRef.current = val }
      },
      {
         key: 3,
         mandatory: true,
         title: "Confirm Password",
         type: "password",
         assign: (val) => { confirmPasswordRef.current = val }
      }
   ])
   const fields = fieldsRef.current

   useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => { setKeyboardVisible(true) })
      const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => { setKeyboardVisible(false) })
      return () => {
         keyboardDidShowListener.remove()
         keyboardDidHideListener.remove()
      }
   }, [])

   const checkStrength = (pwd) => {
      if (pwd.length < 8) return false
      if (!RegExp("[A-Z]").test(pwd)) return false
      if (!RegExp("[a-z]").test(pwd)) return false
      if (!RegExp("[0-9]").test(pwd)) return false
      return true
   }

   return (
      <CdsScreen signin padding={0}>
         <View style={{ flex: 1, marginHorizontal: 20, marginTop: 40 }}>
            {isLoginInProgress && <PrjBusyMask />}
            <GCHeader back transparent
               iconColor={COLORS.GC_THEME_LIGHT}
               image={require('../images/company/textNoShadow.png')} />
            <KeyboardAvoidingView style={{ flex: 1 }}
               behavior={Platform.OS === "ios" ? "padding" : null}
            >
               <View style={{ flex: .7, justifyContent: 'center'}}>
                  <View style={{}}>
                     <View>
                        {fields.map((field) => {
                           return (<XFormInput signin key={field.key}
                              options={field}
                              refresh={refresh}
                           ></XFormInput>)
                        })}
                     </View>
                  </View>
               </View>

               <View style={{ flex: .3, justifyContent: 'flex-start', alignItems: 'center' }}>
                  <CdsSigninButton icon='EMAIL_OUTLINE' i18n='cst.signin.SIGN_UP'
                     hide={keyboardVisible}
                     onPress={async () => {
                        if (!validateForm(fields)) {
                           refresh();
                           return
                        }

                        try {
                           Keyboard.dismiss();
                           if (emailPasswordRef.current != confirmPasswordRef.current) {
                              prjAlert(strX("cst.signin.mismatchPasswords"), strX("cmn.Error"))
                           }
                           //we check the password for strength .... Firebase's only rule is 6 char minimum //TODO
                           else if (!checkStrength(emailPasswordRef.current)) {
                              prjAlert(strX("cmnNEW.ERRORWeakPassword"), strX("cmn.Error"))
                           }
                           // else if (this.state.emailPassword.getReason()){
                           //     this.setState({errorMessageMessage:translate('errMsgWeakPassword')})
                           // }
                           else {//DON'T SEND VERIFICATION EMAIL IF DOMAIN IS FOOBAR.COM
                              setIsLoginInProgress(true)
                              const { user } = await firebase.auth().createUserWithEmailAndPassword(emailAddressRef.current, emailPasswordRef.current);
                              if (!user.email.toLowerCase().includes('foobar.com')) { await user.sendEmailVerification(); }
                              setIsLoginInProgress(false)
                              navigation.navigate("CdsSigninEmailVerifySent");
                           }
                        }
                        catch (e) {
                           // console.log(e.code)
                           setIsLoginInProgress(false)
                           if (e.code === 'auth/email-already-in-use') {
                              prjAlert(strX('cst.err.EmailInUse'), strX("cst.signin.Unsuccessful"))
                           }
                           else {
                              prjAlert(e.message, strX("cst.signin.Unsuccessful"))
                           }
                        }
                     }}
                  />
               </View>
            </KeyboardAvoidingView>
         </View>
      </CdsScreen>
   )
}// end CstSigninEmailSignup