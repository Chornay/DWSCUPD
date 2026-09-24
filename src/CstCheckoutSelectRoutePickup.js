import React, { Component } from 'react'
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native'
import firestore from '@react-native-firebase/firestore';
import { ListItemXYZ } from 'DWcmn/GCNB';
import { dwdbfsRouteLoadSnapshots } from 'DWcmn/DWDBfs'
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

//20221003 changed route select to be full wide touchable
//20231107 added check for processing time adjustment in route
//20250210 added reschedule functionality

//CstCheckoutSelectRoutePickup
//allows the customer to chose an arrival time and location
//Forward arrow adds the pickup info to order and goes to the Delivery Options screen
//

//param order
//param reschedule flag true iff this is an existing order begin rescheduled
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

export default class CstCheckoutSelectRoutePickup extends Component {


   constructor(props) {
      super(props);
      this.state = {
         isComponentInitialized: false,
         selIndex: -1,
         toggle: false
      };
      this.order = null
      this.reschedule = false
      this.routes = []
      this._staticMapRef = null
   } //end constuctor


   componentDidMount() {

      //ASSERT check that shop.id === cust.shopId === order.shopId
      //ASSERT order is not null
      this.order = this.props.navigation.getParam('order', null)
      this.reschedule = this.props.navigation.getParam('reschedule', false)


      const minMinutesTillPickup = CST.getShop().routeAvailableOffset
      const hoursToDisplay = CST.getShop().hoursOfPickupRoutes
      const shopId = this.order.shopId

      const adjustedCurrentMoment = this.getCurrentMomentAdjustedForCurfew()
      const earliestMoment = adjustedCurrentMoment.add(minMinutesTillPickup, "minutes")

      const earliestTime = earliestMoment.toDate()
      const latestTime = earliestMoment.add(hoursToDisplay, "hours").toDate()
      this.unsubscribeRoutes = firestore().collection("ShopTop").doc(shopId).collection("Routes")
         .where("archive", "==", false)
         .where("schedDate", ">=", earliestTime)
         .where("schedDate", "<=", latestTime)
         .orderBy("schedDate") //.limit(6)
         .onSnapshot(this.getRoutes);

      //NOTE we do NOT set isComponentInitialized .. that is done when the first snapshot is received
   }

   //returns either the current time or the end of the curfew if we are in curfew window
   getCurrentMomentAdjustedForCurfew = () => {

      const { curfewStart, curfewEnd } = this.order
      const now = moment();
      const currentHour = now.hour() + now.minute() / 60; // fractional hour

      //no action if either is missing
      if (!(curfewStart && curfewEnd)) {
         return now
      }

      else if (this.withinCurfew(currentHour, curfewStart, curfewEnd)) {
         return (this.getCurfewEnd(currentHour, curfewStart, curfewEnd))
      }

      else {
         return now
      }
   }

