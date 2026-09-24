
import React, { Component } from 'react'
import { Platform, StyleSheet, View, TouchableOpacity } from 'react-native'
import { Enumify } from 'enumify'
import DropDownPicker from 'react-native-dropdown-picker';
import { withNavigation } from 'react-navigation';
import firestore from '@react-native-firebase/firestore';
import { OrderStatusEnum } from 'DWcmn/Global';
import { strX } from 'DWcmn/I18n.js'
import { cmnSignout } from 'DWcmn/CmnFunctions'
import { PrjTabBar } from 'DWcmn/PrjTabBar'
import { GCText } from 'DWcmn/Gc'
import { COLORS } from 'DWcmn/Global'

import { prjTabStyles, prjTabBarStyles } from 'DWcmn/Prj';
import { PrjIcon } from 'DWcmn/PrjIconComponents'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import ShpMainTabViewRouteList from './ShpMainTabViewRouteList';
import ShpMainTabViewGeneric from './ShpMainTabViewGeneric';
import ShpSpinnerScreen from './ShpSpinnerScreen';
import { shpGenerateRouteTileActions, shpProcessRouteActionFromTile } from './shpRouteActionProcessing'
import { dwdbfsOrderLoadSnapshots, dwdbfsRouteLoadSnapshots } from 'DWcmn/DWDBfs'
import { ShpScreen } from './CdsScreen';
import GCHeader from 'DWcmn/GCHeader'
import { DS } from './DS'
import moment from 'moment';
import SplashScreen from 'react-native-splash-screen'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions';

//TODO we do not need to put all these arrays into state variables
//TODO just orders and routes
class OrderType extends Enumify {
   static UNAPPROVED = new OrderType();
   static UNPAID = new OrderType();
   static PRICING = new OrderType();
   static INCOMING = new OrderType();
   static RECEIVE = new OrderType();
   static IN_SHOP = new OrderType();
   static DONE = new OrderType();
   static OUTGOING = new OrderType();
   static _ = this.closeEnum();
}


class ShpMain extends Component {

   constructor() {
      super();
      this.state = {
         orders: [],             //all the orders___ arrays populated in database listeners
         ordersIncoming: [],
         ordersReceived: [],
         ordersInShop: [],
         ordersDone: [],
         ordersOutgoing: [],
         ordersUnpaid: [],
         ordersUnapproved: [],
         ordersUnpriced: [],
         todaysRoutes: [],
         selectedTab: 0,
         selectedOrderType: OrderType.INCOMING,
         isComponentInitialized: false,
         orderType: 'incoming',
      };
      this.tabFields = [
         { key: 0, i18n: 'cmnNEW.TODAY' },
         { key: 1, i18n: 'cmnNEW.ORDERS' },
      ]
   }

   //set up the database listeners for order and route data
   componentDidMount() {
      //fs
      try {
         this.unsubscribeOrders = firestore().collectionGroup("Orders")
            .where("archive", "==", false)
            .where("comboShopId", "==", DS.getComboShopId())
            .orderBy("creationDate", "desc")
            .onSnapshot(this.getOrders, error => { cmnAlertPopup({ text: error.message }) });
         this.refreshRouteQuery()
         SplashScreen.hide()//have to do this in case we navigate right here without logo screen

         this.setState({ isComponentInitialized: true });
      }
      catch (error) {
         SplashScreen.hide()//have to do this in case we navigate right here without logo screen
         cmnAlertPopup({ text: error.message })
      }
      //TODO disable back handler?
   }

   //start a query for all today's routes
   refreshRouteQuery() {
      try {
         const startTime = moment().startOf('day').toDate()
         const endTime = moment().endOf('day').toDate()
         this.unsubscribeRoutes && this.unsubscribeRoutes() //unsubscribe previous query if there
         // this.unsubscribeRoutes = firestore().collection("ShopTop")
         //    .doc(APP.getShopId()).collection("Routes")
         //    .where("schedDate", ">=", startTime)
         //    .where("schedDate", "<=", endTime)
         //    .orderBy("schedDate")
         //    .onSnapshot(this.getRoutes, error => { cmnAlertPopup({ text: error.message }) });
         this.unsubscribeRoutes = firestore().collectionGroup("Routes")
            .where("archive", "==", false)
            .where("comboShopId", "==", DS.getComboShopId())
            .where("schedDate", ">=", startTime)
            .where("schedDate", "<=", endTime)
            .orderBy("schedDate")
            .onSnapshot(this.getRoutes, error => { cmnAlertPopup({ text: error.message }) });
      }
      catch (error) {
         cmnAlertPopup({ text: error.message })
      }
   }//end refreshRouteQuery


