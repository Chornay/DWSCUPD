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

export default class CstCheckoutSelectRouteDelivery extends Component {


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



   //load routes array with two days worth of routes that are available after the processing time
   componentDidMount() {
      this.order = this.props.navigation.getParam('order', null)
      this.reschedule = this.props.navigation.getParam('reschedule', false)

      //if the delivery address is not set then use the pickup
      if ((!Boolean(this.order.deliveryStop))) {
         this.order.deliveryStop = prjStopCopy(this.order.pickupStop)
      }

      const hoursToDisplay = CST.getShop().hoursOfDeliveryRoutes
      const shopId = this.order.shopId

      //pick the processing time based on service level
      let minProcessingTime
      switch (this.order.serviceLevel) {
         case 'express': minProcessingTime = this.order.procTimeExp; break
         case 'sameDay': minProcessingTime = this.order.procTimeSameDay; break
         case 'regular':
         default: minProcessingTime = this.order.procTimeReg; break
      }

      //NOW we also calculate a maximum processing time .... eg if they are paying for same day
      //then let's not give them options that are the same service level as express etc.
      //remember hours to display comes from shop
      let maxProcessingTime
      switch (this.order.serviceLevel) {
         case 'express': maxProcessingTime = this.order.procTimeReg; break
         case 'sameDay': maxProcessingTime = this.order.procTimeExp; break
         case 'regular':
         default: maxProcessingTime = this.order.procTimeReg + hoursToDisplay; break
      }

      // const minProcessingTime = this.order.serviceLevel === 'express'?this.order.procTimeExp:this.order.procTimeReg
      const earliestTimeAsMoment = moment(this.order.pickupRouteTime).add(minProcessingTime, "hours")
      const earliestTime = earliestTimeAsMoment.toDate()
      const latestTimeAsMoment = moment(this.order.pickupRouteTime).add(maxProcessingTime, "hours")
      const latestTime = latestTimeAsMoment.toDate()
      // const latestTime = (earliestTimeAsMoment.add(maxProcessingTime, "hours")).toDate()
      this.unsubscribeRoutes = firestore().collection("ShopTop").doc(shopId).collection("Routes")
         .where("archive", "==", false)
         .where("schedDate", ">=", earliestTime)
         .where("schedDate", "<", latestTime)//TODO should this be ,=?
         .orderBy("schedDate") //.limit(6)
         .onSnapshot(this.getRoutes);

      //NOTE we do NOT set isComponentInitialized .. that is done when the first snapshot is received
   }

   //get rid of the database listeners
   componentWillUnmount() {
      this.unsubscribeRoutes && this.unsubscribeRoutes();
   } //end componentWillUnmount

   getRoutes = async (querySnapshot) => {
      this.routes = await dwdbfsRouteLoadSnapshots(querySnapshot)
      this.setState({ isComponentInitialized: true });
   }//end getRoutes


   render() {

      if (!this.state.isComponentInitialized) {
         return (
            <CstSpinnerScreen />
         );
      }

      return (

         <CstScreen>
            <GCHeader back cancel cancelConfirmI18n={this.reschedule ? "cmnNEW.DiscardTheseChanges_" : null}
               titleI18n={this.reschedule ? 'cmnNEW.NewDeliveryDetails' : 'cmnNEW.DeliveryDetails'}
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
                        stop={this.order.deliveryStop}
                        pickupStop={this.order.pickupStop}
                        // buttonI18n={"cmnNEW.addressCode." + this.state.deliveryStop.code}
                        titleI18n="cmnNEW.ChangeDeliveryLocation_"
                        onChange={() => {
                           if (Boolean(this.order.deliveryStop.location) && Boolean(this._staticMapRef)) {
                              this._staticMapRef.recenterMap(this.order.deliveryStop.location)
                           }
                           this.toggle()
                        }}
                        onCustom={() => {
                           if (Boolean(this.order.deliveryStop.location) && Boolean(this._staticMapRef)) {
                              this._staticMapRef.recenterMap(this.order.deliveryStop.location)
                           }
                           //they have selected a custom address ... but there will be no address yet.
                           this.toggle()
                        }}
                        onCancel={() => { }}>
                     </CstCheckoutStop>
                  </View>


                  {/* show an (unmoveable, untouchable) map of current pickup location*/}
                  <PrjSpacer size={5} />
                  {(Boolean(this.order.deliveryStop.location)) &&
                     <GCStaticMap location={this.order.deliveryStop.location} height={150}
                        ref={(component) => this._staticMapRef = component} />}

               </View>
            </View>

            {/* FOOTER SECTION -- no forward until a route selected */}
            <GCFooterWithSingleIcon
               code={this.reschedule ? 'NEXT_IS_FINAL_REVIEW' : 'NEXT_IS_SEARCH_FOR_DEALS'}
               hide={this.state.selIndex === -1}
               onPress={() => {
                  if (!Boolean(this.order.deliveryStop.address)) {
                     prjToast({ type:'reminder', i18n: 'cmnNEW.PleaseEnterCustomAddress' }) //OK
                  }
                  else {
                     const route = this.routes[this.state.selIndex]
                     this.order.deliveryRouteTime = route.schedDate
                     this.order.deliveryRouteId = route.docId
                     this.order.deliveryRouteDescrip = route.descrip
                     if (route.procTimeReg) { this.order.procTimeReg = route.procTimeReg }
                     this.props.navigation.navigate(this.reschedule ? 'CstCheckoutSummary' : 'CstCheckoutCoupon', { 'order': this.order, 'reschedule': this.reschedule })
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
         <ListItemXYZ style={[{justifyContent: 'center'}, maybeHighlightStyle]}>

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

}// end CstCheckoutSelectRouteDelivery
