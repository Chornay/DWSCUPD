import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'

//////////////////////////////////////////////////////////////////////////////////////////
//dsLoadPriceListFromOrder

//returns true iff loading successful, issues alert popup if error and returns false
export function dsLoadPriceListFromOrder(priceList, order) {

   priceList.orderId = order.id
   priceList.orderChangeCount = 0
   priceList.orderChangeInProgress = true

   for (const item of order.items) {
      const result = dsSearchPriceListForCode(priceList, item.code)
      if (result) {
         fillPriceListEntryFromOrder(item, result)
      }
      else {
         cmnAlertPopup({ title: `Can't find ${item.code} in pricelist` })
         return false
      }
   }
   return true
}

function fillPriceListEntryFromOrder(orderItem, priceListEntry) {
   // console.log('orderitem to fill',orderItem)
   priceListEntry.count = orderItem.count
   priceListEntry.weight = orderItem.weight
   priceListEntry.unitPrice = orderItem.unitPrice
   priceListEntry.netPrice = orderItem.netPrice
   priceListEntry.isPriced = orderItem.isPriced
   //need inputText
   switch (priceListEntry.unitType) {
      case 'choice':
         priceListEntry.choiceIndex = orderItem.choiceIndex
         // priceListEntry.choiceName=orderItem.choiceName //don't need
         break;
      case 'EZnote':
      case 'adj':
      case 'shopNote':
         priceListEntry.inputText = orderItem.inputText
         break;
   }
   priceListEntry.included = true
}



//////////////////////////////////////////////////////////////////////////////////////////
// dsSearchPriceListForCode

//search every category in the priceList for the specified code and return that line
//we use this to find the entry that corresponds to an line in an order
export function dsSearchPriceListForCode(priceList, searchCode) {
   for (const category of priceList.top.entries) {
      const line = searchCategory(category, searchCode)
      if (line) return line
   }
   return null
}

function searchCategory(category, searchCode) {
   let result
   for (const entry of category.entries) {
      if (entry.isCategory) {
         result = searchCategory(entry, searchCode)
      }
      else {
         result = searchLine(category, entry, searchCode)
      }
      if (result) return result
   }
   return null
}//end searchCategory

function searchLine(category, lineItem, searchCode) {
   if (lineItem.code == searchCode) return lineItem
   else return null
}//end searchLine

