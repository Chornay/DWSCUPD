import React, { Component } from 'react'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import auth from '@react-native-firebase/auth';

import { APP } from 'DWcmn/APP'
import { CST } from './CST'
import CstMain from './CstMain';
import CstMainShopSelect from './CstMainShopSelect'
import CstMenuMain from './CstMenuMain';
import CdsMenuCategoryScreen from './CdsMenuCategoryScreen'
import CstCheckout from './CstCheckout';
import CstCheckoutServiceLevel from './CstCheckoutServiceLevel'
import CstCheckoutSelectRoutePickup from './CstCheckoutSelectRoutePickup';
import CstPayment from './CstPayment';
import CstCheckoutSelectRouteDelivery from './CstCheckoutSelectRouteDelivery';
import CstCheckoutSummary from './CstCheckoutSummary'
import CstPaymentOptions from './CstPaymentOptions';
import CstProfile from './CstProfile';
import CstOrderDetail from './CstOrderDetail';
import CstMenuShoppingCart from './CstMenuShoppingCart';
import CdsCamera from './CdsCamera'
import { CstCheckoutCoupon } from './CstCheckoutCoupon'
import CstMainNewOrderFromQR from './CstMainNewOrderFromQR'
import CdsMenuItemRemarkAndPhotoScreen from './CdsMenuItemRemarkAndPhotoScreen'
import CstMenuOptions from './CstMenuOptions'
import { CstSystemActionScreen } from './CstSystemActionScreen';
import CdsMenuSearchScreen from './CdsMenuSearchScreen'

import { dwdbfsShopGet } from 'DWcmn/dwdbfsShop'

//20221210 property name changed to user for Cds stuff

const RootStack = createStackNavigator(
   {
      CstMain: {
         screen: CstMain,
      },
      CstMainShopSelect: {
         screen: CstMainShopSelect,
      },
      CstMenuMain: {
         screen: CstMenuMain,
      },
      CdsMenuCategoryScreen: {
         screen: CdsMenuCategoryScreen,
      },
      CstCheckout: {
         screen: CstCheckout,
      },
      CstMenuShoppingCart: {
         screen: CstMenuShoppingCart,
      },
      CstCheckoutServiceLevel: {
         screen: CstCheckoutServiceLevel,
      },
      CstCheckoutSelectRoutePickup: {
         screen: CstCheckoutSelectRoutePickup,
      },
      CstCheckoutSelectRouteDelivery: {
         screen: CstCheckoutSelectRouteDelivery,
      },
      CstCheckoutSummary: {
         screen: CstCheckoutSummary,
      },
      CstPaymentOptions: {
         screen: CstPaymentOptions,
      },
      CstPayment: {
         screen: CstPayment,
      },
      OrderDetail: {
         screen: CstOrderDetail,
      },
      CstProfile: {
         screen: CstProfile,
      },
      CdsCamera: {
         screen: CdsCamera,
      },
      CstCheckoutCoupon: {
         screen: CstCheckoutCoupon,
      },
      CstMainNewOrderFromQR: {
         screen: CstMainNewOrderFromQR,
      },
      CdsMenuItemRemarkAndPhotoScreen: {
         screen: CdsMenuItemRemarkAndPhotoScreen,
      },
      CdsMenuSearchScreen: {
         screen: CdsMenuSearchScreen,
      },
      CstMenuOptions: {
         screen: CstMenuOptions,
      },
      CstSystemActionScreen:{
         screen: CstSystemActionScreen,
      }

   }, //end of routes

   { //Navigator config options 
      initialRouteName: 'CstMain',
      // initialRouteName: 'CstCouponList', //20240909 test coupon
      defaultNavigationOptions: {
         header: null,
      }
   }

); //end stack navigator


const AppContainer = createAppContainer(RootStack);


//param user
// If we are inside this stack then we are logged so we have a listener for a logout.
// which will send us back to the auth stack
export default class CstStackMain extends Component {

   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
      };
   }


   //we are prepared to accept a null cust (should never happen)
   //CstMain will have to check for null and annunciate
   async componentDidMount() {

      const dbCust = this.props.navigation.getParam('user', null)
      CST.setCust(dbCust)

      //handle null dbCust (should never happen)
      //remember shopRec may be null, we register users that are not (yet) in our area
      const shopRec = dbCust ? await dwdbfsShopGet(dbCust.shopId) : null
      CST.setShop(shopRec)

      APP.setApp('cst', dbCust)

      this.unsubscribeAuth = auth().onAuthStateChanged(this.authStateChanged)
      this.setState({ isComponentInitialized: true })
   }

   componentWillUnmount() {
      // console.log("CstStackMain unmounted")
      this.unsubscribeAuth() //added 20230617
   } //end componentWillUnmount

   //we are only looking for the logout auth change
   authStateChanged = (user) => {
      // console.log('CstStackMain auth change', user)
      if (!user) {
         // console.log('CstStackMain log out')
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
} //end class CstStackMain


