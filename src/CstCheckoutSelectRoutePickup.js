import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, View, FlatList, TouchableOpacity, AppState } from 'react-native'
import { ListItemXYZ } from 'DWcmn/GCNB';
import { dwdbfsShopGetRoutesAsArray } from 'DWcmn/dwdbfsShop'
import { prjRouteName } from 'DWcmn/PrjCmnFunctions'
import { CstScreen } from './CdsScreen';
import { PrjSpacer } from 'DWcmn/Prj'
import CstSpinnerScreen from './CstSpinnerScreen';
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import GCHeader from 'DWcmn/GCHeader' //NOTE doing the default import
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import { CmnServiceLevelBanner } from 'DWcmn/CmnServiceLevelBanner'
import { strX } from 'DWcmn/I18n';
import moment from 'moment';
import { COLORS } from 'DWcmn/Global'
import { CstCheckoutStop } from './CstCheckoutStop'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { GCStaticMap } from 'DWcmn/GCStaticMap'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { prjToast } from 'DWcmn/PrjToast'
import { CST } from './CST'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'

//20221003 changed route select to be full wide touchable
//20231107 added check for processing time adjustment in route
//20250210 added reschedule functionality

//CstCheckoutSelectRoutePickup
//allows the customer to chose an arrival time and location
//Forward arrow adds the pickup info to order and goes to the Delivery Options screen
//

//param order
//param reschedule flag true iff this is an existing order being rescheduled
//on entry we expect the following in the order
//    shopId
//    service level
//    pickup stop initialized to the home address
//  and in the shop rec
//    routeAvailableOffset which is the number of minutes we allow 'before' a route
//    hoursOfPickupRoutes 
//on forward navigate
//  the following will be set in the order
//     pickup route time docId
//     pickup stop

//returns either the current time or the end of the curfew if we are in curfew window
const getCurrentMomentAdjustedForCurfew = (order) => {

   const { curfewStart, curfewEnd } = order
   const now = moment();
   const currentHour = now.hour() + now.minute() / 60; // fractional hour

   //no action if either is missing
   if (!(curfewStart && curfewEnd)) {
      return now
   }

   else if (withinCurfew(currentHour, curfewStart, curfewEnd)) {
      return (getCurfewEnd(currentHour, curfewStart, curfewEnd))
   }

   else {
      return now
   }
}

//returns true iif the current hour is within the curfew hours (including overnight case)
const withinCurfew = (currentHour, curfewStart, curfewEnd) => {
   if (curfewStart <= curfewEnd) {
      // Same-day range, e.g. 09:00–17:00
      return currentHour >= curfewStart && currentHour < curfewEnd;
   } else {
      // Overnight range, e.g. 23:00–07:00
      return currentHour >= curfewStart || currentHour < curfewEnd;
   }
}

//returns moment that is the time of the end of the curfew
//  ..the curfew end hour ... but remember it may be tomorrow.
const getCurfewEnd = (currentHour, curfewStart, curfewEnd) => {

   const isOvernight = curfewStart > curfewEnd;
   const pastMidnight = isOvernight && currentHour < curfewEnd;

   return moment()
      .startOf('day')
      .add(pastMidnight ? 0 : (isOvernight ? 1 : 0), 'days')
      .add(curfewEnd, 'hours');
}


//returns true iff the route is to be included for display
//for express pickup the route must be marked as eligible (ie perhaps not late day ones)
//for sameday pickup the same .... ie perhaps only early morning pickup eligible)
const serviceLevelFilter = (route, serviceLevel) => {
   //CLAUDE the service level strings ('express', 'sameDay') should be named constants
   if (serviceLevel == 'express') return route.pickupExp
   if (serviceLevel == 'sameDay') return route.pickupSameDay
   return true
}


