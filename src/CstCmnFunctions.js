import { OrderActionEnum, OrderStatusEnum } from 'DWcmn/Global';
import { strX } from 'DWcmn/I18n.js'


export function cstcmnOrderStatusStr(status) {
    switch (status) {
        case OrderStatusEnum.initial: return (strX("cst.orderStatusDescrip.StillBeingEntered"))
        case OrderStatusEnum.cancelled: return (strX("cst.orderStatusDescrip.Cancelled"))
        case OrderStatusEnum.readyForPickup: return (strX("cst.orderStatusDescrip.ReadyForPickup"))
        case OrderStatusEnum.assignedForPickup: return (strX("cst.orderStatusDescrip.DriverAssigned"))
        case OrderStatusEnum.outForPickup: return (strX("cst.orderStatusDescrip.DriverOnWay"))
        case OrderStatusEnum.pickedUp: return (strX("cst.orderStatusDescrip.PickedUp"))
        case OrderStatusEnum.atShop:
        case OrderStatusEnum.inShop: return (strX("cst.orderStatusDescrip.AtShop"))
        case OrderStatusEnum.readyForDelivery: return (strX("cst.orderStatusDescrip.Cleaned"))
        case OrderStatusEnum.assignedForDelivery: return (strX("cst.orderStatusDescrip.AssignedForDelivery"))
        case OrderStatusEnum.outForDelivery: return (strX("cst.orderStatusDescrip.DriverOnWay"))
        case OrderStatusEnum.delivered: return (strX("cst.orderStatusDescrip.OrderDelivered"))
        case OrderStatusEnum.confirmed: return (strX("cst.orderStatusDescrip.OrderConfirmed"))
        case OrderStatusEnum.completed: return (strX("cst.orderStatusDescrip.OrderCompleted"))
        case OrderStatusEnum.invalid:
        default: return (strX("cst.orderStatusDescrip.Invalid"))
    }

} //end cstcmnOrderStatusStr
