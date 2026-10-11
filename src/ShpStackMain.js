import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'
import { createStackNavigator } from '@react-navigation/stack'
import auth from '@react-native-firebase/auth';
import { APP } from 'DWcmn/APP'
import { DS } from './DS'

import { ShpMain } from './ShpMain';
import { ShpProfile } from './ShpProfile'
import { ShpViewRoute } from './ShpViewRoute';
import { ShpViewOrder } from './ShpViewOrder';
import { DsSearch } from './DsSearch'
import { DsScanQrForOrder } from './DsScanQrForOrder';
import { DsViewOtherRoutes } from './DsViewOtherRoutes'
import { DsScanQrToAddCode } from './DsScanQrToAddCode'
import { DsMenuOrderChangeStart } from './DsMenuOrderChangeStart'
import { DsMenuOrderChangeSummary } from './DsMenuOrderChangeSummary'
import { DsMenuOrderChangeInvoice } from './DsMenuOrderChangeInvoice'
import { CdsMenuCategoryScreen } from './CdsMenuCategoryScreen'
import { CdsMenuItemRemarkAndPhotoScreen } from './CdsMenuItemRemarkAndPhotoScreen'
import { CdsCamera } from './CdsCamera'
import { CdsMenuSearchScreen } from './CdsMenuSearchScreen';


const RootStack = createStackNavigator()


//param user
// If we are inside this stack then we are logged so we have a listener for a logout.
// which will send us back to the auth stack
export default function ShpStackMain() {

   const navigation = useNavigation()
   const { user: dbComboShop = null } = useRoute().params ?? {}
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)

   useEffect(() => {
      APP.setApp('shp', dbComboShop)
      DS.setComboShop(dbComboShop)
      //TODO check for null
      console.log("ShpStackMain mounted", dbComboShop)
      setIsComponentInitialized(true)
      // this.transition(user)  
   }, [])

   //we are only looking for the logout auth change
   useEffect(() => {
      const unsubscribeAuth = auth().onAuthStateChanged((user) => {
         console.log('ShpStackMain auth change', user)

         if (!user) {
            console.log('ShpStackMain log out')
            //CLAUDE: reset, not navigate - a stack keeps StackMain underneath, so back would return a logged-out user to it
            navigation.reset({ index: 0, routes: [{ name: 'StackSignin' }] })
         }
      })

      return () => {
         console.log("ShpStackMain unmounted")
         unsubscribeAuth()
      }
   }, [])

   if (!isComponentInitialized) {
      return null
   }

   return (
      <RootStack.Navigator
         initialRouteName="ShpMain"
         screenOptions={{ headerShown: false }}
      >
         <RootStack.Screen name="ShpMain" component={ShpMain} />
         <RootStack.Screen name="ViewRoute" component={ShpViewRoute} />
         <RootStack.Screen name="OrderDetail" component={ShpViewOrder} />
         <RootStack.Screen name="ShpProfile" component={ShpProfile} />
         <RootStack.Screen name="DsSearch" component={DsSearch} />
         <RootStack.Screen name="DsScanQrForOrder" component={DsScanQrForOrder} />
         <RootStack.Screen name="DsViewOtherRoutes" component={DsViewOtherRoutes} />
         <RootStack.Screen name="DsScanQrToAddCode" component={DsScanQrToAddCode} />
         <RootStack.Screen name="DsMenuOrderChangeStart" component={DsMenuOrderChangeStart} />
         <RootStack.Screen name="DsMenuOrderChangeSummary" component={DsMenuOrderChangeSummary} />
         <RootStack.Screen name="DsMenuOrderChangeInvoice" component={DsMenuOrderChangeInvoice} />
         <RootStack.Screen name="CdsMenuCategoryScreen" component={CdsMenuCategoryScreen} />
         <RootStack.Screen name="CdsMenuItemRemarkAndPhotoScreen" component={CdsMenuItemRemarkAndPhotoScreen} />
         <RootStack.Screen name="CdsCamera" component={CdsCamera} />
         <RootStack.Screen name="CdsMenuSearchScreen" component={CdsMenuSearchScreen} />
      </RootStack.Navigator>
   )
} //end ShpStackMain