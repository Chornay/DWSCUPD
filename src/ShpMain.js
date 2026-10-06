import React, { useState, useEffect } from 'react'
import { Platform, StyleSheet, View, TouchableOpacity } from 'react-native'
import { Enumify } from 'enumify'
import DropDownPicker from 'react-native-dropdown-picker';
import firestore from '@react-native-firebase/firestore';
import { OrderStatusEnum } from 'DWcmn/Global';
import { strX } from 'DWcmn/I18n.js'
import { cmnSignout } from 'DWcmn/CmnFunctions'
import { PrjTabBar } from 'DWcmn/PrjTabBar'
import { GCText } from 'DWcmn/Gc'
import { COLORS } from 'DWcmn/Global'

import { prjTabStyles, prjTabBarStyles } from 'DWcmn/Prj';
import { PrjIcon } from 'DWcmn/PrjIconComponents'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'

import { GCFooterForIcons, GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
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
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'

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


export function ShpMain() {

   const navigation = useNavigation()

   const [orders, setOrders] = useState([])             //all the orders___ arrays populated in database listeners
   const [ordersIncoming, setOrdersIncoming] = useState([])
   const [ordersReceived, setOrdersReceived] = useState([])
   const [ordersInShop, setOrdersInShop] = useState([])
   const [ordersDone, setOrdersDone] = useState([])
   const [ordersOutgoing, setOrdersOutgoing] = useState([])
   const [ordersUnpaid, setOrdersUnpaid] = useState([])
   const [ordersUnapproved, setOrdersUnapproved] = useState([])
   const [ordersUnpriced, setOrdersUnpriced] = useState([])
   const [todaysRoutes, setTodaysRoutes] = useState([])
   const [selectedTab, setSelectedTab] = useState(0)
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [orderType, setOrderType] = useState('incoming')

   const tabFields = [
      { key: 0, i18n: 'cmnNEW.TODAY' },
      { key: 1, i18n: 'cmnNEW.ORDERS' },
   ]

   //move the updated order results to the order state array
   //AND populate the special categaries of orders that we maintain.
   const getOrders = (querySnapshot) => {
      let localOrders = dwdbfsOrderLoadSnapshots(querySnapshot)
      let newOrdersIncoming = [];
      let newOrdersReceived = [];
      let newOrdersInShop = [];
      let newOrdersDone = [];
      let newOrdersOutgoing = [];
      let newOrdersUnpaid = [];
      let newOrdersUnapproved = [];
      let newOrdersUnpriced = [];
      localOrders.forEach((order) => {
         if (order.isUnapproved) { newOrdersUnapproved.push(order) }
         if (order.unpricedCount != 0) { newOrdersUnpriced.push(order) }
         if (!order.isPaid) { newOrdersUnpaid.push(order) }
         switch (order.status) {
            case OrderStatusEnum.initial:
            case OrderStatusEnum.cancelled:
               break;
            case OrderStatusEnum.readyForPickup:
            case OrderStatusEnum.assignedForPickup:
            case OrderStatusEnum.outForPickup:
            case OrderStatusEnum.pickedUp:
            case OrderStatusEnum.missedPickup:
               newOrdersIncoming.push(order)
               break;
            case OrderStatusEnum.atShop:
               newOrdersReceived.push(order)
               break;
            case OrderStatusEnum.inShop:
               newOrdersInShop.push(order)
               break;
            case OrderStatusEnum.readyForDelivery:
            case OrderStatusEnum.assignedForDelivery:
               newOrdersDone.push(order)
               break;
            case OrderStatusEnum.outForDelivery:
            case OrderStatusEnum.delivered:
            case OrderStatusEnum.confirmed:
            case OrderStatusEnum.missedDelivery:
               newOrdersOutgoing.push(order)
               break;
            case OrderStatusEnum.completed:
            case OrderStatusEnum.invalid:
               break;
            default:
               prjCloudLogError('ShpMain getOrders', `unrecognized order status: (${order.status})`, { toast: false })
               break;
         }

      })
      setOrders(localOrders)
      setOrdersIncoming(newOrdersIncoming)
      setOrdersReceived(newOrdersReceived)
      setOrdersInShop(newOrdersInShop)
      setOrdersDone(newOrdersDone)
      setOrdersOutgoing(newOrdersOutgoing)
      setOrdersUnpaid(newOrdersUnpaid)
      setOrdersUnapproved(newOrdersUnapproved)
      setOrdersUnpriced(newOrdersUnpriced)

   } //end getOrders

   const getRoutes = async (querySnapshot) => {
      setTodaysRoutes(await dwdbfsRouteLoadSnapshots(querySnapshot))
   }//end getRoutes

   //have to hide the splash screen in case we navigate right here without the logo screen having done it
   useEffect(() => {
      SplashScreen.hide()
   }, [])

   //set up the database listener for order data
   useEffect(() => {
      let unsubscribeOrders
      try {
         unsubscribeOrders = firestore().collectionGroup("Orders")
            .where("archive", "==", false)
            .where("comboShopId", "==", DS.getComboShopId())
            .orderBy("creationDate", "desc")
            .onSnapshot(getOrders, error => { prjCloudLogError('ShpMain orders listener', error, {toastI18n:"cmnNEW.MsgSnapshotError"}) });
         setIsComponentInitialized(true);
      }
      catch (error) {
         prjCloudLogError('ShpMain orders setup', error)
      }
      //TODO disable back handler?
      return () => { unsubscribeOrders && unsubscribeOrders() }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, mirrors original componentDidMount/componentWillUnmount
   }, [])

   //start a query for all today's routes
   useEffect(() => {
      let unsubscribeRoutes
      try {
         const startTime = moment().startOf('day').toDate()
         const endTime = moment().endOf('day').toDate()
         unsubscribeRoutes = firestore().collectionGroup("Routes")
            .where("archive", "==", false)
            .where("comboShopId", "==", DS.getComboShopId())
            .where("schedDate", ">=", startTime)
            .where("schedDate", "<=", endTime)
            .orderBy("schedDate")
            .onSnapshot(getRoutes, error => { prjCloudLogError('ShpMain routes listener', error, {toastI18n:"cmnNEW.MsgSnapshotError"}) });
      }
      catch (error) {
         prjCloudLogError('ShpMain routes setup', error)
      }
      return () => { unsubscribeRoutes && unsubscribeRoutes() }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, mirrors original componentDidMount/componentWillUnmount
   }, [])

   const renderOrders = () => {
      let displayOrders = []
      switch (orderType) {
         case 'incoming': displayOrders = ordersIncoming; break;
         case 'unapproved': displayOrders = ordersUnapproved; break;
         case 'pricing': displayOrders = ordersUnpriced; break;
         case 'receive': displayOrders = ordersReceived; break;
         case 'unpaid': displayOrders = ordersUnpaid; break;
         case 'inShop': displayOrders = ordersInShop; break;
         case 'done': displayOrders = ordersDone; break;
         case 'outgoing': displayOrders = ordersOutgoing; break;
         default: break
      }
      return (
         <ShpMainTabViewGeneric orders={displayOrders} />

      )
   }

   const renderOrderPicker = () => {
      return (
         //added position:'relative', zIndex:1000 for iOS...picker hided behind the tile
         <View style={Platform.OS === 'ios' ? styles.pickerIos : styles.pickerAndroid}>
            <DropDownPicker
               items={[
                  { label: `INCOMING (${ordersIncoming.length})`, value: 'incoming' },
                  { label: `UNAPPROVED (${ordersUnapproved.length})`, value: 'unapproved' },
                  { label: `UNPAID (${ordersUnpaid.length})`, value: 'unpaid' },
                  { label: `PRICING (${ordersUnpriced.length})`, value: 'pricing' },
                  { label: `RECEIVE (${ordersReceived.length})`, value: 'receive' },
                  { label: `IN SHOP (${ordersInShop.length})`, value: 'inShop' },
                  { label: `DONE (${ordersDone.length})`, value: 'done' },
                  { label: `OUTGOING (${ordersOutgoing.length})`, value: 'outgoing' },
               ]}
               defaultValue={orderType}
               containerStyle={{ width: 150, height: 30, alignSelf: 'flex-end' }}
               itemStyle={{ justifyContent: 'flex-start' }}
               onChangeItem={item => { setOrderType(item.value) }}
            />
         </View>
      )
   }

   //we are not ready until initialization is finished
   //REMEMBER that even after init is finished we will not have our first data yet
   if (!isComponentInitialized) {
      return (
         <ShpSpinnerScreen />
      );
   } //end if 

   //TODO fix fontSize 20 in Header
   return (
      <ShpScreen>
         <GCHeader titleText={DS.getComboShopName()}
            optionsBurger={() => { navigation.navigate('ShpProfile') }} />
         <View style={{ flex: 1 }}>
            <PrjTabBar fields={tabFields}
               selectedTab={selectedTab}
               onPress={(index) => setSelectedTab(index)} />
            {selectedTab == 0 && <ShpMainTabViewRouteList routes={todaysRoutes} />}
            {selectedTab == 1 && <>{renderOrderPicker()}{renderOrders()}</>}
         </View>
         <GCFooterForIcons>
            <GCFooterCmdIcon code="SCAN_QR"
               onPress={() => navigation.navigate('DsScanQrForOrder')} />
            <GCFooterCmdIcon code="SEARCH"
               onPress={
                  () => { navigation.navigate('DsSearch') }
               } />
            <GCFooterCmdIcon code="ROUTES"
               onPress={() => navigation.navigate('DsViewOtherRoutes')} />
         </GCFooterForIcons>

      </ShpScreen>
   )
} //end ShpMain

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