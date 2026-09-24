import React, { Component } from 'react'
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



//NOTE keyboard avoiding does not work well on this screen so we make the SIGNUP button
// disappear when the keyboard is up (using the keyboard listener)


export default class CstSigninEmailSignup extends Component {


   constructor() {
      super();
      this.state = {
         toggle: false,
         keyboardVisible: false,
         isComponentInitialized: false,
      };
      this.fields = [
         {
            key: 1,
            mandatory: true,
            title: "Email Address",
            type: "email",
            assign: (val) => { this.emailAddress = val }
         },
         {
            key: 2,
            mandatory: true,
            title: "Password",
            type: "password",
            assign: (val) => { this.emailPassword = val }
         },
         {
            key: 3,
            mandatory: true,
            title: "Confirm Password",
            type: "password",
            assign: (val) => { this.confirmPassword = val }
         }
      ]
      this.name = null
      this.emailAddress = null
      this.emailPassword = null
      this.confirmPassword = null

   }
   componentDidMount() {
      this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => { this.setState({ keyboardVisible: true }) })
      this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => { this.setState({ keyboardVisible: false }) })
      this.setState({ isComponentInitialized: true });
   }

   componentWillUnmount() {
      this.keyboardDidShowListener.remove()
      this.keyboardDidHideListener.remove()
      this.setState({ isComponentInitialized: true });
   }

   render() {
      return (
         <CdsScreen signin padding={0}>
            <View style={{ flex: 1, marginHorizontal: 20, marginTop: 40 }}>
               {this.state.isLoginInProgress && <PrjBusyMask />}
               <GCHeader back transparent
                  iconColor={COLORS.GC_THEME_LIGHT}
                  image={require('../images/company/textNoShadow.png')} />
               <KeyboardAvoidingView style={{ flex: 1 }}
                  behavior={Platform.OS === "ios" ? "padding" : null}
               >
                  <View style={{ flex: .7, justifyContent: 'center'}}>
                     <View style={{}}>
                        <View>
                           {this.fields.map((field) => {
                              return (<XFormInput signin key={field.key}
                                 options={field}
                                 refresh={() => { this.refresh() }}
                              ></XFormInput>)
                           })}
                        </View>
                     </View>
                  </View>

                  <View style={{ flex: .3, justifyContent: 'flex-start', alignItems: 'center' }}>
                     <CdsSigninButton icon='EMAIL_OUTLINE' i18n='cst.signin.SIGN_UP'
                        hide={this.state.keyboardVisible}
                        onPress={async () => {
                           if (!validateForm(this.fields)) {
                              this.refresh();
                              return
                           }

                           try {
                              Keyboard.dismiss();
                              if (this.emailPassword != this.confirmPassword) {
                                 prjAlert(strX("cst.signin.mismatchPasswords"), strX("cmn.Error"))
                              }
                              //we check the password for strength .... Firebase's only rule is 6 char minimum //TODO
                              else if (!this.checkStrength(this.emailPassword)) {
                                 prjAlert(strX("cmnNEW.ERRORWeakPassword"), strX("cmn.Error"))
                              }
                              // else if (this.state.emailPassword.getReason()){
                              //     this.setState({errorMessageMessage:translate('errMsgWeakPassword')})
                              // }
                              else {//DON'T SEND VERIFICATION EMAIL IF DOMAIN IS FOOBAR.COM
                                 const { user } = await firebase.auth().createUserWithEmailAndPassword(this.emailAddress, this.emailPassword);
                                 if (!user.email.toLowerCase().includes('foobar.com')) { await user.sendEmailVerification(); }
                                 this.props.navigation.navigate("CdsSigninEmailVerifySent");
                              }
                           }
                           catch (e) {
                              // console.log(e.code)
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
   }
   refresh = () => {
      this.setState({ toggle: !this.state.toggle })
   } //refresh 

   checkStrength = (pwd) => {
      if (pwd.length < 8) return false
      if (!RegExp("[A-Z]").test(pwd)) return false
      if (!RegExp("[a-z]").test(pwd)) return false
      if (!RegExp("[0-9]").test(pwd)) return false
      return true
   }
}// end CstSigninEmailSignup
