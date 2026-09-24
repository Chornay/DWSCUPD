import React, { Component } from 'react'
import GLOBALS from 'DWcmn/Global'
import { OrderActionEnum, OrderStatusEnum } from 'DWcmn/Global';
import { strX } from 'DWcmn/I18n.js'

import CmnCmdModal from 'DWcmn/CmnCmdModal'
import { shpcmnOrderActionConfirmStr } from './ShpCmnFunctions'
import { dwdbfsOrderStatusAction, dwdbfsRouteAction } from 'DWcmn/DWDBfs'
import { dwdbfsOrderUpdateAsApproved } from 'DWcmn/dwdbfsOrder'
import { cmnPrintOrderAsync } from 'DWcmn/cmnPrintOrderAsync'
import { cmnSendEmailAsync } from 'DWcmn/cmnSendEmailAsync'
import { prjFormatOrderForEmail } from 'DWcmn/prjFormatOrderForEmail'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'

//method returns all available actions for the order in its given status
//excludes 'view' because that is assumed to apply to all orders
//this method is used by the order detail screen to provide buttons for these actions
// ** this method is closely associated with generatePreferredActionsForOrder
//TODOMISSED shp generate order detail
export function shpGenerateOrderDetailActions(order) {
   const { status } = order

   let array = []
   switch (status) {
      case OrderStatusEnum.initial:
      case OrderStatusEnum.cancelled:
         break;
      case OrderStatusEnum.readyForPickup:
         // this action removed 20210817 .. better already be in Route
         // array.push(OrderActionEnum.addToRoute)
         break;
      case OrderStatusEnum.assignedForPickup:
         // this action removed 20210817 .. better already be in Route
         // array.push(OrderActionEnum.removeFromRoute)
         break;
      case OrderStatusEnum.outForPickup:
      case OrderStatusEnum.pickedUp:
         break;
      case OrderStatusEnum.atShop:
         array.push(OrderActionEnum.accept)
         break;
      case OrderStatusEnum.inShop:
         array.push(OrderActionEnum.cleaned)
         break;
      case OrderStatusEnum.readyForDelivery:
         // this action removed 20210817 .. better already be in Route
         // array.push(OrderActionEnum.addToRoute)
         break;
      case OrderStatusEnum.assignedForDelivery:
         // this action removed 20210817 .. better already be in Route
         // array.push(OrderActionEnum.removeFromRoute)
         break;
      case OrderStatusEnum.outForDelivery:
      case OrderStatusEnum.delivered:
      case OrderStatusEnum.confirmed:
      case OrderStatusEnum.completed:
      case OrderStatusEnum.invalid:
      default:
         break;
   }

   if (!order.codeFromQr) { array.push(OrderActionEnum.addQrCode) }

   if (!order.isApproved) {
      // switch (status) {
      //    case OrderStatusEnum.atShop:
      //    case OrderStatusEnum.inShop:
      //    case OrderStatusEnum.readyForDelivery:
      //    case OrderStatusEnum.assignedForDelivery:
      //    case OrderStatusEnum.outForDelivery:
      //    case OrderStatusEnum.delivered:
      //       array.push(OrderActionEnum.approve)
      //       break;
      //    default:
      //       break;
      // }
      array.push(OrderActionEnum.changeOrder)

   }
   //TODO only add if at shop .. ie not in truck
   //add the pricing action if everything is priced but we have not yet set isApproved
   if (order.unpricedCount == 0 && !order.isApproved) {
      // switch (status) {
      //    case OrderStatusEnum.atShop:
      //    case OrderStatusEnum.inShop:
      //    case OrderStatusEnum.readyForDelivery:
      //    case OrderStatusEnum.assignedForDelivery:
      //    case OrderStatusEnum.outForDelivery:
      //    case OrderStatusEnum.delivered:
      //       array.push(OrderActionEnum.approve)
      //       break;
      //    default:
      //       break;
      // }
      array.push(OrderActionEnum.approve)
   }

   array.push(OrderActionEnum.print) //DEBUG

   return array;
} //end shpGenerateOrderDetailActions

