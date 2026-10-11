import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'
import { createStackNavigator } from '@react-navigation/stack'
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';

import { APP } from 'DWcmn/APP'
import { DRV } from './DRV'
import { DS } from './DS'
import { DrvMain } from './DrvMain';
import { DrvProfile } from './DrvProfile'
import { DrvViewOrder } from './DrvViewOrder';
import { DrvViewRoute } from './DrvViewRoute'
import { DsSearch } from './DsSearch'
import { DsScanQrForOrder } from './DsScanQrForOrder'
import { DsViewOtherRoutes } from './DsViewOtherRoutes'
import { DsScanQrToAddCode } from './DsScanQrToAddCode'
import { CdsShopBoundaries } from './CdsShopBoundaries'

import { dwdbfsShopGet } from 'DWcmn/dwdbfsShop'
import { dwdbfsComboShopGet } from 'DWcmn/dwdbfsShop'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'

const RootStack = createStackNavigator()


//param user
// If we are inside this stack then we are logged so we have a listener for a logout.
// which will send us back to the auth stack
export default function DrvStackMain() {

   const navigation = useNavigation()
   const { user: dbDriver = null } = useRoute().params ?? {}
   const isMountedRef = useIsMounted()
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)

   useEffect(() => {
      (async () => {
         let comboShopRec = null
         try {
            comboShopRec = await dwdbfsComboShopGet(dbDriver.comboShopId)
         } catch (error) {
            //CLAUDE: we carry on with a null combo shop (as CstStackMain does with a null shop), but DrvMain and the Ds screens may not cope with that
            prjCloudLogError('DrvStackMain.ComboShopGet', error, { toastI18n: "cmnNEW.MsgDbReadError" })
         }
         APP.setApp('drv', dbDriver)
         APP.setComboShop(comboShopRec)
         DRV.setRec(dbDriver)
         DS.setComboShop(comboShopRec)
         //TODO check for null
         console.log("DrvStackMain mounted", dbDriver)
         if (isMountedRef.current) setIsComponentInitialized(true)
         // this.transition(user)  
      })()
   }, [])

   //we are only looking for the logout auth change
   useEffect(() => {
      const unsubscribeAuth = auth().onAuthStateChanged((user) => {
         console.log('DrvStackMain auth change', user)

         if (!user) {
            console.log('DrvStackMain log out')
            //CLAUDE: reset, not navigate - a stack keeps StackMain underneath, so back would return a logged-out user to it
            navigation.reset({ index: 0, routes: [{ name: 'StackSignin' }] })
         }
      })

      return () => {
         console.log("DrvStackMain unmounted")
         unsubscribeAuth()
      }
   }, [])

   if (!isComponentInitialized) {
      return null
   }

   return (
      <RootStack.Navigator
         initialRouteName="DrvMain"
         screenOptions={{ headerShown: false }}
      >
         <RootStack.Screen name="DrvMain" component={DrvMain} />
         <RootStack.Screen name="ViewRoute" component={DrvViewRoute} />
         <RootStack.Screen name="OrderDetail" component={DrvViewOrder} />
         <RootStack.Screen name="DrvProfile" component={DrvProfile} />
         <RootStack.Screen name="DsSearch" component={DsSearch} />
         <RootStack.Screen name="DsScanQrForOrder" component={DsScanQrForOrder} />
         <RootStack.Screen name="DsViewOtherRoutes" component={DsViewOtherRoutes} />
         <RootStack.Screen name="DsScanQrToAddCode" component={DsScanQrToAddCode} />
         <RootStack.Screen name="CdsShopBoundaries" component={CdsShopBoundaries} />
      </RootStack.Navigator>
   )
} //end DrvStackMain