   //returns true iif the current hour is within the curfew hours (including overnight case)
   withinCurfew(currentHour, curfewStart, curfewEnd) {
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
   getCurfewEnd(currentHour, curfewStart, curfewEnd) {

      const isOvernight = curfewStart > curfewEnd;
      const pastMidnight = isOvernight && currentHour < curfewEnd;

      return moment()
         .startOf('day')
         .add(pastMidnight ? 0 : (isOvernight ? 1 : 0), 'days')
         .add(curfewEnd, 'hours');
   }

   //get rid of the database listeners
   componentWillUnmount() {
      this.unsubscribeRoutes && this.unsubscribeRoutes();
   } //end componentWillUnmount

   getRoutes = async (querySnapshot) => {
      const allRoutes = await dwdbfsRouteLoadSnapshots(querySnapshot)
      if (this.order.serviceLevel == 'express') {
         let filteredRoutes = []
         allRoutes.forEach((route) => {
            if (route.pickupExp) { filteredRoutes.push(route) }
         });
         this.routes = filteredRoutes
      }
      else if (this.order.serviceLevel == 'sameDay') {
         let filteredRoutes = []
         allRoutes.forEach((route) => {
            if (route.pickupSameDay) { filteredRoutes.push(route) }
         });
         this.routes = filteredRoutes

      }
      else {
         this.routes = allRoutes
      }
      this.setState({ isComponentInitialized: true });
   }//end getRoutes


   render() {

      if (!this.state.isComponentInitialized) {
         return (
            <CstSpinnerScreen />
         );
      }
      //KLUDGE if we are not going to be drawing a map at the bottom (Custom with no address specified yet)
      //then we want to null the map reference ... if we change back to HOME eg then we will try to center the
      //map but it won't be there yet.
      // if (!Boolean(this.order.pickupStop.location)) {
      //    this._staticMapRef = null
      // }
      //CORRECTION .. the above does NOT seem to be necessary

      return (

         <CstScreen>
            <GCHeader back cancel cancelConfirmI18n={this.reschedule ? "cmnNEW.DiscardTheseChanges_" : null}
               titleI18n={this.reschedule ? 'cmnNEW.NewPickupDetails' : 'cmnNEW.PickupDetails'}
               noBottomPadding />

            <View style={{ flex: 1 }}>

               {/* list available routes */}
               {/*SC The flexBasis used to be .3 but that cause iOS view hide under another when click the schedule tile*/}
               <View style={{ flexBasis: 120, flexGrow: 1, marginHorizontal: GC_STD_MARGIN }}>
                  <CmnServiceLevelBanner level={this.order.serviceLevel} />
                  <PrjSpacer size={10} />
                  <GCI18n title code="cmnNEW.ChooseYourTime"></GCI18n>
                  <FlatList
                     data={this.routes}
                     renderItem={this.renderRouteButton}
                     extraData={this.state.selIndex}
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
                        stop={this.order.pickupStop}
                        pickupStop={null}
                        // buttonI18n={"cmnNEW.addressCode." + this.order.pickupStop.code}
                        titleI18n="cmnNEW.ChangePickupLocation_"
                        onChange={() => {
                           if (Boolean(this.order.pickupStop.location) && Boolean(this._staticMapRef)) {
                              this._staticMapRef.recenterMap(this.order.pickupStop.location)
                           }
                           this.toggle()
                        }}
                        onCustom={() => {
                           if (Boolean(this.order.pickupStop.location) && Boolean(this._staticMapRef)) {
                              this._staticMapRef.recenterMap(this.order.pickupStop.location)
                           }
                           //they have selected a custom address ... but there will be no address yet.
                           this.toggle()
                        }}
                     >
                     </CstCheckoutStop>
                  </View>

                  {/* show an (unmoveable, untouchable) map of current pickup location*/}
                  {/* NOTE that we get a reference to the map so we can move it       */}
                  {/* NOTE can't display if there is no address       */}

                  <PrjSpacer size={5} />
                  {(Boolean(this.order.pickupStop.location)) &&
                     <GCStaticMap location={this.order.pickupStop.location} height={150}
                        ref={(component) => this._staticMapRef = component} />}

               </View>
            </View>

            <GCFooterWithSingleIcon
               code={"NEXT_IS_DELIVERY"}
               hide={this.state.selIndex === -1}
               onPress={() => {
                  if (!Boolean(this.order.pickupStop.address)) {
                     prjToast({ type: 'reminder', i18n: 'cmnNEW.PleaseEnterCustomAddress' }) //OK
                  }
                  else {
                     const route = this.routes[this.state.selIndex]
                     this.order.pickupRouteTime = route.schedDate
                     this.order.pickupRouteId = route.docId
                     this.order.pickupRouteDescrip = route.descrip
                     if (route.procTimeReg) { this.order.procTimeReg = route.procTimeReg }
                     this.props.navigation.navigate('CstCheckoutSelectRouteDelivery',
                        { 'order': this.order, 'reschedule': this.reschedule })
                  }
               }}
            />
         </CstScreen >
      );
   } //end render

   //toggle a state variable to cause a render
   toggle = () => {
      this.setState({ toggle: !this.state.toggle })
   } //toggle 

   renderRouteButton = ({ item, index }) => {

      let maybeHighlightStyle = ((index == this.state.selIndex) ? PRJ_STYLES.highlightSelected : null)

      return (
         <ListItemXYZ style={[{ justifyContent: 'center' }, maybeHighlightStyle]}>

            <TouchableOpacity
               onPress={() => {
                  if (this.state.selIndex == -1) { //no button selected yet
                     this.setState({ selIndex: index })
                  }
                  else if (this.state.selIndex == index) { //deselect this button
                     this.setState({ selIndex: -1 })
                  }
                  else { //selIndex != index .. select another button
                     this.setState({ selIndex: index })
                  }
               }}
               keyExtractor={(item, index) => index.toString()}
            >
               <GCText style={{ paddingVertical: 10 }}>{prjRouteName(item.schedDate, item.descrip)}</GCText>
            </TouchableOpacity>
         </ListItemXYZ>
      )
   }// end renderRouteButton

}// end CstCheckoutSelectRoutePickup