   //get rid of the database listeners
   componentWillUnmount() {
      this.unsubscribeOrders && this.unsubscribeOrders();
      this.unsubscribeRoutes && this.unsubscribeRoutes();
   } //end componentWillUnmount

   //move the updated order results to the order state array
   //AND populate the special categaries of orders that we maintain.
   getOrders = (querySnapshot) => {
      let localOrders = dwdbfsOrderLoadSnapshots(querySnapshot)
      let ordersIncoming = [];
      let ordersReceived = [];
      let ordersInShop = [];
      let ordersDone = [];
      let ordersOutgoing = [];
      let ordersUnpaid = [];
      let ordersUnapproved = [];
      let ordersUnpriced = [];
      localOrders.forEach((order) => {
         if (order.isUnapproved) { ordersUnapproved.push(order) }
         if (order.unpricedCount!=0) { ordersUnpriced.push(order) }
         if (!order.isPaid) { ordersUnpaid.push(order) }
         switch (order.status) {
            case OrderStatusEnum.initial:
            case OrderStatusEnum.cancelled:
               break;
            case OrderStatusEnum.readyForPickup:
            case OrderStatusEnum.assignedForPickup:
            case OrderStatusEnum.outForPickup:
            case OrderStatusEnum.pickedUp:
            case OrderStatusEnum.missedPickup:
               ordersIncoming.push(order)
               break;
            case OrderStatusEnum.atShop:
               ordersReceived.push(order)
               break;
            case OrderStatusEnum.inShop:
               ordersInShop.push(order)
               break;
            case OrderStatusEnum.readyForDelivery:
            case OrderStatusEnum.assignedForDelivery:
               ordersDone.push(order)
               break;
            case OrderStatusEnum.outForDelivery:
            case OrderStatusEnum.delivered:
            case OrderStatusEnum.confirmed:
            case OrderStatusEnum.missedDelivery:
               ordersOutgoing.push(order)
               break;
            case OrderStatusEnum.completed:
            case OrderStatusEnum.invalid:
            default:
               break;
         }

      })
      this.setState({ orders: localOrders })
      this.setState({ ordersIncoming: ordersIncoming })
      this.setState({ ordersReceived: ordersReceived })
      this.setState({ ordersInShop: ordersInShop })
      this.setState({ ordersDone: ordersDone })
      this.setState({ ordersOutgoing: ordersOutgoing })
      this.setState({ ordersUnpaid: ordersUnpaid })
      this.setState({ ordersUnapproved: ordersUnpriced })
      this.setState({ ordersUnpriced: ordersUnpriced })

   } //end getOrders

   getRoutes = async (querySnapshot) => {
      this.setState({ todaysRoutes: await dwdbfsRouteLoadSnapshots(querySnapshot) })
   }//end getRoutes

