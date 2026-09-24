import React, { Component } from 'react'
import CmnCmdModal from 'DWcmn/CmnCmdModal'
import { RouteActionEnum, RouteStatusEnum } from 'DWcmn/Global';
import { dwdbfsOrderStatusAction, dwdbfsRouteAction } from 'DWcmn/DWDBfs'
import { strX } from 'DWcmn/I18n.js'

//method returns all available actions for the route in its given status
//excludes 'view' because that is assumed to apply to all routes
//this method is used by the route detail screen to provide buttons for these actions
// ** this method is closely associated with generateAllActionsForRoute
// 20101019 removed comment out addOrders and price, removed assign
export function shpGenerateRouteDetailActions(status) {
    let array = []
    switch (status) {
        case RouteStatusEnum.pending:
            // array.push(RouteActionEnum.addOrders)
            array.push(RouteActionEnum.lock);
            break;
        case RouteStatusEnum.locked:
            array.push(RouteActionEnum.unlock);
            break;
        case RouteStatusEnum.open:
            break;
        case RouteStatusEnum.completedNeedsAction:
            array.push(RouteActionEnum.accept);
            break;
        case RouteStatusEnum.completed:
            array.push(RouteActionEnum.accept);
            break;
        case RouteStatusEnum.acceptedNeedsAction:
            array.push(RouteActionEnum.done)
            break;
        case RouteStatusEnum.accepted:
            array.push(RouteActionEnum.done)
            break;
        case RouteStatusEnum.done:
            break;
        case RouteStatusEnum.invalid:
        default:
            break;
    }
    return array;
} //end shpGenerateRouteDetailActions

//method returns all actions from a route tile
//this method is used by the route list screen ... to do unusual things user must go to the detail
// ** this method is closely associated with generateAllActionsForRoute
//NOTE currently no actions ... you have to go to the Route Detail
export function shpGenerateRouteTileActions(shpId, route) {
    const status = route.status
    let array = []
     switch (status) {
        case RouteStatusEnum.pending:
            // array.push(RouteActionEnum.lock);
            break;
        case RouteStatusEnum.locked:
            break;
        case RouteStatusEnum.open:
            break;
        case RouteStatusEnum.completedNeedsAction:
            // array.push(RouteActionEnum.accept);
            break;
        case RouteStatusEnum.completed:
            // array.push(RouteActionEnum.accept);
            break;
        case RouteStatusEnum.acceptedNeedsAction:
            break;
        case RouteStatusEnum.accepted:
            // array.push(RouteActionEnum.done)
            break;
        case RouteStatusEnum.done:
            break;
        case RouteStatusEnum.invalid:
        default:
            break;
    }
    return array;
} //end shpGenerateRouteTileActions

//Called from the Route display screen (where we also have orders)
//Provides a popup dialog for the action and if verified does the action
//NOTE onDismiss must be called so we will stop being rendered
//NOTE we have access to the route and its orders
//TODO add Toast confirming status change
export function shpProcessRouteAction(route, orders, action, onDismiss) {

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
                switch (action) {
                    case RouteActionEnum.view:
                    case RouteActionEnum.continue:
                    case RouteActionEnum.addOrders:
                    case RouteActionEnum.accept:
                    case RouteActionEnum.close:
                    case RouteActionEnum.lock:
                        await dwdbfsRouteAction(route, orders, RouteActionEnum.lock)
                        //TODO experimented with cloud function
                        // try {
                        //     const { data } = await firebase.app().functions('asia-southeast2').httpsCallable('lockRoute')({
                        //         shopId: route.shopId, routeId: route.docId
                        //     });
                        //     console.log(data)
                        // } catch (error) {
                        //     console.log(error.message)
                        // }
                        onDismiss();
                        break;
                    case RouteActionEnum.unlock:
                        await dwdbfsRouteAction(route, orders, RouteActionEnum.unlock)
                        onDismiss();
                        break;

                    case RouteActionEnum.accept:
                    case RouteActionEnum.open:
                    case RouteActionEnum.complete:
                    case RouteActionEnum.noop:
                    case RouteActionEnum.invalid:
                    default:
                        //TODO should be some error indication??
                        onDismiss()
                        break;
                }

            }
            }
        />

    )

}// end shpProcessRouteAction

//BECAUSE ROUTE ACTIONS TYPICALLY REQUIRE THE UNDERLYING ORDERS TO HAVE BEEN READ WE DON'T HAVE ACTIONS ON TILE
//THIS ENTRY POINT IS PROVIDED BECAUSE IT IS DIFFERENT (NOT ORDERS[])
export function shpProcessRouteActionFromTile(route, action, onDismiss) {

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
                switch (action) {
                    case RouteActionEnum.view:
                    case RouteActionEnum.continue:
                    case RouteActionEnum.addOrders:
                    case RouteActionEnum.accept:
                    case RouteActionEnum.close:
                    case RouteActionEnum.lock:
                    case RouteActionEnum.unlock:
                    case RouteActionEnum.accept:
                    case RouteActionEnum.open:
                    case RouteActionEnum.complete:
                    case RouteActionEnum.noop:
                    case RouteActionEnum.invalid:
                    default:
                        //TODO should be some error indication??
                        onDismiss()
                        break;
                }

            }
            }
        />

    )

}// end shpProcessRouteActionFromTile
