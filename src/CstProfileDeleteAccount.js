import React, { Component } from 'react'
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

//20230616 created

const MODES = {
   MAIN: 0,
   CONFIRM: 20,
   RE_AUTH: 30
}

//prop user
//prop onCancel()
export class CstProfileDeleteAccount extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isComponentInitialized: false,
         isCustomerDbInProgress: false,
         mode: MODES.MAIN,
      }
   }

   componentDidMount() {
      this.setState({ isComponentInitialized: true })
   }

   render() {

      switch (this.state.mode) {

         case MODES.MAIN:
            return (
               <CstScreen>
                  <GCHeader titleI18n='cmnNEW.DeleteAccount' />
                  <View style={styles.screen}>
                     <GCI18n large code={"cmnNEW.DeleteYourAccountScreenMessage"} style={{ textAlign: 'left' }} />
                  </View>
                  <GCFooterWithTwoIcons
                     onOkayCode='NEXT_IS_DELETE'
                     onOkay={async () => { this.setState({ mode: MODES.CONFIRM }) }}
                     onCancel={this.props.onCancel}
                  />
               </CstScreen >
            )

         case MODES.CONFIRM:
            return (
               <CstScreen>

                  <GCHeader titleI18n='cmnNEW.DeleteAccount' />

                  {/* if the caller is doing something lengthy he will set the disabled flag */}
                  {/* and we will cover the screen with a modal to prevent clicking         */}
                  {this.state.isCustomerDbInProgress && <PrjBusyMask />}
                  
                  <View style={styles.screen}>
                     <GCI18n large code={"cmnNEW.DeleteYourAccountConfirmMessage"} style={{ textAlign: 'left' }} />
                  </View>
                  <GCFooterWithTwoIcons
                     onOkayCode='NEXT_IS_DELETE'
                     onOkay={async () => {
                        //TODO compare auth id with id in user

                        //we have a problem because ... 
                        // 1. we can't tell if firebase will let cust do the auth delete (based on login time)
                        // 2. we have to delete the cust record before the auth (so cust has permission)
                        //SO we impose our own login "freshness"of 15 minutes (which we assume is less than firebase)
                        const currTime = new Date()
                        const loginTime = new Date(auth().currentUser?.metadata?.lastSignInTime)
                        const timeSinceLoginInMinutes = (currTime - loginTime) / 1000.0 / 60.0
                        if (timeSinceLoginInMinutes > 15) {
                           this.setState({ mode: MODES.RE_AUTH })
                           return
                        }

                        try {
                           this.setState({ isCustomerDbInProgress: true })
                           await dwdbfsCustDelete(this.props.user.id) //delete the customer record
                           await auth().currentUser.delete() //delete tjhe customer from auth
                           //NOTE don't need to (and can't) set this state variable (component will be gone)
                           // this.setState({ isCustomerDbInProgress: false })
                           //NOTE we can't do the signout ... delete does that
                           // cmnSignout()
                           //TODO do we have to take care of facebook and google signin?
                        }
                        catch (error) {
                           //TODO if we get here we are in trouble .. customer record is gone but auth remains
                           if (error.code === 'auth/requires-recent-login') {
                              this.setState({ mode: MODES.RE_AUTH })
                           }
                           else {
                              prjToast({ type: 'danger', text: error.message }) //NOT CHECKED
                           }
                           this.setState({ isCustomerDbInProgress: false })
                        }
                     }}
                     onCancel={this.props.onCancel}

                  />

               </CstScreen >
            )

         case MODES.RE_AUTH:
            return (
               <CstScreen>
                  <GCHeader titleI18n='cmnNEW.DeleteAccount' />
                  <View style={styles.screen}>
                     <GCI18n large code={"cmnNEW.DeleteYourAccountReauthMessage"} style={{ textAlign: 'left' }} />
                  </View>
                  <GCFooterWithTwoIcons
                     onOkay={async () => { await cmnSignout() }}
                     onCancel={this.props.onCancel}
                  />
               </CstScreen >
            )
      }
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
