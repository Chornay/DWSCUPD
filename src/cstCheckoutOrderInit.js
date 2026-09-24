import firebase from '@react-native-firebase/app';
import cloneDeep from 'lodash/cloneDeep'
import { OrderStatusEnum } from 'DWcmn/Global'
import { prjUpdateOrderPricing } from 'DWcmn/prjUpdateOrderPricing'
import { CST } from './CST'

//20250213 added OrderIdFromQr moved over from priceList
//20251013 QR code in order is renamed codeFromQr

//NOTE DsMenuOrderChangeInvoice does the same thing (-ish)
//     If you make changes here then have a lookover there
//     YOU HAVE BEEN WARNED
export async function cstCheckoutOrderInit(priceList) {

   let cust = CST.getCust()
   let shop = CST.getShop()

   //extract all the pricelist categories that have selected entries
   //fill an array 'tasks' in every bundle which has the 'lineItem' from the pricelist

   let fooOrder = {
      // id: 'abcd',
      custId: cust.id,
      codeFromQr: priceList.codeFromQr,
      comboShopId: shop.comboShopId,
      shopId: priceList.shopId,
      shopPhone: shop.phoneNumber,
      shopWhatsappNumber: shop.whatsappNumber || shop.phoneNumber,
      shopEmail: shop.email,
      shopArchiveEmail: shop.archiveEmail,
      name: cust.name,
      //TODO for completeness should set pickup and delivery route id to null?
      pickupRouteTime: null,
      pickupRouteDescrip: null,
      deliveryRouteTime: null,
      deliveryRouteDescrip: null,
      status: OrderStatusEnum.initial,
      statusDate: null,
      route: null,
      token: null,                                //will be the notification token
      transactions: [],
      items: [],
      // home: cloneDeep below
      address: cust.homeStop.address,
      // location: cloneDeep below
      phoneNumber: (cust.phoneNumber || null),
      email: cust.email,
      // pickupStop: cloneDeep below
      deliveryStop: null,
      remarks: null,
      serviceLevel: 'regular',                   //Service defaults to regular
      serviceSurchargePercent: 0,                //  => 0%
      serviceSurchargeAmount: 0,                 //  => $0
      minCharge: shop.minCharge,
      minFreeDelivery: shop.minFreeDelivery,     //copied from shop for convenience
      shopDeliveryCharge: shop.deliveryCharge,   //copied from shop for convenience
      deliveryChargeToApply: 0,                  //charge will be calculated in prjUpdateOrderPricing
      totalPrice: -1,                            //we do not use the priceList pricing .. prjUpdateOrderPricing
      isApproved: null,                            //set in prjUpdateOrderPricing()
      //PriceList contains the minimum processing time for each service level
      //calculated as the minimum of the processing times for each item
      //NOTE this detail is NOT included in the order
      priceListVersion: priceList?.version, 
      procTimeReg: priceList.procTimeReg,
      procTimeExp: priceList.procTimeExp,
      procTimeSameDay: priceList.procTimeSameDay,
      curfewStart: priceList?.curfewStart,
      curfewEnd: priceList?.curfewEnd,
      allowCash: shop.allowCash,
      allowCashOnPickup: shop.allowCashOnPickup,
      allowCashOnDelivery: shop.allowCashOnPickup,
      allowOnline: shop.allowOnline,
      driverWeighs: shop.driverWeighs,
      // notes[] is undefined
   }
   fooOrder.home = cloneDeep(cust.homeStop)
   fooOrder.pickupStop = cloneDeep(cust.homeStop)
   fooOrder.location = cloneDeep(cust.homeStop.location)

   //pick out any selected items and include in the order
   //NOTE we do not have to total any pricing details ... done next
   priceList.top.entries.forEach((category) => {
      processCategory(category, fooOrder)
   })

   //add a unique key to items .... actually the 'code' field should be unique
   let count = 1
   fooOrder.items.forEach((item) => {
      item.key = count++
   })

   prjUpdateOrderPricing(fooOrder, true /*firstTime*/)

   //token can null if app is denied notification permission
   try { fooOrder.token = await firebase.messaging().getToken() }
   catch (error) { }

   return fooOrder

} //end cstCheckoutOrderInit


function processCategory(category, fooOrder) {
   category.entries.forEach((entry) => {
      if (entry.isCategory) {
         processCategory(entry, fooOrder)
      }
      else {
         processLine(category, entry, fooOrder)
      }
   })

}//end processCategory

//TODO check out order init
//20250805 added imagePath property to item
//20260205 set input item to be unpriced
function processLine(category, lineItem, fooOrder) {
   if (lineItem.included) { //okay, we need this category
      let item = {
         code: lineItem.code,
         name: lineItem.name,
         longName: lineItem.longName || null, //field may be undefined
         category: category.name,
         unitType: lineItem.unitType,
         count: lineItem.count??null,
         weight: null,
         unitPrice: lineItem.unitPrice??null,
         netPrice: (lineItem.netPrice < 0) ? 0 : lineItem.netPrice,
         // isPriced: (lineItem.unitType == 'pc'), //Only by count is priced
         isPriced: !['kg','spc','EZnote'].includes(lineItem.unitType),
         remarks: lineItem.hasOwnProperty('remarks') ? lineItem.remarks : null,
         imagePath: lineItem.imagePath,
         inputText: lineItem.inputText??null,
         choiceIndex: lineItem.choiceIndex??null,
         choiceText: (lineItem.choiceIndex!=null)?lineItem.choices[lineItem.choiceIndex]:null
      }
      fooOrder.items.push(item);
   }

}//end processLine
