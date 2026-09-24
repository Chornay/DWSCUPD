import React, { Component } from 'react'
import { Linking } from 'react-native'

import { strX } from 'DWcmn/I18n.js'
import { OrderActionEnum, OrderStatusEnum } from 'DWcmn/Global'
import CmnCmdModal from 'DWcmn/CmnCmdModal'
import { dwdbfsOrderStatusAction, dwdbfsOrderAcceptCash } from 'DWcmn/DWDBfs'
import { dwdbfsOrderDeliverWithCash, dwdbfsOrderPickupWithCash } from 'DWcmn/DWDBfs'
import { cmnSendNotificationAsync } from 'DWcmn/cmnSendNotificationAsync'
import { cmnSendEmailAsync } from 'DWcmn/cmnSendEmailAsync' //DEBUG
import { prjFormatOrderForEmail } from 'DWcmn/prjFormatOrderForEmail'
import { CmnTouchableEdit } from 'DWcmn/CmnTouchableEdit'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { DRV } from './DRV'
import { RemarksModal } from 'DWcmn/CmnTouchableEdit'
import { prjToast } from 'DWcmn/PrjToast'
import { prjWaze } from 'DWcmn/prjExternalApps'


import { PaymentMethodEnum } from 'DWcmn/Global'

//20250525 split the driver actions between tile and detail to limit the total number on either
//20250525 made drvProcessOrderActionOnEvent async while adding a check waze existence

//method returns all available actions for the order in its given status
//excludes 'view' because that is assumed to apply to all orders
//this method is used by the order detail screen to provide buttons for these actions
// ** this method is closely associated with generatePreferredActionsForOrder
//parameter is order
//TODO check activeDriver before deciding on possible actions
export function drvGenerateOrderDetailActions(order) {
   const { status, isApproved, isPaid, driverId } = order
   const ours = (driverId == DRV.getId());
   let array = []
   if (ours) {

      if (!order.codeFromQr) { array.push(OrderActionEnum.addQrCode) }

      switch (status) {
         case OrderStatusEnum.outForPickup:
            // array.push(OrderActionEnum.pickup) //tile only
            if (isApproved && (!isPaid)) { array.push(OrderActionEnum.pickupWithCash) }
            array.push(OrderActionEnum.failPickup)
            // array.push(OrderActionEnum.soon) //tile only
            break;
         case OrderStatusEnum.pickedUp:
            array.push(OrderActionEnum.undoPickup)
            break;
         case OrderStatusEnum.outForDelivery:
            // array.push(OrderActionEnum.dropoff) //tile only
            if (isApproved && (!isPaid)) { array.push(OrderActionEnum.dropoffWithCash) }
            array.push(OrderActionEnum.failDropoff)
            // array.push(OrderActionEnum.soon) //tile only
            break;
         case OrderStatusEnum.delivered:
            array.push(OrderActionEnum.undoDropoff)
            break;
         default:
            break;
      }
      array.push(OrderActionEnum.notify)  //driver can any order he owns
   }
   // array.push(OrderActionEnum.showExtMap)  //only shows up on tile to save space
   return array;
} //end drvGenerateOrderDetailActions

//method returns all "normal" actions for the order in its given status
//this method is used by the route tile to provide buttons for these actions
// ** this method is closely associated with generateAllActionsForOrder except the 'un' actions
//param is order
//NOTE cash payment should be done before pickup or delivery
//TODO check activeDriver before deciding on possible actions
export function drvGenerateOrderTileActions(order) {
   const { status, isApproved, isPaid, driverId, paymentMethod } = order
   const ours = (driverId == DRV.getId());
   let array = []
   if (ours) {
      switch (status) {
         case OrderStatusEnum.outForPickup:
            if (isApproved && (!isPaid) && paymentMethod == PaymentMethodEnum.payPickup) { array.push(OrderActionEnum.pickupWithCash) }
            else { array.push(OrderActionEnum.pickup) }
            array.push(OrderActionEnum.soon)
            break;
         case OrderStatusEnum.outForDelivery:
            if (isApproved && (!isPaid) && paymentMethod == PaymentMethodEnum.payDelivery) { array.push(OrderActionEnum.dropoffWithCash) }
            else { array.push(OrderActionEnum.dropoff) }
            array.push(OrderActionEnum.soon)
            break;
         default:
            break;
      }
      array.push(OrderActionEnum.showExtMap)  //driver gets the navigation link FOR 'his' orders
   }
   return array;
} //end drvGenerateOrderTileActions

