import React from 'react'

import { RouteActionEnum, RouteStatusEnum } from 'DWcmn/Global';
import CmnCmdModal from 'DWcmn/CmnCmdModal'
import { drvcmnRouteActionConfirmStr } from './DrvCmnFunctions'
import { dwdbfsRouteAction } from 'DWcmn/DWDBfs'
import { dwdbfsRouteDriverActionNEW } from 'DWcmn/dwdbfsRouteDriverActionNEW'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { strX } from 'DWcmn/I18n.js'

//20250215 driver route action processing combined here

//method returns all available actions for the route in its given status
//excludes 'view' because that is assumed to apply to all routes
//this method is used by the route detail screen to provide buttons for these actions
// 20101019 removed comment out addOrders and price, removed assign
export function drvGenerateRouteDetailActions(drvId, route) {
   const status = route.status
   const ours = (drvId == route.driverId);
   let array = []
   // array.push(RouteActionEnum.open) //DEBUG
   // array.push(RouteActionEnum.truckAtShop) //DEBUG
   // array.push(RouteActionEnum.releaseRoute) //DEBUG
   switch (status) {
      case RouteStatusEnum.locked: //we can open any route for the shop
         array.push(RouteActionEnum.open)
         break;
      case RouteStatusEnum.open:
         if (ours) {
            // array.push(RouteActionEnum.close)  //TODO remove close?
            array.push(RouteActionEnum.truckAtShop)
            array.push(RouteActionEnum.releaseRoute)
         }
         break;
      default:
         break;
   }
   return array;
} //end drvGenerateRouteDetailActions

//method returns all actions from a route tile
//BECAUSE we have not read all the orders in the route, most (currently all) actions are from detail screen
export function drvGenerateRouteTileActions(drvId, route) {
   const array = []
   return array;
} //end drvGenerateRouteTileActions

//Provides a popup dialog for the action and if verified does the action
//NOTE onDismiss must be called so we will stop being rendered
//NOTE we have access to the route and its orders
//TODO add Toast confirming status change
//TODO do we really need orders[]?
export function drvProcessRouteAction(driverId, route, orders, action, onDismiss) {

   const confirmStr = strX("drvshp.routeActionConfirm." + action.enumKey)

   //TODO do we have to test that the action is valid for this route ?
   return (
      <CmnCmdModal
         isVisible={true}
         swipeable={true}
         showDismiss={true}
         text={confirmStr}
         onDismiss={onDismiss}
         onConfirm={async () => {   
            await dwdbfsRouteDriverActionNEW(driverId, route, orders, action)
            onDismiss()
            // switch (action) {
            //    case RouteActionEnum.close:
            //       await dwdbfsRouteAction(route, orders, RouteActionEnum.close)
            //       onDismiss();
            //       break;
            //    case RouteActionEnum.open:
            //       await dwdbfsRouteAction(route, orders, RouteActionEnum.open)
            //       onDismiss();
            //       break;
            //    case RouteActionEnum.view:
            //    case RouteActionEnum.continue:
            //    case RouteActionEnum.addOrders:
            //    case RouteActionEnum.accept:
            //    case RouteActionEnum.lock:
            //    case RouteActionEnum.unlock:
            //    case RouteActionEnum.accept:
            //    case RouteActionEnum.complete:
            //    case RouteActionEnum.noop:
            //    case RouteActionEnum.invalid:
            //       prjAlert('unsupported route action ' + action.enumKey)
            //       onDismiss()
            //       break;
            //    default:
            //       prjAlert('invalid route action')
            //       onDismiss()
            //       break;
            // }

         }
         }
      />

   )

}// end drvProcessRouteAction


//BECAUSE ROUTE ACTIONS TYPICALLY REQUIRE THE UNDERLYING ORDERS TO HAVE BEEN READ WE DON'T HAVE ACTIONS ON TILE
//THIS ENTRY POINT IS PROVIDED BECAUSE IT IS DIFFERENT (NOT ORDERS[])
export function drvProcessRouteActionFromTile(route, action, onDismiss) {

   const confirmStr = strX("drvshp.routeActionConfirm." + action.enumKey)

   //TODO do we have to test that the action is valid for this route ?
   return (
      <CmnCmdModal
         isVisible={true}
         swipeable={true}
         showDismiss={true}
         text={confirmStr}
         onDismiss={onDismiss}
         onConfirm={async () => {
            onDismiss()
         }
         }
      />

   )

}// end drvProcessRouteActionFromTile


//CURRENTLY NO ON_EVENT ACTIONS FOR ROUTE DETAIL SCREEN.
//IMPLEMENT WITH CARE
//WE RETURN FALSE TO SAY THAT WE HAVE NOT PROCESSED THE ACTION
export function drvProcessRouteActionOnEvent(navigation, driverId, route, orders, action) {
   return false
}
