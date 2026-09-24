import React from 'react'
import { GCText } from 'DWcmn/Gc'
import { prjPriceListItemStr } from 'DWcmn/PrjCmnFunctions'
import { prjPriceListItemLongName } from 'DWcmn/PrjCmnFunctions'
import { CdsMenuInfoIcon } from './CdsMenuInfoIcon'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'

export class CstMenuPriceList {

   static abc

   static set(x) {
      CstMenuPriceList.abc = x
   }

   static get() {
      return CstMenuPriceList.abc
   }

   static getCustomPricingString(code) {
      let list, table
      if (!(list = CstMenuPriceList.get())) {
         return null
      }
      if (table = list.customPriceStrings) {
         return table[code]
      }
         return null
   }

   static getExtraInfo(code) {
      let list, table
      if (!code) {
         return null
      }
      else if (!(list = CstMenuPriceList.get())) {
         return null
      }
      else if (table = list.extraInfoLiterals) {
         return table[code]
      }
      else {
         return null
      }
   }

   static getRemark(code) { //DEPRECATED
      let list, table
      if (!(list = CstMenuPriceList.get())) {
         return null
      }
      else if (table = list.remarks) {
         return table[code]
      }
      else {
         return null
      }
   }

}

//We include here some methods used to render a category name (that can include an Extra Info icon)
//These include formatting details specific to their context so probably should not be defined here
//so sue me!

//category name when used as top of page title (it will be the 'long' name)
export function cstPriceListCatNameInTitle(cat) {
   return (
      <GCText style={PRJ_STYLES.headerText}>{prjPriceListItemLongName(cat)} <CdsMenuInfoIcon line={cat} /></GCText>
   )
}

//category name when display as one of a list of items
//REMEMBER that a pseudo-item is a category that is an article of clothing and its children are the 
//  cleaning methods. we want it to display much like an item display (no icon for example)
export function cstPriceListCatNameInLine(cat) {
   if (cat.isPseudoItem) {
      return (
         <GCText detail>{prjPriceListItemStr(cat.name)} <CdsMenuInfoIcon line={cat} /></GCText>
      )
   }
   else {
      return (
         <GCText style={PRJ_STYLES.categoryLineText}>{prjPriceListItemStr(cat.name)} <CdsMenuInfoIcon line={cat} /></GCText>
      )

   }
}