//Interpret an action from a button on either a tile or a detail screen
//Executing the action occurs only after verification by user
//TODO add Toast confirming status change
export function drvProcessOrderAction(order, action, onDismiss) {
   const confirmStr = strX("drvshp.orderActionConfirm." + action.enumKey)

   // notify is a special case
   // we send a text from the driver to the token (device that submitted the order)
   if (action == OrderActionEnum.notify) {
      return (
         <RemarksModal
            onCancel={onDismiss}
            onOkay={async (text) => {
               // console.log('text is', text)
               await cmnSendNotificationAsync(order.token, { text: text }, true)
               onDismiss()
            }}
         />
      )
   }

   //TODO check if the action makes sense, if not then just call dismiss
   return (
      <CmnCmdModal
         isVisible={true}
         swipeable={true}
         showDismiss={true}
         text={confirmStr}
         onDismiss={onDismiss}
         onConfirm={async () => {
            switch (action) {
               case OrderActionEnum.view:
               case OrderActionEnum.approve:
                  onDismiss()
                  break; //no action required
               case OrderActionEnum.addToRoute:
               case OrderActionEnum.removeFromRoute:
               case OrderActionEnum.accept:
               case OrderActionEnum.cleaned:
                  onDismiss()
                  break; //shop operations
               case OrderActionEnum.noop:
               case OrderActionEnum.invalid:
                  //TODO should be some error indication??
                  onDismiss()
                  break;
               case OrderActionEnum.soon:
                  // await cmnSendEmailAsync({ //DEBUG
                  //    // to: "soung.chornay21@gmail.com",
                  //    to: "graham.cowan@yahoo.ca",
                  //    html: prjFormatOrderForEmail(order)
                  // }, true)
                  await cmnSendNotificationAsync(order.token,
                     { text: "Your DW driver is almost there" },
                     true)
                  onDismiss()
                  break;
               case OrderActionEnum.pickup:
               case OrderActionEnum.failPickup:
               case OrderActionEnum.undoPickup:
               case OrderActionEnum.dropoff:
               case OrderActionEnum.failDropoff:
               case OrderActionEnum.undoDropoff:
                  await dwdbfsOrderStatusAction(order, action)
                  onDismiss()
                  break;
               case OrderActionEnum.dropoffWithCash:
                  await dwdbfsOrderDeliverWithCash(order.id)
                  onDismiss()
                  break;
               case OrderActionEnum.pickupWithCash:
                  await dwdbfsOrderPickupWithCash(order.id)
                  onDismiss()
                  break;
               case OrderActionEnum.cashPayment:
                  await dwdbfsOrderAcceptCash(order)
                  onDismiss()
                  break;
               default:
                  //TODO should be some error indication??
                  onDismiss()
                  break;
            }

         }}//end onConfirm
      />

   )

} //end drvProcessOrderAction


//Interpret an action from a button on either a tile or a detail screen
//OnEvent actions are done inside the onPress button code
//they are not 'confirmed' before executing
export async function drvProcessOrderActionOnEvent(navigation, order, action) {
   switch (action) {

      case OrderActionEnum.showExtMap:
         // let uri = 'google.navigation:q=' + order.location.latitude +
         // ',' + order.location.longitude
         await prjWaze(order.location)
         return true
         break;
      case OrderActionEnum.addQrCode:
         navigation.navigate('DsScanQrToAddCode', { 'order': order });
         return true
         break;
      default:
         return false
         break;
   }

}// end drvProcessOrderActionOnEvent  
