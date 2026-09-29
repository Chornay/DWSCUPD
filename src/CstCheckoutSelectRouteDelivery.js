import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native'
import { AppState } from 'react-native' 
import { ListItemGBC, ListItemRight, ListItemBody, ListItemLeft } from 'DWcmn/PrjNativeBase'
import { dwdbfsShopGetRoutesAsArray } from 'DWcmn/dwdbfsShop'
import { prjRouteName } from 'DWcmn/PrjCmnFunctions'
import { CstScreen } from './CdsScreen';
import { PrjSpacer } from 'DWcmn/Prj'
import CstSpinnerScreen from './CstSpinnerScreen';
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import GCHeader from 'DWcmn/GCHeader' //NOTE doing the default import
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import { CmnServiceLevelBanner } from 'DWcmn/CmnServiceLevelBanner'
import { strX } from 'DWcmn/I18n';
import moment from 'moment';
import { CstCheckoutStop } from './CstCheckoutStop'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { GCStaticMap } from 'DWcmn/GCStaticMap'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { prjToast } from 'DWcmn/PrjToast'
import { CST } from './CST'
import { prjStopCopy } from 'DWcmn/prjStopFunctions'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { useRefresh } from 'DWcmn/prjUseRefresh'

//20221003 changed route select to be full wide touchable
//20221111 changed to use spread in DidMount to set initial value
//20250210 added reschedule functionality

//CstCheckoutSelectRouteDelivery
//allows the customer to chose a delivery time and location
//Forward arrow adds the delivery info to order and goes to the Order Summary screen
//

//param order
//param reschedule flag true iff this is an existing order begin rescheduled
//on entry in order we want:
//    shopId
//  pickup route
//  pickup address & location
//  procTimeReg, procTimeExp, procTimeSameDay .. the minimum # of hours to do the order
//  serviceLevel
//on exit we will have added to the order:
//  delivery route
//  delivery address & location