//method returns all "normal" actions for the order in its given status
//this method is used by the route tile to provide buttons for these actions
// ** this method is closely associated with generateAllActionsForOrder except the 'un' actions
//TODOMISSED shp generate order tile
export function shpGenerateOrderTileActions(order) {
   const { status } = order
   let array = []
   switch (status) {
      case OrderStatusEnum.initial:
      case OrderStatusEnum.cancelled:
         // we do not expect either of these .. could annunciate
         break;
      case OrderStatusEnum.readyForPickup:
         // this action removed 20210817 .. better already be in Route
         // array.push(OrderActionEnum.addToRoute)
         break;
      case OrderStatusEnum.assignedForPickup:
      case OrderStatusEnum.outForPickup:
      case OrderStatusEnum.pickedUp:
         break;
      case OrderStatusEnum.atShop:
         array.push(OrderActionEnum.accept)
         break;
      case OrderStatusEnum.inShop:
         array.push(OrderActionEnum.cleaned)
         break;
      case OrderStatusEnum.readyForDelivery:
         // this action removed 20210817 .. better already be in Route
         // array.push(OrderActionEnum.addToRoute)
         break;
      case OrderStatusEnum.assignedForDelivery:
      case OrderStatusEnum.outForDelivery:
      case OrderStatusEnum.delivered:
      case OrderStatusEnum.confirmed:
      case OrderStatusEnum.completed:
      case OrderStatusEnum.invalid:
      default:
         break;
   }

   return array;
} //end shpGenerateOrderTileActions

//The functional components are rendered when there is an action to process
//(for an order or route respectively)
//They will always display a modal .. they will call the onDismiss property
//when finished and the 'caller' should reset the action

//Provides a popup dialog for the action and if verified does the action
//NOTE onDismiss must be called so we will stop being rendered
//NOTE we have access to the route and its orders
//TODO add Toast confirming status change
export function shpProcessOrderAction(order, action, onDismiss) {

   const confirmStr = shpcmnOrderActionConfirmStr(action)

   //TODO do we have to test that the action is valid for this order ?

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
                  break; //no action required
               case OrderActionEnum.approve:
                  await dwdbfsOrderUpdateAsApproved(order)
                        try {
                           await cmnSendEmailAsync({
                              to: order.shopEmail,
                              html: prjFormatOrderForEmail(order)
                           })
                           await cmnSendEmailAsync({
                              to: order.email,
                              to: 'soung.chornay21@gmail.com',//DEBUG ///////////////////////////
                              html: prjFormatOrderForEmail(order)
                           })
                        }
                        catch (error) {
                           // annunciate error but we continue
                           cmnAlertPopup({ title: 'Error sending email', text: error.message })
                        }
                  
                  break;
               case OrderActionEnum.addToRoute:
               case OrderActionEnum.removeFromRoute:
                  ///special route operation NOOP for now
                  break;
               case OrderActionEnum.accept:
               case OrderActionEnum.cleaned:
                  await dwdbfsOrderStatusAction(order, action)
                  break;
               case OrderActionEnum.noop:
               case OrderActionEnum.invalid:
                  //TODO should be some error indication??
                  break;
               case OrderActionEnum.pickup:
               case OrderActionEnum.undoPickup:
               case OrderActionEnum.dropoff:
               case OrderActionEnum.undoDropoff:
                  //driver operations .. shouldn't be possible from a tile button
                  // BUT might be in some override situation for the shop
                  break;
               default:
                  //TODO should be some error indication??
                  break;
            }

            onDismiss()
         }
         }
      />

   )

}//end shpProcessOrderAction

//currently no immediate shop actions
export async function shpProcessOrderActionOnEvent(navigation, order, action) {

   switch (action) {
      case OrderActionEnum.print: //DEBUG
         const retCode = cmnPrintOrderAsync(order)
         //NOTE we always return true ... meaning that we have handled the command
         return true
         break
      case OrderActionEnum.changeOrder:
         navigation.navigate('DsMenuOrderChangeStart', { 'order': order });
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
   return false

}// end shpProcessOrderActionOnEvent  
