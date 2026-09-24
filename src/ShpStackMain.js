import React, { Component } from 'react'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { APP } from 'DWcmn/APP'
import { DS } from './DS'

import ShpMain from './ShpMain';
import ShpProfile from './ShpProfile'
import ShpViewRoute from './ShpViewRoute';
import ShpViewOrder from './ShpViewOrder';
import DsSearch from './DsSearch'
import DsScanQrForOrder from './DsScanQrForOrder';
import DsViewOtherRoutes from './DsViewOtherRoutes'
import DsScanQrToAddCode from './DsScanQrToAddCode'
import DsMenuOrderChangeStart from './DsMenuOrderChangeStart'
import DsMenuOrderChangeSummary from './DsMenuOrderChangeSummary'
import DsMenuOrderChangeInvoice from './DsMenuOrderChangeInvoice'
import CdsMenuCategoryScreen from './CdsMenuCategoryScreen'
import CdsMenuItemRemarkAndPhotoScreen from './CdsMenuItemRemarkAndPhotoScreen'
import CdsCamera from './CdsCamera'
import CdsMenuSearchScreen from './CdsMenuSearchScreen';


const RootStack = createStackNavigator(
   {
      ShpMain: {
         screen: ShpMain,
      },
      ViewRoute: {
         screen: ShpViewRoute,
      },
      OrderDetail: {
         screen: ShpViewOrder,
      },
      ShpProfile: {
         screen: ShpProfile,
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
      DsMenuOrderChangeStart: {
         screen: DsMenuOrderChangeStart,
      },
      DsMenuOrderChangeSummary: {
         screen: DsMenuOrderChangeSummary,
      },
      DsMenuOrderChangeInvoice: {
         screen: DsMenuOrderChangeInvoice,
      },
      CdsMenuCategoryScreen: {
         screen: CdsMenuCategoryScreen,
      },
      CdsMenuItemRemarkAndPhotoScreen: {
         screen: CdsMenuItemRemarkAndPhotoScreen,
      },
      CdsCamera: {
         screen: CdsCamera,
      },
      CdsMenuSearchScreen: {
         screen: CdsMenuSearchScreen
      }

   }, //end of routes

   { //Navigator config options 
      initialRouteName: 'ShpMain',
      defaultNavigationOptions: {
         header: null,
      }
   }

); //end stack navigator


const AppContainer = createAppContainer(RootStack);


//param user
// If we are inside this stack then we are logged so we have a listener for a logout.
// which will send us back to the auth stack
export default class ShpStackMain extends Component {

   constructor() {
      super();
      this.state = {
         isComponentInitialized: false,
      };
   }

   async componentDidMount() {
      const dbComboShop = this.props.navigation.getParam('user', null)
      APP.setApp('shp', dbComboShop)
      DS.setComboShop(dbComboShop)
      //TODO check for null
      console.log("ShpStackMain mounted", dbComboShop)
      this.unsubscribeAuth = auth().onAuthStateChanged(this.authStateChanged)
      this.setState({ isComponentInitialized: true })
      // this.transition(user)  
   }

   componentWillUnmount() {
      console.log("ShpStackMain unmounted")
   } //end componentWillUnmount

   //we are only looking for the logout auth change
   authStateChanged = (user) => {
      console.log('ShpStackMain auth change', user)

      if (!user) {
         console.log('ShpStackMain log out')
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
} //end class ShpStackMain


