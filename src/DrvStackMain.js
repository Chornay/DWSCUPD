import React, { Component } from 'react'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

import { APP } from 'DWcmn/APP'
import { DRV } from './DRV'
import { DS } from './DS'
import DrvMain from './DrvMain';
import DrvProfile from './DrvProfile'
import DrvViewOrder from './DrvViewOrder';
import DrvViewRoute from './DrvViewRoute'
import DsSearch from './DsSearch'
import DsScanQrForOrder from './DsScanQrForOrder'
import DsViewOtherRoutes from './DsViewOtherRoutes'
import DsScanQrToAddCode from './DsScanQrToAddCode'
import CdsShopBoundaries from './CdsShopBoundaries'

import { dwdbfsShopGet } from 'DWcmn/dwdbfsShop'
import { dwdbfsComboShopGet } from 'DWcmn/dwdbfsShop'

const RootStack = createStackNavigator(
   {
      DrvMain: {
         screen: DrvMain,
      },
      ViewRoute: {
         screen: DrvViewRoute,
      },
      OrderDetail: {
         screen: DrvViewOrder,
      },
      DrvProfile: {
         screen: DrvProfile,
      },
      DsSearch: {
         screen: DsSearch,
      },
      DsScanQrForOrder: {
         screen: DsScanQrForOrder,
      },
      DsViewOtherRoutes: {
         screen: DsViewOtherRoutes,
      },
      DsScanQrToAddCode: {
         screen: DsScanQrToAddCode,
      },
      CdsShopBoundaries: {
         screen: CdsShopBoundaries,
      },
   }, //end of routes

   { //Navigator config options 
      initialRouteName: 'DrvMain',
      defaultNavigationOptions: {
         header: null,
      }
   }

); //end stack navigator


const AppContainer = createAppContainer(RootStack);


//param user
// If we are inside this stack then we are logged so we have a listener for a logout.
// which will send us back to the auth stack
export default class DrvStackMain extends Component {

   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
      };
   }

   async componentDidMount() {
      const dbDriver = this.props.navigation.getParam('user', null)
      const comboShopRec = await dwdbfsComboShopGet(dbDriver.comboShopId)
      APP.setApp('drv', dbDriver)
      APP.setComboShop(comboShopRec)
      DRV.setRec(dbDriver)
      DS.setComboShop(comboShopRec)
      //TODO check for null
      console.log("DrvStackMain mounted", dbDriver)
      this.unsubscribeAuth = auth().onAuthStateChanged(this.authStateChanged)
      this.setState({ isComponentInitialized: true })
      // this.transition(user)  
   }

   componentWillUnmount() {
      console.log("DrvStackMain unmounted")
   } //end componentWillUnmount

   //we are only looking for the logout auth change
   authStateChanged = (user) => {
      console.log('DrvStackMain auth change', user)

      if (!user) {
         console.log('DrvStackMain log out')
         this.props.navigation.navigate("StackSignin")
      }
   }

   render() {
      if (!this.state.isComponentInitialized) {
         return null
      }
      return (
         <AppContainer />
      );
   }
} //end class DrvStackMain


