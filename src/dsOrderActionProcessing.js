import {APP} from 'DWcmn/APP'

import { drvGenerateOrderTileActions, drvProcessOrderAction, drvProcessOrderActionOnEvent } from './drvOrderActionProcessing'
import { shpGenerateOrderTileActions, shpProcessOrderAction, shpProcessOrderActionOnEvent } from './shpOrderActionProcessing'


export function dsGenerateOrderTileActions(order) {
    switch (APP.getAppType()) {
        case 'drv': return drvGenerateOrderTileActions(order)
        case 'shp': return shpGenerateOrderTileActions(order)
        default: return []
    }
}

export function dsProcessOrderAction(order, action, onDismiss) {
    switch (APP.getAppType()) {
        case 'drv': return drvProcessOrderAction(order, action, onDismiss); break
        case 'shp': return shpProcessOrderAction(order, action, onDismiss); break
        default: onDismiss(); break
    }
}

export async function dsProcessOrderActionOnEvent(navigation, order, action) {
    switch (APP.getAppType()) {
        case 'drv': return await drvProcessOrderActionOnEvent(navigation, order, action)
        case 'shp': return await shpProcessOrderActionOnEvent(navigation, order, action)
        default: return false
    }
}

shpProcessOrderActionOnEvent