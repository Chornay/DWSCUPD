import React from 'react'
import cloneDeep from 'lodash/cloneDeep'
import { OrderActionEnum, OrderStatusEnum } from 'DWcmn/Global';
import CmnCmdModal from 'DWcmn/CmnCmdModal';
import { dwdbfsOrderStatusAction } from 'DWcmn/DWDBfs'
import { dwdbfsOrderArchive, dwdbfsOrderCancel } from 'DWcmn/dwdbfsOrder'
import { ActionConfirmI18nLookup } from 'DWcmn/Global'
import { generateRescheduleAction } from 'DWcmn/prjOrderStatusFunctions'
import { strX } from 'DWcmn/I18n.js'
import { prjWhatsapp } from 'DWcmn/prjExternalApps'

//20250214 created for action processing re-org from CstCmnProcessCommand methods
//20250222 

//processCommand will be called by the tile when a button is pressed.
//NOTE the method can return JSX which will be rendered (hence a modal dialog)\
//we call the onDismiss parameter and we won't be called again.
//it  provides a popup dialog for the action and if verified updates the order
//NOTE it 
//TODO add Toast confirming status change


//method returns all "normal" actions for the order in its given status
//this method is used by the order tile to provide buttons for these actions
//NOTE cancel is not available in the tile
export function cstGenerateTileActions(order) {
   let { status, isPaid } = order
   let array = []
   let temp

   //check for confirm
   if (status == OrderStatusEnum.delivered) { array.push(OrderActionEnum.confirm) }

   //check for pay
   //if NOT cancelled and not paid then add pay option .. allows them to say COD
   if (order.status != OrderStatusEnum.cancelled && !isPaid) { array.push(OrderActionEnum.pay) }

   //check for reschedule
   if (temp = generateRescheduleAction('cst', order)) { array.push(temp) } //maybe reschedulable

   //always detais and whatsapp
   array.push(OrderActionEnum.details)
   array.push(OrderActionEnum.whatsapp)

   return array;
} //end cstGenerateTileActions

//method returns all actions for the order in its given status
//this method is used by the order detail to provide buttons for these actions
export function cstGenerateDetailActions(order) {
   let { status, isPaid } = order
   let array = []
   let temp

   //check for confirm
   if (status == OrderStatusEnum.delivered) { array.push(OrderActionEnum.confirm) }

   //check for pay
   //if NOT cancelled and not paid then add pay option .. allows them to say COD
   if (order.status != OrderStatusEnum.cancelled && !isPaid) { array.push(OrderActionEnum.pay) }

   //check for  cancel
   switch (status) {
      case OrderStatusEnum.initial:
      case OrderStatusEnum.readyForPickup:
      case OrderStatusEnum.assignedForPickup:
      case OrderStatusEnum.missedPickup:
         !isPaid && array.push(OrderActionEnum.cancel)
         break;
   }
   //check for reschedule
   if (temp = generateRescheduleAction('cst', order)) { array.push(temp) }

   //always whatsapp
   array.push(OrderActionEnum.whatsapp)

   return array;
} //end export function cstGenerateDetailActions(order) {


//Interpret an action from a button on either a tile or a detail screen
//OnEvent actions are done inside the onPress button code
//they are not 'confirmed' before executing
//TODO readonly?
export function cstProcessActionOnEvent(navigation, order, action) {

   switch (action) {
      case OrderActionEnum.details:
         navigation.navigate('OrderDetail', { 'id': order.id, 'readonly': false });
         return true
         break;
      case OrderActionEnum.whatsapp:
         (async () => { await prjWhatsapp({ order: order }) })();  //Immediately-invoked / Anonymous Async Function
         return true
         break;
      default:
         return false
         break;
   }

}

//Interpret an action from a button on either a tile or a detail screen
//Executing the action occurs only after verification by user
export function cstProcessAction(navigation, order, action, onDismiss) {

   const confirmStr = strX("cst.orderActionConfirm." + action.enumKey)

   //TODO note that if we had to we could avoid the verify action
   //     for any action that did not have a confirm string

   return (
      <CmnCmdModal
         isVisible={true}
         swipeable={true}
         showDismiss={true}
         text={confirmStr}
         onDismiss={onDismiss}
         onConfirm={async () => {
            switch (action) {
               case OrderActionEnum.cancel:
                  dwdbfsOrderCancel(order.id,
                     order.status,
                     order.shopId,
                     order.pickupRouteId,
                     order.deliveryRouteId)
                  break;
               case OrderActionEnum.confirm:
                  await dwdbfsOrderArchive(order.id)
                  break;
               case OrderActionEnum.pay:
                  navigation.navigate("CstPaymentOptions", { 'order': order })
                  break;
               case OrderActionEnum.rescheduleBoth:
                  {
                     let orderCopy = cloneDeep(order)
                     navigation.navigate("CstCheckoutSelectRoutePickup", { 'order': orderCopy, 'reschedule': true })
                     break;
                  }
               case OrderActionEnum.rescheduleDelivery:
                  {
                     let orderCopy = cloneDeep(order)
                     navigation.navigate("CstCheckoutSelectRouteDelivery", { 'order': orderCopy, 'reschedule': true })
                     break;
                  }
               default:
                  //TODO should be some error indication??
                  break;
            }

            onDismiss()
         }
         }
      />

   )

}