   render() {
      //we are not ready until initialization is finished
      //REMEMBER that even after init is finished we will not have our first data yet
      if (!this.state.isComponentInitialized) {
         return (
            <ShpSpinnerScreen />
         );
      } //end if 

      let todaysRouteCount = this.state.todaysRoutes.length
      let orderIncomingCount = this.state.ordersIncoming.length
      let orderReceivedCount = this.state.ordersReceived.length
      let orderInShpCount = this.state.ordersInShop.length
      let orderDoneCount = this.state.ordersDone.length
      let orderOutgoingCount = this.state.ordersOutgoing.length
      let orderUnapprovedCount = this.state.ordersUnapproved.length
      let orderUnpricedCount = this.state.ordersUnpriced.length
      let orderUnpaidCount = this.state.ordersUnpaid.length
      let onClick = false

      //TODO fix fontSize 20 in Header
      return (
         <ShpScreen>
            <GCHeader titleText={DS.getComboShopName()}
               optionsBurger={() => { this.props.navigation.navigate('ShpProfile') }} />
            <View style={{ flex: 1 }}>
               <PrjTabBar fields={this.tabFields}
                  selectedTab={this.state.selectedTab}
                  onPress={(index) => this.setState({ selectedTab: index })} />
               {this.state.selectedTab == 0 && <ShpMainTabViewRouteList routes={this.state.todaysRoutes} />}
               {this.state.selectedTab == 1 && <>{this.renderOrderPicker()}{this.renderOrders()}</>}
            </View>
            <GCFooterForIcons>
               <GCFooterCmdIcon code="SCAN_QR"
                  onPress={() => this.props.navigation.navigate('DsScanQrForOrder')} />
               <GCFooterCmdIcon code="SEARCH"
                  onPress={
                     () => { this.props.navigation.navigate('DsSearch') }
                  } />
               <GCFooterCmdIcon code="ROUTES"
                  onPress={() => this.props.navigation.navigate('DsViewOtherRoutes')} />
            </GCFooterForIcons>

         </ShpScreen>
      )
   } //end render

   renderOrders = () => {
      let orders = []
      switch (this.state.orderType) {
         case 'incoming': orders = this.state.ordersIncoming; break;
         case 'unapproved': orders = this.state.ordersUnpriced; break;
         case 'pricing': orders = this.state.ordersUnpriced; break;
         case 'receive': orders = this.state.ordersReceived; break;
         case 'unpaid': orders = this.state.ordersUnpaid; break;
         case 'inShop': orders = this.state.ordersInShop; break;
         case 'done': orders = this.state.ordersDone; break;
         case 'outgoing': orders = this.state.ordersOutgoing; break;
         default: break
      }
      return (
         <ShpMainTabViewGeneric orders={orders} />

      )
   }

   //creates a tab heading that includes 'text' and [n] iff count is non-zero
   tabHdg = (text, count = 0) => {
      let hdg = strX(text)
      if (count > 0) hdg += (' [' + count + ']')
      return (hdg)
   } //end tabHdg

   //creates a tab heading that includes 'text' and [n] iff count is non-zero
   tabOrderHdg = (text, orderType, count = 0) => {
      let hdg = strX(text) + " - " + orderType.enumKey
      if (count > 0) hdg += (' [' + count + ']')
      return (hdg)
   } //end tabHdg

   renderOrderPicker = () => {
      return (
         //added position:'relative', zIndex:1000 for iOS...picker hided behind the tile
         <View style={Platform.OS === 'ios' ? styles.pickerIos : styles.pickerAndroid}>
            <DropDownPicker
               items={[
                  { label: 'INCOMING', value: 'incoming' },
                  { label: 'UNAPPROVED', value: 'unapproved' },
                  { label: 'UNPAID', value: 'unpaid' },
                  { label: 'PRICING', value: 'pricing' },
                  { label: 'RECEIVE', value: 'receive' },
                  { label: 'IN SHOP', value: 'inShop' },
                  { label: 'DONE', value: 'done' },
                  { label: 'OUTGOING', value: 'outgoing' },
               ]}
               placeholder={this.state.orderType}
               defaultValue={this.state.orderType}
               containerStyle={{ width: 150, height: 30, alignSelf: 'flex-end' }}
               itemStyle={{ justifyContent: 'flex-start' }}
               onChangeItem={item => { this.setState({ orderType: item.value }) }}
            />
         </View>
      )
   }


} //end ShpMain


export default withNavigation(ShpMain);

const styles = StyleSheet.create({
   picker: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 10,
      paddingRight: 30
   },
   pickerText: {
      flexDirection: 'row',
      fontSize: 10,
   },
   pickerAndroid: {
      paddingHorizontal: 12,
      paddingBottom: 10,
   },
   pickerIos: {
      paddingHorizontal: 12,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 1000
   }
})