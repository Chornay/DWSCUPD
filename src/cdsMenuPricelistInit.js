import { pruneCategory } from "./cdsMenuPricelistUpdateTotals"

//20250213 added orderIdFromQR parameter and stored in priceList.orderIdFromQR
//20251014 orderIdFromQR changed to codeFromQr

//TODO NOTE that this method should probably use cdsMenuPricelistUpdateTotals

export async function cdsMenuPricelistInit(priceList, codeFromQr) {

   priceList.top.entries.forEach((category) => {
      initCategory(priceList, category)
   });

   priceList.codeFromQr = codeFromQr?String(codeFromQr):null //want this to be a string or null
   priceList.count = 0
   priceList.unpricedCount = 0
   priceList.unweighedCount = 0
   priceList.unpricedSpecialCount = 0
   priceList.totalPrice = 0.0
   priceList.procTimeReg = 0
   priceList.procTimeExp = 0
   priceList.procTimeSameDay = 0
   priceList.isPaid = false

}//end cdsMenuPricelistInit

//remember that a category can contain a pricing item (line) or a sub-category
function initCategory(priceList, category) {
   category.expanded = false;
   category.count = 0;

   category.entries.forEach((entry) => {
      if (entry.isCategory) { initCategory(priceList, entry) }
      else initLine(priceList, entry)
   });
   pruneCategory(category) //mark extra input and adj types as not renderable
}

function initLine(priceList, lineItem) {
   lineItem.count = 0;
   lineItem.included = false;
   lineItem.netPrice = 0.0;
   lineItem.note = null;
   //if there are no special processing times use the shop default
   if (!lineItem.hasOwnProperty('procTimeReg')) lineItem.procTimeReg = priceList.header.procTimeReg
   if (!lineItem.hasOwnProperty('procTimeExp')) lineItem.procTimeExp = priceList.header.procTimeExp
   if (!lineItem.hasOwnProperty('procTimeSameDay')) lineItem.procTimeSameDay = priceList.header.procTimeSameDay
}

