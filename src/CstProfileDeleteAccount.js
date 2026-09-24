import React, { useEffect, useState } from 'react'
import auth from '@react-native-firebase/auth';

import { View, StyleSheet } from 'react-native'
import { CstScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterWithTwoIcons } from 'DWcmn/GCFooterForIcons'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { dwdbfsCustDelete } from 'DWcmn/dwdbfsCust'
import { cmnSignout } from 'DWcmn/CmnFunctions'
import { prjToast } from 'DWcmn/PrjToast'
import { GCI18n } from 'DWcmn/Gc'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'

//20230616 created
//20260919 converted to functional component

const MODES = {
   MAIN: 0,
   CONFIRM: 20,
   RE_AUTH: 30
}

const STALE_TIME_MINUTES = 15 //we will insist they have logged on within this time

//prop user
//prop onCancel()
export function CstProfileDeleteAccount({ user, onCancel }) {

   //CLAUDE: isComponentInitialized is set but never tested anywhere in this component - kept per our convention
   const [isCustomerDbInProgress, setIsCustomerDbInProgress] = useState(false)
   const [mode, setMode] = useState(MODES.MAIN)
   const isMountedRef = useIsMounted()

   async function deleteAccount() {

      //deleting is a BIG deal so lets make sure the auth record agrees with our current user
      const authId = auth().currentUser?.uid
      const dbAuthId = user?.authId
      if (!authId || !dbAuthId || (authId !== dbAuthId) ) {
         prjCloudLogError('CstProfileDeleteAccount', `auth uid ${authId} does not match db auth ${dbAuthId}`)
         setMode(MODES.RE_AUTH)
         return
      }
      //we have a problem because ... 
      // 1. we can't tell if firebase will let cust do the auth delete (based on login time)
      // 2. we have to delete the cust record before the auth (so cust has permission)
      //SO we impose our own login "freshness"of 15 minutes (which we assume is less than firebase)
      const lastSignInTime = auth().currentUser?.metadata?.lastSignInTime
      //no login time means no current user (or a broken one) .. we have big problems .. log it and make them sign in again
      if (!lastSignInTime) {
         prjCloudLogError('CstProfileDeleteAccount', 'no current user or no lastSignInTime')
         setMode(MODES.RE_AUTH)
         return
      }
      const currTime = new Date()
      const loginTime = new Date(lastSignInTime)
      const timeSinceLoginInMinutes = (currTime - loginTime) / 1000.0 / 60.0
      if (timeSinceLoginInMinutes > STALE_TIME_MINUTES) {
         setMode(MODES.RE_AUTH)
         return
      }

      try {
         setIsCustomerDbInProgress(true)
         await dwdbfsCustDelete(user.id) //delete the customer record
         await auth().currentUser.delete() //delete the customer from auth
         //NOTE don't need to (and can't) set this state variable (component will be gone)
         // setIsCustomerDbInProgress(false)
         //NOTE we can't do the signout ... delete does that
         // cmnSignout()
         //TODO do we have to take care of facebook and google signin?
      }
      catch (error) {
         //TODO if we get here we are in trouble .. customer record is gone but auth remains
         if (isMountedRef.current) {
            if (error.code === 'auth/requires-recent-login') {
               setMode(MODES.RE_AUTH)
            }
            else {
               prjToast({ type: 'danger', text: error.message }) //NOT CHECKED
            }
            setIsCustomerDbInProgress(false)
         }
      }
   } //deleteAccount


   switch (mode) {

      case MODES.MAIN:
         return (
            <CstScreen>
               <GCHeader titleI18n='cmnNEW.DeleteAccount' />
               <View style={styles.screen}>
                  <GCI18n large code={"cmnNEW.DeleteYourAccountScreenMessage"} style={{ textAlign: 'left' }} />
               </View>
               <GCFooterWithTwoIcons
                  onOkayCode='NEXT_IS_DELETE'
                  onOkay={async () => { setMode(MODES.CONFIRM) }}
                  onCancel={onCancel}
               />
            </CstScreen>
         )

      case MODES.CONFIRM:
         return (
            <CstScreen>

               <GCHeader titleI18n='cmnNEW.DeleteAccount' />

               {/* if the caller is doing something lengthy he will set the disabled flag */}
               {/* and we will cover the screen with a modal to prevent clicking         */}
               {isCustomerDbInProgress && <PrjBusyMask />}

               <View style={styles.screen}>
                  <GCI18n large code={"cmnNEW.DeleteYourAccountConfirmMessage"} style={{ textAlign: 'left' }} />
               </View>
               <GCFooterWithTwoIcons
                  onOkayCode='NEXT_IS_DELETE'
                  onOkay={deleteAccount}
                  onCancel={onCancel}

               />

            </CstScreen>
         )

      case MODES.RE_AUTH:
         return (
            <CstScreen>
               <GCHeader titleI18n='cmnNEW.DeleteAccount' />
               <View style={styles.screen}>
                  <GCI18n large code={"cmnNEW.DeleteYourAccountReauthMessage"} style={{ textAlign: 'left' }} />
               </View>
               <GCFooterWithTwoIcons
                  //CLAUDE: cmnSignout can reject - unhandled here, needs try/catch + logging
                  onOkay={async () => { await cmnSignout() }}
                  onCancel={onCancel}
               />
            </CstScreen>
         )
   }
}// end CstProfileDeleteAccount

const styles = StyleSheet.create({
   screen: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingLeft: 30,
      paddingRight: 30,
   }
})