import React, { useEffect, useState } from 'react'
import { View, Platform, TouchableOpacity } from 'react-native'
import { Linking } from 'react-native'
// import { SpinnerXYZ, ListItemXYZ, LeftXYZ, RightXYZ } from 'DWcmn/GCNB'
import { ListItemGBC, ListItemRight, ListItemBody, ListItemLeft } from 'DWcmn/PrjNativeBase'
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import { GCText, GCI18n } from 'DWcmn/Gc'
import { PrjWebView } from 'DWcmn/PrjWebView'
import { CdsScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { DW_EMAIL_ADDRESS, DW_PHONE_NUMBER, DW_SMS_NUMBER, DW_WHATSAPP_NUMBER } from 'DWcmn/Global'
import { prjToast } from 'DWcmn/PrjToast'
import { getAppBuild, getAppVersion } from 'DWcmn/cmnDeviceFunctions'
import { CST } from './CST'
import { prjCallOnPhone, prjWhatsapp } from 'DWcmn/prjExternalApps'

//20230830 changed version and build to use methods from cmnDeviceFunctions
//20260919 converted to functional components

const MODES = {
   INIT: 10,
   MAIN: 20,
   T_AND_C: 30,
   PRIVACY_POLICY: 40,
}

//NOTE Linking.canOpenUrl doesn't work on either ios or android
// left the check in case we can fix it (and or'd with true to disable)


//prop onOkay .. back button pressed
export function CstProfileAboutUs({ onOkay }) {

   const [mode, setMode] = useState(MODES.INIT)


   useEffect(() => {
      setMode(MODES.MAIN)
   }, [])


   switch (mode) {

      case MODES.INIT:
         return null

      case MODES.MAIN:
         return (

            <CdsScreen>
               <GCHeader back={onOkay} titleI18n='cmnNEW.AboutUs' />

               <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                  <View style={{ flex: .9, justifyContent: 'flex-start' }}>
                     <AboutUsField
                        onPress={async () => { await prjCallOnPhone({ support: true }) }}
                        id={"PHONE"}
                        i18n='cmnNEW.CallUs'
                     />
                     <AboutUsField
                        onPress={async () => { await smsToDW() }}
                        id={"SMS"}
                        i18n='cmnNEW.Message'
                     />
                     <AboutUsField
                        onPress={async () => { await prjWhatsapp({ custId: CST.getCustId() }) }}
                        id={"WHATSAPP"}
                        i18n='cmnNEW.WhatsAPP'
                     />
                     <AboutUsField
                        onPress={async () => { await emailToDW() }}
                        id={"EMAIL"}
                        i18n='cmnNEW.Email'
                     />
                     <AboutUsField
                        onPress={() => { setMode(MODES.T_AND_C) }}
                        id={"TERMS_OF_USE"}
                        i18n='cst.signin.Terms_and_Conditions'
                     />
                     <AboutUsField
                        onPress={() => { setMode(MODES.PRIVACY_POLICY) }}
                        id={"PRIVACY"}
                        i18n='cst.signin.Privacy_Policy'
                     />
                  </View>
                  <View style={{ flex: .1, justifyContent: 'flex-end' }}>
                     <ListItemGBC>
                        <ListItemLeft><GCText>Version</GCText></ListItemLeft>
                        <ListItemRight><GCText fit>{getAppVersion()}</GCText></ListItemRight>
                     </ListItemGBC>
                     <ListItemGBC>
                        <ListItemLeft><GCText>Build</GCText></ListItemLeft>
                        <ListItemRight><GCText fit>{getAppBuild()}</GCText></ListItemRight>
                     </ListItemGBC>

                  </View>
               </View>
            </CdsScreen>
         )
         break;

      case MODES.T_AND_C:
         return (
            <CdsScreen>
               <PrjWebView
                  titleI18n='cst.signin.Terms_and_Conditions'
                  //CLAUDE: this URL (and the privacy policy one below) should be named constants alongside DW_EMAIL_ADDRESS etc. in Global
                  url='https://www.dobbywalla.com/apps-termsandcondition'
                  onDone={() => { setMode(MODES.MAIN) }}
               />
            </CdsScreen>)
         break;

      case MODES.PRIVACY_POLICY:
         return (
            <CdsScreen>
               <PrjWebView
                  titleI18n='cst.signin.Privacy_Policy'
                  url='https://www.dobbywalla.com/app-privacypolicy'
                  onDone={() => { setMode(MODES.MAIN) }}
               />
            </CdsScreen>)
         break;

      default:
         return null
         break;

   }//end switch

} //end CstProfileAboutUs


//link to email DW support
async function emailToDW() {
   //CLAUDE: 'Message from customer ' is duplicated here and in smsToDW - should be a named constant (or an i18n string)
   const subject = encodeURIComponent('Message from customer ' + CST.getCustId())
   const url = `mailto:${DW_EMAIL_ADDRESS}?subject=${subject}`;
   try {
      if (await Linking.canOpenURL(url)) {
         await Linking.openURL(url)
      }
      else {
         prjToast({ type: 'warning', i18n: 'cmnNEW.MsgCantOpenEmail' }) //OK
      }
   }
   catch (error) {
      prjToast({ type: 'danger', i18n: 'cmnNEW.MsgCantOpenEmail' }) //OK
   }
} //end emailToDW


//link to sms DW support
async function smsToDW() {
   const separator = Platform.OS === 'ios' ? '&' : '?'
   const message = encodeURIComponent('Message from customer ' + CST.getCustId() + '\n')
   const url = `sms:${DW_SMS_NUMBER}${separator}body=${message}`
   try {
      if (await Linking.canOpenURL(url)) {
         await Linking.openURL(url)
      }
      else {
         prjToast({ type: 'warning', i18n: 'cmnNEW.MsgCantOpenMessaging' }) //OK
      }
   }
   catch (error) {
      prjToast({ type: 'danger', i18n: 'cmnNEW.MsgCantOpenMessaging' }) //OK
   }
} //end smsToDW


//prop onPress
//prop id   //icon to display
//prop i18n //followed by text
function AboutUsField({ onPress, id, i18n }) {

   return (
      <ListItemGBC button onPress={onPress}>
         <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
            <PrjIcon style={{}} id={id} />
            <GCText>  </GCText>
            <GCI18n code={i18n} />
         </View>
      </ListItemGBC>

   )
}//end AboutUsField