const CstCheckoutSelectRouteDelivery = ({ navigation }) => {

   const refresh = useRefresh()
   const isMountedRef = useIsMounted()
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [selIndex, setSelIndex] = useState(-1)
   const [routes, setRoutes] = useState([])
   const orderRef = useRef(null)
   const rescheduleRef = useRef(false)
   const staticMapPointerRef = useRef(null)

   //load routes array with two days worth of routes that are available after the processing time
   //called at mount (and again when we come back to the foreground .. see the AppState effect below)
   const loadRoutes = async () => {

      //by design a failure leaves this empty .. an empty but functional screen plus a toast, never a stuck spinner
      let newRoutes = []
      try {
         const order = orderRef.current
         const hoursToDisplay = CST.getShop().hoursOfDeliveryRoutes
         const shopId = order.shopId

         //pick the processing time based on service level
         //CLAUDE the service level strings ('express', 'sameDay', 'regular') should be named constants
         let minProcessingTime
         switch (order.serviceLevel) {
            case 'express': minProcessingTime = order.procTimeExp; break
            case 'sameDay': minProcessingTime = order.procTimeSameDay; break
            case 'regular':
            default: minProcessingTime = order.procTimeReg; break
         }

         //NOW we also calculate a maximum processing time .... eg if they are paying for same day
         //then let's not give them options that are the same service level as express etc.
         //remember hours to display comes from shop
         let maxProcessingTime
         switch (order.serviceLevel) {
            case 'express': maxProcessingTime = order.procTimeReg; break
            case 'sameDay': maxProcessingTime = order.procTimeExp; break
            case 'regular':
            default: maxProcessingTime = order.procTimeReg + hoursToDisplay; break
         }

         // const minProcessingTime = order.serviceLevel === 'express'?order.procTimeExp:order.procTimeReg
         const earliestTimeAsMoment = moment(order.pickupRouteTime).add(minProcessingTime, "hours")
         const earliestTime = earliestTimeAsMoment.toDate()
         const latestTimeAsMoment = moment(order.pickupRouteTime).add(maxProcessingTime, "hours")
         //TODO should the end be inclusive?
         //NOTE dwdbfsShopGetRoutesAsArray is inclusive (<=) at the end but this screen has always been exclusive (<)
         //     so we take a millisecond off to keep it that way. Drop the subtract if the answer to the TODO is yes.
         const latestTime = latestTimeAsMoment.subtract(1, "milliseconds").toDate()

         newRoutes = await dwdbfsShopGetRoutesAsArray(shopId, earliestTime, latestTime)
      }
      catch (error) {
         prjCloudLogError('CstCheckoutSelectRouteDelivery', error)
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

      orderRef.current = navigation.getParam('order', null)
      rescheduleRef.current = navigation.getParam('reschedule', false)

      //if the delivery address is not set then use the pickup
      if ((!Boolean(orderRef.current.deliveryStop))) {
         orderRef.current.deliveryStop = prjStopCopy(orderRef.current.pickupStop)
      }

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

   const renderRouteButton = ({ item, index }) => {

      const maybeHighlightStyle = ((index == selIndex) ? PRJ_STYLES.highlightSelected : null)

      return (
         <ListItemGBC button style={[{ justifyContent: 'center' }, maybeHighlightStyle]}

               onPress={() => {
                  //select this button, or deselect it if it is already the selected one
                  setSelIndex(selIndex == index ? -1 : index)
               }}
            >
               <GCText style={{ paddingVertical: 10 }}>{prjRouteName(item.schedDate, item.descrip)}</GCText>

         </ListItemGBC>
      )
   }// end renderRouteButton


   if (!isComponentInitialized) {
      return (
         <CstSpinnerScreen />
      );
   }

   //aliases .. safe to take here because the order is set before isComponentInitialized goes true
   const order = orderRef.current
   const reschedule = rescheduleRef.current

   return (

      <CstScreen>
         <GCHeader back cancel cancelConfirmI18n={reschedule ? "cmnNEW.DiscardTheseChanges_" : null}
            titleI18n={reschedule ? 'cmnNEW.NewDeliveryDetails' : 'cmnNEW.DeliveryDetails'}
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
            <PrjSpacer size={20} />
            {/* show (touchable) location title*/}
            <PrjSpacer size={10} />
            <View style={{ flex: 0 }}>
               <View style={{ marginHorizontal: GC_STD_MARGIN }}>
                  <GCText title>{strX("cmnNEW.YourDeliveryLocation")}</GCText>
                  <PrjSpacer size={10} />
                  {/* title and a button to change the address */}
                  {/*<CstCheckoutSectionTitle style={{ paddingRight: '2%' }} i18n="cstNEW.AddressAndInstructions" />*/}
                  <CstCheckoutStop
                     shop={CST.getShop()}
                     stop={order.deliveryStop}
                     pickupStop={order.pickupStop}
                     // buttonI18n={"cmnNEW.addressCode." + this.state.deliveryStop.code}
                     titleI18n="cmnNEW.ChangeDeliveryLocation_"
                     onChange={() => {
                        if (Boolean(order.deliveryStop.location) && Boolean(staticMapPointerRef.current)) {
                           staticMapPointerRef.current.recenterMap(order.deliveryStop.location)
                        }
                        refresh()
                     }}
                     onCustom={() => {
                        if (Boolean(order.deliveryStop.location) && Boolean(staticMapPointerRef.current)) {
                           staticMapPointerRef.current.recenterMap(order.deliveryStop.location)
                        }
                        //they have selected a custom address ... but there will be no address yet.
                        refresh()
                     }}
                     onCancel={() => { }}>
                  </CstCheckoutStop>
               </View>


               {/* show an (unmoveable, untouchable) map of current pickup location*/}
               <PrjSpacer size={5} />
               {(Boolean(order.deliveryStop.location)) &&
                  <GCStaticMap location={order.deliveryStop.location} height={150}
                     ref={staticMapPointerRef} />}

            </View>
         </View>

         {/* FOOTER SECTION -- no forward until a route selected */}
         <GCFooterWithSingleIcon
            code={reschedule ? 'NEXT_IS_FINAL_REVIEW' : 'NEXT_IS_SEARCH_FOR_DEALS'}
            hide={selIndex === -1}
            onPress={() => {
               if (!Boolean(order.deliveryStop.address)) {
                  prjToast({ type: 'reminder', i18n: 'cmnNEW.PleaseEnterCustomAddress' }) //OK
               }
               else {
                  const route = routes[selIndex]
                  order.deliveryRouteTime = route.schedDate
                  order.deliveryRouteId = route.docId
                  order.deliveryRouteDescrip = route.descrip
                  if (route.procTimeReg) { order.procTimeReg = route.procTimeReg }
                  navigation.navigate(reschedule ? 'CstCheckoutSummary' : 'CstCheckoutCoupon', { 'order': order, 'reschedule': reschedule })
               }
            }}
         />
      </CstScreen >
   );

}// end CstCheckoutSelectRouteDelivery

export default CstCheckoutSelectRouteDelivery