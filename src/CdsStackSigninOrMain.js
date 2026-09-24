import React, { Component } from 'react'

import firebase from '@react-native-firebase/app';
import { cmnSignout } from 'DWcmn/CmnFunctions'

import CdsSpinnerScreen from './CdsSpinnerScreen';
import { dwdbfsUserGetByAuthAndAppType } from 'DWcmn/DWDBfs'
import { getInitialLanguage } from 'DWcmn/I18n'

//20250502 added language initialize

//param appType
export default class CdsStackSigninOrMain extends Component {

   constructor() {
      super();
      this.state = {
      }
      this.appType = ''
   }

   async componentDidMount() {

      await getInitialLanguage()

      this.appType = this.props.navigation.getParam('appType');

      //check for an 'auto' login .. returning having not logged off
      //we do NOT allow this for a user that has not finished enrolling
      //because we always want to know their login method

      let fbUser = firebase.auth().currentUser
      // console.log(this.appType, 'CdsStackSigninOrMain mounted', fbUser)

      if (fbUser) {  //if the user has a firebase authorization
         let dbUser = await dwdbfsUserGetByAuthAndAppType(this.appType, fbUser.uid)
         // console.log("user from database",dbUser)
         if (dbUser) { // if we have a database record for that auth id
            // console.log(this.appType, 'going to stackmain')
            this.props.navigation.navigate("StackMain", { 'user': dbUser, 'comeFrom': 'auto' })
         }
         else {//they have auth entry but no database record 
            //log them out and they will have to login again
            await cmnSignout()
            // console.log(this.appType, 'going to stacksignin')
            this.props.navigation.navigate("StackSignin")
         }
      }
      else { //go let them sign in
         this.props.navigation.navigate("StackSignin")
      }
   }

   componentWillUnmount() {
      // console.log(this.appType, 'CdsStackSigninOrMain dismount')
   }

   render() {
      return (
         <CdsSpinnerScreen />
      )
   }
}

