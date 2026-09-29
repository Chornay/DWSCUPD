import React, { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { ListItemGBC } from 'DWcmn/PrjNativeBase'

import GLOBALS from 'DWcmn/Global';
import { CstScreen } from './CdsScreen';
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import Modal from "react-native-modal";
import I18n from 'i18n-js';
import { I18nLanguagePicker } from 'DWcmn/I18n.js'
import { GCText, GCI18n } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import { cmnSignout } from 'DWcmn/CmnFunctions'
import { dwdbfsCustGet } from 'DWcmn/dwdbfsCust'
import { CstProfileAboutUs } from './CstProfileAboutUs'
import { CstProfilePersonal } from './CstProfilePersonal'
import { CstProfileAddresses } from './CstProfileAddresses'
import { CstProfileShopSelect } from './CstProfileShopSelect'
import { CstProfileDeleteAccount } from './CstProfileDeleteAccount'
import { CstProfileHistory } from './CstProfileHistory'
import { CstProfileCoupons } from './CstProfileCoupons'
// import { CstProfileShare } from './CstProfileShare'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { CST } from './CST'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'

const MODES = {
   MAIN: 0,
   HISTORY: 5,
   PERSONAL_DETAILS: 10,
   ADDRESSES: 20,
   SELECT_SHOP: 25,
   ABOUT_US: 50,
   DELETE_ACCOUNT: 55,
   COUPON: 70,

   // LOGOUT: 60, //no state for logout
}

//Screen displays details from CST
export default function CstProfile() {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [mode, setMode] = useState(MODES.MAIN)
   const refresh = useRefresh()
   const isMountedRef = useIsMounted()


   useEffect(() => {
      setIsComponentInitialized(true)
   }, [])


   if (!isComponentInitialized) return null

   switch (mode) {

      case MODES.MAIN:
         return (

            <CstScreen>
               <GCHeader back titleI18n='cmnNEW.Profile' />
               <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                  <View style={{ width: 'auto', alignSelf: 'flex-end' }}>
                     <I18nLanguagePicker onChange={() => { refresh() }} />
                  </View>
                  <ProfileField
                     onPress={() => { setMode(MODES.HISTORY) }}
                     id={"HISTORY"}
                     i18n='cmnNEW.History'
                  />
                  <ProfileField
                     onPress={() => { setMode(MODES.PERSONAL_DETAILS) }}
                     id={"PERSON"}
                     i18n='cmnNEW.PersonalDetails'
                  />
                  <ProfileField
                     onPress={() => { setMode(MODES.COUPON) }}
                     id={"COUPON"}
                     i18n='cmnNEW.MyCoupons'
                  />
                  <ProfileField
                     onPress={() => { setMode(MODES.ADDRESSES) }}
                     id={"HOME"}
                     i18n='cmnNEW.Addresses'
                  />
                  <ProfileField
                     onPress={() => { setMode(MODES.SELECT_SHOP) }}
                     id={"SHOP"}
                     i18n='cmnNEW.SelectAShop'
                  />
                  <ProfileField
                     onPress={() => { setMode(MODES.DELETE_ACCOUNT) }}
                     id={"DELETE"}
                     i18n='cmnNEW.DeleteAccount'
                  />
                  <ProfileField
                     onPress={() => { setMode(MODES.ABOUT_US) }}
                     id={"EAR"}
                     i18n='cmnNEW.AboutUs'
                  />
                  <ProfileField
                     //CLAUDE: cmnSignout can reject - unhandled here, needs try/catch + logging
                     onPress={async () => { await cmnSignout() }}
                     id={"LOGOUT"}
                     i18n='cmnNEW.Logout'
                  />

               </View>
            </CstScreen>
         )
         break;
      case MODES.HISTORY:
         return (
            <CstProfileHistory
               onOkay={() => { setMode(MODES.MAIN) }}
            />
         )
         break;
      case MODES.PERSONAL_DETAILS:
         return (
            <CstProfilePersonal
               onCancel={() => { setMode(MODES.MAIN) }}
               onOkay={async () => {
                  //if there were changes we have to update our cust rec and the global one
                  //CLAUDE: dwdbfsCustGet can reject - unhandled here, needs try/catch + logging
                  CST.setCust(await dwdbfsCustGet(CST.getCustId()))//TODO check this okay?
                  if (isMountedRef.current) { setMode(MODES.MAIN) }
               }}
            />
         )
         break;
      //Change the customer address, Home or Alternate.
      //Change are committed to db and CST, nothing to do here  
      case MODES.ADDRESSES:
         return (
            <CstProfileAddresses
               user={CST.getCust()}
               onChange={() => {
                  setMode(MODES.MAIN)
               }}
               onCancel={() => {
                  setMode(MODES.MAIN)
               }}
               onBack={() => {
                  setMode(MODES.MAIN)
               }}
            />
         )
         break;
      case MODES.SELECT_SHOP:
         return (
            <CstProfileShopSelect
               user={CST.getCust()}
               shop={CST.getShop()}
               onCancel={() => { setMode(MODES.MAIN) }}
               onOkay={async () => {
                  setMode(MODES.MAIN)
               }}
            />
         )
         break;
      case MODES.DELETE_ACCOUNT:
         return (
            <CstProfileDeleteAccount
               user={CST.getCust()}
               onCancel={() => { setMode(MODES.MAIN) }}
            />
         )
         break;
      case MODES.ABOUT_US:
         return (
            <CstProfileAboutUs
               onOkay={() => {
                  setMode(MODES.MAIN)
               }}
            />
         )
         break;
      case MODES.COUPON:
         return (
            <CstProfileCoupons
               user={CST.getCust()}
               onOkay={() => { setMode(MODES.MAIN) }}
            />
         )
         break;

      default:
         return null
         break;

   }//end switch
} //end CstProfile

//prop onPress
//prop id   //icon to display
//prop i18n //followed by text
function ProfileField({ onPress, id, i18n }) {

   return (
      <ListItemGBC button onPress={onPress}>
         <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
            <PrjIcon style={{}} id={id} />
            <GCText>  </GCText>
            <GCI18n code={i18n} />
         </View>

      </ListItemGBC>

   )
}//end ProfileField

const styles = StyleSheet.create({
   modalStyle: {
      height: 'auto',
      width: '90%',
      backgroundColor: GLOBALS.COLOR.MODAL_INFO_BK,
      justifyContent: 'center',
      alignSelf: 'center',
      borderRadius: 10,
      padding: 10,
   },
   modalHeader: {
      justifyContent: 'center',
      alignItems: 'center',
      height: 40,
      backgroundColor: GLOBALS.COLOR.MODAL_INFO_HDR_BK,
      margin: -10,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10
   }
});