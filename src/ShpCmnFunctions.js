import GLOBALS from 'DWcmn/Global'
import { OrderActionEnum, OrderStatusEnum } from 'DWcmn/Global';
import { RouteActionEnum, RouteStatusEnum } from 'DWcmn/Global';
import { strX } from 'DWcmn/I18n.js'


//this returns a string for every order status that should appear for a shop
export function shpcmnOrderStatusStr(status) {
    let prop = (status == null ? 'invalid' : status.enumKey)
    return (strX("shp.orderStatusDescrip." + prop))
} //end shpcmnOrderStatusStr

//TODOMISSED shpcmnOrderStatusColor
export function shpcmnOrderStatusColor(status) {
    switch (status) {
        case OrderStatusEnum.readyForPickup: return ('#ff1a1a');
        case OrderStatusEnum.pickedUp: return ('#ff9999');
        case OrderStatusEnum.readyForDelivery: return ('#47d147');
        case OrderStatusEnum.delivered: return ('#adebad');
        default: return ('white');
    }
} //end drvcmnOrderStatusColor

//this returns a string for every action that should appear for a order
//it just takes the tag and maps it to the right translated string
export function shpcmnOrderActionConfirmStr(status) {
    let prop = (status == null ? 'invalid' : status.enumKey)
    return (strX("drvshp.orderActionConfirm." + prop))
} //end shpcmnOrderActionConfirmStr


//this returns a string for every status that should appear for a route
//it just takes the tag and maps it to the right translated string
export function shpcmnRouteStatusStr(status) {
    let prop = (status == null ? 'invalid' : status.enumKey)
    return (strX("shp.routeStatusDescrip." + prop))
} //end shpcmnRouteStatusStr

//20231005 changed to use drvshp.routeActionConfirm instead of shp
//20250220 no longer used
// export function shpcmnRouteActionConfirmStr(action){
//   if (action==null) return ("")
//   switch(action){
//     case RouteActionEnum.accept: return (strX("drvshp.routeActionConfirm.accept"))
//     case RouteActionEnum.lock: return (strX("drvshp.routeActionConfirm.lock"))
//     case RouteActionEnum.unlock: return (strX("drvshp.routeActionConfirm.unlock"))
//     default: return("")
//   }
// }

//TODO complete shpcmnRouteStatusColor
export function shpcmnRouteStatusColor(enumStatus) {
    return ('red')
}// end shpcmnRouteStatusColor