const CstCheckoutSelectRoutePickup = ({ navigation }) => {

   const refresh = useRefresh()
   const isMountedRef = useIsMounted()
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [selIndex, setSelIndex] = useState(-1)
   const [routes, setRoutes] = useState([])
   const orderRef = useRef(null)
   const rescheduleRef = useRef(false)
   const staticMapPointerRef = useRef(null)

   //load the routes for the pickup window .. called at mount and again when we come back to the foreground
   const loadRoutes = async () => {

      //by design a failure leaves this empty .. an empty but functional screen plus a toast, never a stuck spinner
      let newRoutes = []
      try {
         const minMinutesTillPickup = CST.getShop().routeAvailableOffset
         const hoursToDisplay = CST.getShop().hoursOfPickupRoutes
         const shopId = orderRef.current.shopId

         const adjustedCurrentMoment = getCurrentMomentAdjustedForCurfew(orderRef.current)
         const earliestMoment = adjustedCurrentMoment.add(minMinutesTillPickup, "minutes")

         const earliestTime = earliestMoment.toDate()
         const latestTime = earliestMoment.add(hoursToDisplay, "hours").toDate()

         const allRoutes = await dwdbfsShopGetRoutesAsArray(shopId, earliestTime, latestTime)
         newRoutes = allRoutes.filter((route) => serviceLevelFilter(route, orderRef.current.serviceLevel))
      }
      catch (error) {
         prjCloudLogError('CstCheckoutSelectRoutePickup', error)
      }
      finally {
         if (isMountedRef.current) {
            setSelIndex(-1) //a selection is an index into the old array so it can't survive a reload
            setRoutes(newRoutes)
            setIsComponentInitialized(true)
         }
      }
   }//end loadRoutes


   useEffect(() => {

      //ASSERT check that shop.id === cust.shopId === order.shopId
      //ASSERT order is not null
      orderRef.current = navigation.getParam('order', null)
      rescheduleRef.current = navigation.getParam('reschedule', false)

      loadRoutes() //NOTE we do NOT set isComponentInitialized here .. loadRoutes does that when the first load completes

      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-time only, nav params are read once, loadRoutes only uses refs and setters
   }, [])


   //the routes (and the time window they were loaded for) go stale if we are away for a while
   //so reload when the app comes back to the foreground from the background.
   //NOTE 'inactive' alone (eg iOS notification shade) does not count .. it would wipe the customer's selection
   useEffect(() => {

      let wasInBackground = false
      const handleAppStateChange = (nextAppState) => {
         if (nextAppState === 'background') {
            wasInBackground = true
         }
         else if (nextAppState === 'active' && wasInBackground) {
            wasInBackground = false
            loadRoutes()
         }
      }
      //NOTE Claude code handles R/N above and below 7.0
      const appStateSubscription = AppState.addEventListener('change', handleAppStateChange)
      return () => {
         if (appStateSubscription && appStateSubscription.remove) { appStateSubscription.remove() }
         else { AppState.removeEventListener('change', handleAppStateChange) }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-time only, loadRoutes only uses refs and setters
   }, [])


   if (!isComponentInitialized) {
      return (
         <CstSpinnerScreen />
      );
   }

   const order = orderRef.current
   const reschedule = rescheduleRef.current

   const renderRouteButton = ({ item, index }) => {

      const maybeHighlightStyle = ((index == selIndex) ? PRJ_STYLES.highlightSelected : null)

      return (
         <ListItemXYZ style={[{ justifyContent: 'center' }, maybeHighlightStyle]}>

            <TouchableOpacity
               onPress={() => {
                  //select this button, or deselect it if it is already the selected one
                  setSelIndex(selIndex == index ? -1 : index)
               }}
               keyExtractor={(item, index) => index.toString()}
            >
               <GCText style={{ paddingVertical: 10 }}>{prjRouteName(item.schedDate, item.descrip)}</GCText>
            </TouchableOpacity>
         </ListItemXYZ>
      )
   }// end renderRouteButton

   return (

      <CstScreen>
         <GCHeader back cancel cancelConfirmI18n={reschedule ? "cmnNEW.DiscardTheseChanges_" : null}
            titleI18n={reschedule ? 'cmnNEW.NewPickupDetails' : 'cmnNEW.PickupDetails'}
            noBottomPadding />

         <View style={{ flex: 1 }}>

            {/* list available routes */}
            {/*SC The flexBasis used to be .3 but that cause iOS view hide under another when click the schedule tile*/}
            <View style={{ flexBasis: 120, flexGrow: 1, marginHorizontal: GC_STD_MARGIN }}>
               <CmnServiceLevelBanner level={order.serviceLevel} />
               <PrjSpacer size={10} />
               <GCI18n title code="cmnNEW.ChooseYourTime"></GCI18n>
               <FlatList
                  data={routes}
                  renderItem={renderRouteButton}
                  extraData={selIndex}
                  keyExtractor={(item, index) => index.toString()}
               />
            </View>
            {/* show (touchable) location title*/}
            <PrjSpacer size={10} />
            <View style={{ flex: 0 }}>
               <View style={{ marginHorizontal: GC_STD_MARGIN }}>
                  <GCText title>{strX("cmnNEW.YourPickupLocation")}</GCText>
                  <PrjSpacer size={10} />
                  {/* title and a button to change the address */}
                  {/*<CstCheckoutSectionTitle style={{ paddingRight: '2%' }} i18n="cstNEW.AddressAndInstructions" />*/}
                  <CstCheckoutStop
                     shop={CST.getShop()}
                     stop={order.pickupStop}
                     pickupStop={null}
                     // buttonI18n={"cmnNEW.addressCode." + order.pickupStop.code}
                     titleI18n="cmnNEW.ChangePickupLocation_"
                     onChange={() => {
                        if (Boolean(order.pickupStop.location) && Boolean(staticMapPointerRef.current)) {
                           staticMapPointerRef.current.recenterMap(order.pickupStop.location)
                        }
                        refresh()
                     }}
                     onCustom={() => {
                        if (Boolean(order.pickupStop.location) && Boolean(staticMapPointerRef.current)) {
                           staticMapPointerRef.current.recenterMap(order.pickupStop.location)
                        }
                        //they have selected a custom address ... but there will be no address yet.
                        refresh()
                     }}
                  >
                  </CstCheckoutStop>
               </View>

               {/* show an (unmoveable, untouchable) map of current pickup location*/}
               {/* NOTE that we get a reference to the map so we can move it       */}
               {/* NOTE can't display if there is no address       */}

               <PrjSpacer size={5} />
               {(Boolean(order.pickupStop.location)) &&
                  <GCStaticMap location={order.pickupStop.location} height={150}
                     ref={staticMapPointerRef} />}

            </View>
         </View>

         <GCFooterWithSingleIcon
            code={"NEXT_IS_DELIVERY"}
            hide={selIndex === -1}
            onPress={() => {
               if (!Boolean(order.pickupStop.address)) {
                  prjToast({ type: 'reminder', i18n: 'cmnNEW.PleaseEnterCustomAddress' }) //OK
               }
               else {
                  const route = routes[selIndex]
                  order.pickupRouteTime = route.schedDate
                  order.pickupRouteId = route.docId
                  order.pickupRouteDescrip = route.descrip
                  if (route.procTimeReg) { order.procTimeReg = route.procTimeReg }
                  navigation.navigate('CstCheckoutSelectRouteDelivery',
                     { 'order': order, 'reschedule': reschedule })
               }
            }}
         />
      </CstScreen >
   );

}// end CstCheckoutSelectRoutePickup

export default CstCheckoutSelectRoutePickup