import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper';
import { OrderActionEnum } from 'DWcmn/Global'
import { cmnOrderStatusStr, cmnOrderStatusColor } from 'DWcmn/TypeCmnFunctions.js'
import { cmnPaymentSummary } from 'DWcmn/CmnFunctions'
import CmnNotesList from 'DWcmn/CmnNotesList';
import CmnItemsList from 'DWcmn/CmnItemsList';
import { prjRouteName } from 'DWcmn/PrjCmnFunctions'
import { OrderStatusEnum } from "DWcmn/Global";
import { PrjIconForTileAction } from 'DWcmn/PrjIconComponents'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { COLORS } from 'DWcmn/Global'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { APP } from 'DWcmn/APP'
import { dsGenerateOrderTileActions, dsProcessOrderAction, dsProcessOrderActionOnEvent } from './dsOrderActionProcessing'


//20250220 created from CmnOrderTile to be directly useable from shp and drv
//         NOTE readonly removed .. will be determined by context of the order
//TODO create dsProcessOrderAction

//NOTE clicking on the body of the order will navigate to and OrderDetail screen with param 'order' set
//NOTE any action in the input array will be rendered as a button. Pressing the button will call the 
//     processCommand property. processCommand can return JSX or null. It should call the 
//     onDismiss method when it is done. 
//prop order

export default function DsOrderTile({ order }) {

   const navigation = useNavigation()

   const [displayNotesCount, setDisplayNotesCount] = useState(0)
   const [displayItemNoteCount, setDisplayItemNoteCount] = useState(0) //TODO not used?
   const [isItemsVisible, setIsItemsVisible] = useState(false)
   const [action, setAction] = useState(OrderActionEnum.noop)
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)

   useEffect(() => {
      setIsComponentInitialized(true)
   }, [])

   const renderAddressAndDate = (order) => {
      let output = []
      switch (order.status) {

         //cancelled .. no need to show anything
         case OrderStatusEnum.cancelled:
            break;

         //not yet picked up .. show pickup info
         case OrderStatusEnum.readyForPickup:
         case OrderStatusEnum.assignedForPickup:
         case OrderStatusEnum.outForPickup:
            output.push(<GCText details key={1}>{prjRouteName(order.pickupRouteTime, order.pickupRouteDescrip)}</GCText>)
            output.push(<GCText details key={2}>{order.pickupStop.address}</GCText>)
            order.pickupStop.instructions && output.push(<GCText details key={3}>{order.pickupStop.instructions}</GCText>)
            break;

         // picked up or in shop - no address to show
         case OrderStatusEnum.pickedUp:
         case OrderStatusEnum.atShop:
         case OrderStatusEnum.inShop:
            break;

         // pending delivery show delivery info
         case OrderStatusEnum.readyForDelivery:
         case OrderStatusEnum.assignedForDelivery:
         case OrderStatusEnum.outForDelivery:
            output.push(<GCText details key={1}>{prjRouteName(order.deliveryRouteTime, order.deliveryRouteDescrip)}</GCText>)
            output.push(<GCText details key={2}>{order.deliveryStop.address}</GCText>)
            order.deliveryStop.instructions && output.push(<GCText details key={3}>{order.deliveryStop.instructions}</GCText>)
            break;

         //delivered .. no need to show anything
         case OrderStatusEnum.delivered:
         case OrderStatusEnum.confirmed:
         case OrderStatusEnum.completed:
            break;

         case OrderStatusEnum.invalid:
         default:
            output.push(<GCText details key={1}>Invalid Status</GCText>)
            break;
      }

      return output

   }

   if (!isComponentInitialized) {
      return null
   }
   const appType = APP.getAppType();
   //generate the available actions
   const actions = dsGenerateOrderTileActions(order)

   // this.setState({ noteDisplayCount: order.notes.length })

   return (
      <View>
         {/* the method should handle any action .. then call the third parameter to finish */}
         {(action != OrderActionEnum.noop) && dsProcessOrderAction(order, action, () => { setAction(OrderActionEnum.noop) })}

         {/* we would usually put in a flex:1 here BUT that seems to break our use at the bottom of maps. Sigh */}
         <View style={PRJ_STYLES.tile}>
            <View style={{ flex: .7 }}>
               <View style={{ flex: 1, flexDirection: 'row' }}>
                  <View>
                     <TouchableOpacity
                        onPress={() => {
                           //NOTE we go to the right app based on stack.
                           navigation.navigate('OrderDetail', { 'id': order.id });
                        }}>
                        <View style={{ alignItems: 'flex-start' }}>
                           <GCText details>{order.id}</GCText>
                           <GCText details bold color={cmnOrderStatusColor(appType, order.status)} >
                              {cmnOrderStatusStr(appType, order.status)}</GCText>
                           <GCText details >{order.name}</GCText>
                           <GCText details >{order.phoneNumber}</GCText>
                           {cmnPaymentSummary(order)}
                           {renderAddressAndDate(order)}
                        </View>
                     </TouchableOpacity>
                  </View>
               </View>
            </View>

            <View style={{ flex: .3 }}>

               <View style={styles.buttonsView}>
                  {
                     actions.map((actionItem, index) =>
                        <PrjIconForTileAction
                           key={index}
                           action={actionItem}
                           onPress={async () => {//if we don't handle now, we will handle during render
                              if (!await dsProcessOrderActionOnEvent(navigation, order, actionItem)) {
                                 setAction(actionItem)
                              }
                           }}

                        />
                     )}
               </View>

            </View>
         </View>
         < CmnNotesList
            notes={order.notes}
            count={displayNotesCount}
         />
         {isItemsVisible &&
            <CmnItemsList order={order} />}
      </View>
   ) //end else 
}// end DsOrderTile

const styles = StyleSheet.create({
   buttonsView: {
      flexDirection:'row',
      // flexDirection: 'column',
      justifyContent: 'space-evenly'
   },

})