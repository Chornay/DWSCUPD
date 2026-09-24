
//go through the price list to:
//  count the number of selected items
//  count the number of unpriced items
//  count the number of unweighed items
//  count the number of 'special' price items
//  calculate the total price
//  calculate the minimum order processing time from max of item processing times
//  AND sets the 'included' flag on each item/category selected
//20250707 added coded to mark unused 'EZnote' and 'adj' as 'dontRender' pruneCategory

//TODO NOTE that this method probably should be used in cdsMenuPricelistInit

export function cdsMenuPricelistUpdateTotals(priceList) {

   priceList.count = 0
   priceList.unpricedCount = 0
   priceList.unweighedCount = 0
   priceList.unpricedSpecialCount = 0
   priceList.totalPrice = 0
   priceList.procTimeReg = 0
   priceList.procTimeExp = 0
   priceList.procTimeSameDay = 0

   //the top is a list of categories
   priceList.top.entries.forEach((category) => {
      updateCountAndTotalInCategory(priceList, category)
   });

   //DO SOMETHING LIKE THE FOLLOWING IF WE WANT PRICELIST TO KNOW ABOUT MINIMUMS
   // priceList.isPriced = (priceList.unpricedCount == 0)
   // if (priceList.totalPrice<priceList.minCharge) {
   //    if (priceList.isPriced){
   //       priceList.minChargeStatus = 'applies'
   //       priceList.netPriceBeforeMinimum = priceList.totalPrice
   //       priceList.totalPrice = priceList.minCharge
   //    }
   //    else {
   //       priceList.minChargeStatus = 'maybe'
   //    }

   // }
   // else {
   //    priceList.minChargeStatus = 'none'
   // }

} //end cdsMenuPricelistUpdateTotals

function updateCountAndTotalInCategory(priceList, category) {
   let included = false
   category.entries.forEach((entry) => {
      //NOTE included MUST be rhs of || .. we always want to do the update call (tricky huh?)
      if (entry.isCategory) { included = updateCountAndTotalInCategory(priceList, entry) || included }
      else included = updateCountAndTotalInItem(priceList, entry) || included
   });
   category.included = included //added 20230507
   pruneCategory(category)
   return included
}


function updateCountAndTotalInItem(priceList, lineItem) {
   if (lineItem.included) {
      ++priceList.count
      if (lineItem.netPrice > 0) {
         priceList.totalPrice += lineItem.netPrice
      }
      else {  //net price <-0
         if (lineItem.unitType == 'kg') { ++priceList.unWeighedCount }
         else if (lineItem.unitType == 'spc') { ++priceList.unpricedSpecialCount }
         ++priceList.unpricedCount
      }
      if (lineItem.procTimeReg > priceList.procTimeReg) { priceList.procTimeReg = lineItem.procTimeReg }
      if (lineItem.procTimeExp > priceList.procTimeExp) { priceList.procTimeExp = lineItem.procTimeExp }
      if (lineItem.procTimeSameDay > priceList.procTimeSameDay) { priceList.procTimeSameDay = lineItem.procTimeSameDay }
   }
   return lineItem.included
} //updateCountAndTotalInItem 

export function pruneCategory(category) {
   const MAX_EMPTIES = 3
   let emptyCount = 0
   let emptyType = ''
   for (const item of category.entries) {
      const type = item.unitType
      if (type == 'EZnote' || type == 'adj' || type == 'shopNote') {
         if (!item.inputText) { //the element is empty
            if (emptyType == type) {
               ++emptyCount
            }
            else {
               emptyType = type
               emptyCount = 1
            }
         }
         else { //it is used .. reset our counter
            emptyCount = 0
            emptyType = ''
         }
         item.dontRender = emptyCount > MAX_EMPTIES
      }

   }
}
