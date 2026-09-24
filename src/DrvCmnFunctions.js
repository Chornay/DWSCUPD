
import { OrderActionEnum, OrderStatusEnum } from 'DWcmn/Global';
import { RouteActionEnum, RouteStatusEnum } from 'DWcmn/Global';
import { PaymentMethodEnum } from 'DWcmn/Global'
import { strX } from 'DWcmn/I18n.js'

export function drvcmnOrderStatusColor(status) {
    switch (status) {
      case OrderStatusEnum.readyForPickup:
      case OrderStatusEnum.assignedForPickup:
      case OrderStatusEnum.outForPickup:
         return ('#ff1a1a');
      case OrderStatusEnum.pickedUp: return ('#ff9999');
      case OrderStatusEnum.readyForDelivery: return ('#47d147');
      case OrderStatusEnum.delivered: return ('#adebad');
      default: return ('white');
    }
  } //end drvcmnOrderStatusColor
  

//TODO check and i18n drvcmnOrderStatusStr
export function drvcmnOrderStatusStr(status) {
  // console.warn(status)
    switch (status) {
      case OrderStatusEnum.readyForPickup:
      case OrderStatusEnum.assignedForPickup:
      case OrderStatusEnum.outForPickup:
        return ('PICKUP');
        case OrderStatusEnum.missedPickup: return ('MISSED PICKUP');
        case OrderStatusEnum.pickedUp: return ('IN TRUCK');
        case OrderStatusEnum.readyForDelivery: return ('DELIVER');
        case OrderStatusEnum.missedDelivery: return ('MISSED DELIVERY');
      case OrderStatusEnum.delivered: return ('GONE');
      case OrderStatusEnum.accepted: return ('OKAYED');
      default: return ('***')
    }
  } //end drvcmnOrderStatusStr


// //this returns a string for every action that should appear for a order
// //it just takes the tag and maps it to the right translated string
// export function drvcmnOrderActionConfirmStr(action) {
//   let prop = (action == null ? 'invalid' : action.enumKey)
//   return (strX("drvshp.orderActionConfirm." + prop))
// } //end drvcmnRouteActionConfirmStr

//TODO check routeStatusDescrip for drv
//this returns a string for every status that should appear for a route
export function drvcmnRouteStatusStr(status) {
    let prop = (status==null?'invalid':status.enumKey)
    return (strX("drv.routeStatusDescrip." + prop))
  } //end drvcmnRouteStatusStr
  
  // export function drvcmnRouteActionConfirmStr(action){
  //   let prop = (action==null?'invalid':action.enumKey)
  //   return (strX("drvshp.routeActionConfirm." + prop))
  // }
  