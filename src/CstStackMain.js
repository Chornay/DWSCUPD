import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'
import { createStackNavigator } from '@react-navigation/stack'
import auth from '@react-native-firebase/auth';

import { APP } from 'DWcmn/APP'
import { CST } from './CST'
import { CstMain } from './CstMain';
import { CstMainShopSelect } from './CstMainShopSelect'
import { CstMenuMain } from './CstMenuMain';
import { CdsMenuCategoryScreen } from './CdsMenuCategoryScreen'
import { CstCheckout } from './CstCheckout';
import { CstCheckoutServiceLevel } from './CstCheckoutServiceLevel'
import { CstCheckoutSelectRoutePickup } from './CstCheckoutSelectRoutePickup';
import { CstPayment } from './CstPayment';
import { CstCheckoutSelectRouteDelivery } from './CstCheckoutSelectRouteDelivery';
import { CstCheckoutSummary } from './CstCheckoutSummary'
import { CstPaymentOptions } from './CstPaymentOptions';
import { CstProfile } from './CstProfile';
import { CstOrderDetail } from './CstOrderDetail';
import { CstMenuShoppingCart } from './CstMenuShoppingCart';
import { CdsCamera } from './CdsCamera'
import { CstCheckoutCoupon } from './CstCheckoutCoupon'
import { CstMainNewOrderFromQR } from './CstMainNewOrderFromQR'
import { CdsMenuItemRemarkAndPhotoScreen } from './CdsMenuItemRemarkAndPhotoScreen'
import { CstMenuOptions } from './CstMenuOptions'
import { CstSystemActionScreen } from './CstSystemActionScreen';
import { CdsMenuSearchScreen } from './CdsMenuSearchScreen'

import { dwdbfsShopGet } from 'DWcmn/dwdbfsShop'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'

//20221210 property name changed to user for Cds stuff

const RootStack = createStackNavigator()


//param user
// If we are inside this stack then we are logged so we have a listener for a logout.
// which will send us back to the auth stack
export default function CstStackMain() {

   const navigation = useNavigation()
   const { user = null } = useRoute().params ?? {}
   const isMountedRef = useIsMounted()
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)

   //we are prepared to accept a null cust (should never happen)
   //CstMain will have to check for null and annunciate
   useEffect(() => {
      (async () => {
         CST.setCust(user)

         //handle null user (should never happen)
         //remember shopRec may be null, we register users that are not (yet) in our area
         let shopRec = null
         try {
            shopRec = user ? await dwdbfsShopGet(user.shopId) : null
         } catch (error) {
            prjCloudLogError('CstStackMain.ShopGet', error, { toastI18n: "cmnNEW.MsgDbReadError" })
         }
         CST.setShop(shopRec)

         APP.setApp('cst', user)

         if (isMountedRef.current) setIsComponentInitialized(true)
      })()
   }, [])

   //we are only looking for the logout auth change
   useEffect(() => {
      const unsubscribeAuth = auth().onAuthStateChanged((authUser) => {
         // console.log('CstStackMain auth change', authUser)
         if (!authUser) {
            // console.log('CstStackMain log out')
            //CLAUDE: reset, not navigate - a stack keeps StackMain underneath, so back would return a logged-out user to it
            navigation.reset({ index: 0, routes: [{ name: 'StackSignin' }] })
         }
      })

      return () => {
         // console.log("CstStackMain unmounted")
         unsubscribeAuth() //added 20230617
      }
   }, [])

   if (!isComponentInitialized) {
      return null
   }

   return (
      <RootStack.Navigator
         initialRouteName="CstMain"
         // initialRouteName: 'CstCouponList', //20240909 test coupon
         screenOptions={{ headerShown: false }}
      >
         <RootStack.Screen name="CstMain" component={CstMain} />
         <RootStack.Screen name="CstMainShopSelect" component={CstMainShopSelect} />
         <RootStack.Screen name="CstMenuMain" component={CstMenuMain} />
         <RootStack.Screen name="CdsMenuCategoryScreen" component={CdsMenuCategoryScreen} />
         <RootStack.Screen name="CstCheckout" component={CstCheckout} />
         <RootStack.Screen name="CstMenuShoppingCart" component={CstMenuShoppingCart} />
         <RootStack.Screen name="CstCheckoutServiceLevel" component={CstCheckoutServiceLevel} />
         <RootStack.Screen name="CstCheckoutSelectRoutePickup" component={CstCheckoutSelectRoutePickup} />
         <RootStack.Screen name="CstCheckoutSelectRouteDelivery" component={CstCheckoutSelectRouteDelivery} />
         <RootStack.Screen name="CstCheckoutSummary" component={CstCheckoutSummary} />
         <RootStack.Screen name="CstPaymentOptions" component={CstPaymentOptions} />
         <RootStack.Screen name="CstPayment" component={CstPayment} />
         <RootStack.Screen name="OrderDetail" component={CstOrderDetail} />
         <RootStack.Screen name="CstProfile" component={CstProfile} />
         <RootStack.Screen name="CdsCamera" component={CdsCamera} />
         <RootStack.Screen name="CstCheckoutCoupon" component={CstCheckoutCoupon} />
         <RootStack.Screen name="CstMainNewOrderFromQR" component={CstMainNewOrderFromQR} />
         <RootStack.Screen name="CdsMenuItemRemarkAndPhotoScreen" component={CdsMenuItemRemarkAndPhotoScreen} />
         <RootStack.Screen name="CdsMenuSearchScreen" component={CdsMenuSearchScreen} />
         <RootStack.Screen name="CstMenuOptions" component={CstMenuOptions} />
         <RootStack.Screen name="CstSystemActionScreen" component={CstSystemActionScreen} />
      </RootStack.Navigator>
   )
} //end CstStackMain