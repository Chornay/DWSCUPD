import React from 'react'
import { View, StyleSheet, TouchableOpacity, Switch, Platform } from 'react-native'
import InputSpinner from 'react-native-input-spinner'

import { ListItem } from 'native-base';
import ModalSelector from 'react-native-modal-selector'

import GLOBALS from 'DWcmn/Global';
import { COLORS } from 'DWcmn/Global';
import { GC_STD_MARGIN, GC_MIN_MARGIN } from 'DWcmn/Global'
import { strX } from 'DWcmn/I18n.js'
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import { cmnFormatAPrice } from 'DWcmn/cmnFormatFunctions'
import { prjPriceListItemName } from 'DWcmn/PrjCmnFunctions'
import { CmnTouchableEdit } from 'DWcmn/CmnTouchableEdit'
import { PrjIconButton } from 'DWcmn/Prj'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { CstMenuPriceList, getCustomPricingString } from './CstMenuPriceList'
import { CdsMenuInfoIcon } from './CdsMenuInfoIcon'
import { CmnDropdownModalPicker } from 'DWcmn/CmnDropDownModalPicker'
import { prjIconEditableBox } from 'DWcmn/PrjIconComponents'
import { CmnTouchablePrice } from 'DWcmn/CmnTouchablePrice'
import { prjToast } from 'DWcmn/PrjToast'

//20230310 Major revision to PlusMinus and created own Checkbox
//20230430 changed to underline included items and touch to add instructions
//20230501 moved ? to left side in the margin
//20230502 removed extraInfo ? from pricing are for SPC
//20230511 addeda back /each in unit price
//20250707 added kludgy code to 'disappear' dontRender lines
//20251118 rewrite PlusMinus
//20260315 Allow negative adjustment
//20260919 converted to functional components

//prop line
//prop useLongName
//prop changedSomething()
//prop onLeftTouch()
export function CdsMenuLineDisplay({ line, useLongName, changedSomething, onLeftTouch }) {

   const ITEM_PADDING = 10


   function processLine(line) {
      updateNetPrice(line)
      if (!line.included) { delete line.remarks; delete line.imagePath }
      changedSomething()

   } //processLine


   function renderContent(line) {
      const type = line.unitType

      switch (type) {

         case 'choice'://choose from a pick list. Free or prices specified in an array per pick
            return (
               <>
                  <View style={{ flex: .6, flexWrap: 'wrap' }}>
                     {renderName(line)}
                  </View>
                  <View style={{ flex: .4 }}>
                     <CmnDropdownModalPicker choices={line.choices}
                        prices={line.prices} //may be null meaning no charge for any pick
                        initialIndex={line.choiceIndex}
                        onChange={(index) => {
                           const hasPrices = !!line.prices
                           line.choiceIndex = index
                           line.included = !!line.choices[index]
                           line.unitPrice = hasPrices ? line.prices[index] : 0
                           processLine(line)
                        }} />
                  </View>

               </>)
            break;

         //adjustment - shop-entered text with price
         //will be included (and priced) if the text is non-null
         case 'adj':
            return (
               <>
                  <View style={{ flex: .65, flexWrap: 'wrap' }}>
                     {renderTextInput(line, line.inputText,
                        (value) => {
                           line.inputText = value
                           line.included = !!line.inputText
                           line.isPriced = line.included
                           if (!line.included) { line.unitPrice = null }
                           processLine(line)
                        })}
                  </View>
                  <View style={{ flex: .35 }}>
                     {line.included && renderAdjInput(line.unitPrice,
                        (value) => {
                           line.unitPrice = value
                           processLine(line)
                        }
                     )}
                  </View>

               </>)
            break;

         case 'EZnote': //user-entered text
            return (
               <>
                  <View style={{ flex: 1, flexWrap: 'wrap' }}>
                     {renderTextInput(line, line.inputText,
                        (value) => {
                           line.inputText = value
                           line.included = !!line.inputText
                           //NOTE an input (shop comment) must be 'ticked' by the shop to allow price done
                           processLine(line)
                        })}
                  </View>

               </>)
            break;

         //shop enters a note .. it is always 'priced'
         case 'shopNote': //user-entered text
            return (
               <>
                  <View style={{ flex: 1, flexWrap: 'wrap' }}>
                     {renderTextInput(line, line.inputText,
                        (value) => {
                           line.inputText = value
                           line.included = !!line.inputText
                           line.isPriced = line.included
                           processLine(line)
                        })}
                  </View>

               </>)
            break;

         case 'EZcount': //cust in EZ enters a count for a specific item
            return (
               <>
                  <View style={{ flex: .65, flexWrap: 'wrap' }}>
                     {renderName(line)}
                  </View>
                  <View style={{ flex: .35 }}>
                     <View style={{ alignSelf: 'center' }}>
                        <PlusMinus
                           value={line.count}
                           onChange={(num) => {
                              line.count = num;
                              line.included = (line.count > 0);
                              line.isPriced = line.included;
                              processLine(line)
                           }}></PlusMinus>
                     </View>
                  </View>

               </>)
            break;

         case 'pc': //priced by the piece
            return (
               <>
                  <View style={{ flex: .4, flexWrap: 'wrap' }}>
                     {renderName(line)}
                  </View>
                  <View style={{ flex: .25 }}>
                     <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {renderUnitPrice(line)}
                     </View>
                  </View>
                  <View style={{ flex: .35 }}>
                     <View style={{ alignSelf: 'center' }}>
                        <PlusMinus
                           value={line.count}
                           onChange={(num) => {
                              line.count = num;
                              line.included = (line.count > 0);
                              line.isPriced = line.included;
                              processLine(line)
                           }}></PlusMinus>
                     </View>
                  </View>

               </>)
            break;


         case 'yesNo': //
            const hasAPrice = !!line.unitPrice
            return (
               <>
                  <View style={{ flex: hasAPrice ? .4 : .65, flexWrap: 'wrap' }}>
                     {renderName(line)}
                  </View>
                  {hasAPrice && <View style={{ flex: .25 }}>
                     <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {renderUnitPrice(line)}
                     </View>
                  </View>}
                  <View style={{ flex: .35 }}>
                     <View style={{ alignSelf: 'center' }}>
                        <NewCheckBox
                           checked={line.included}
                           onPress={() => {
                              line.included = !line.included;
                              processLine(line)
                           }}
                        />
                     </View>
                  </View>

               </>)
            break;

         case 'kg': //priced by weight
            return (
               <>
                  <View style={{ flex: .4, flexWrap: 'wrap' }}>
                     {renderName(line)}
                  </View>
                  <View style={{ flex: .25 }}>
                     <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {renderUnitPrice(line)}
                     </View>
                  </View>
                  <View style={{ flex: .35 }}>
                     <View style={{ alignSelf: 'center' }}>
                        <NewCheckBox
                           checked={line.included}
                           onPress={() => {
                              line.included = !line.included;
                              line.weight = 0.0
                              processLine(line)
                           }}
                        />
                     </View>
                  </View>

               </>)
            break;

         case 'spc': //special item to be priced at shop
            return (
               <>
                  <View style={{ flex: .4, flexWrap: 'wrap' }}>
                     {renderName(line)}
                  </View>
                  <View style={{ flex: .25 }}>
                     <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {renderUnitPrice(line)}
                     </View>
                  </View>
                  <View style={{ flex: .35 }}>
                     <View style={{ justifyContent: 'flex-end', alignSelf: 'center' }}>
                        <NewCheckBox
                           checked={line.included}
                           onPress={() => {
                              line.unitPrice = 0.0
                              line.included = !line.included;
                              processLine(line)
                           }}
                        />
                     </View>
                  </View>

               </>)
            break;

         default:
            //TODO error
            //CLAUDE: an unknown unitType renders nothing and logs nothing (updateNetPrice will price it -3) - needs error annunciation
            break;
      }

   } //renderContent


   //renders the item name
   //if the item has been selected in the order, it is underlined and touchable to add instructions
   function renderName(line) {
      // we don't want to display camera icon for option items
      let isIncludedType = line.unitType == 'yesNo' || line.unitType == 'choice'
      return (
         <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <TouchableOpacity
               disabled={!line.included}
               style={{ width: '100%' }}
               onPress={line.included ? onLeftTouch : null}>
               <View style={{ flexDirection: 'row', flexShrink: .6, alignItems: 'center' }}>


                  {/* 202505 changed to navigate to new screen for remark and camera */}
                  <GCText detail >{prjPriceListItemName(line, useLongName)}</GCText>
                  {line.included && !isIncludedType ?
                     <PrjIcon style={{
                        position: 'absolute',
                        right: 130,
                        top: 0,
                        transform: [{ translateY: -9 }],
                        fontSize: 14,
                     }} id="CAMERA" /> : null}
               </View>
               <CdsMenuInfoIcon line={line} />
            </TouchableOpacity>
         </View>

      )
   } //renderName


   function renderInstructions(line) {
      if (line.included && line.remarks) {
         return (
            <View style={{ alignSelf: 'flex-start' }}>
               <GCText detail color={'grey'}>{line.remarks}</GCText>
            </View>
         )
         //else
         return (null)
      }
   } //renderInstructions


   function renderTextInput(line, initialValue, onChange) {
      return (
         <View style={styles.inputTile} >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', right: 10 }}>
               <TouchableOpacity
                  disabled={!line.included}
                  style={{ width: '100%' }}
                  onPress={onLeftTouch}>
                  <View style={{ flexShrink: 1 }}>
                     {/* 202505 changed to navigate to new screen for remark and camera */}
                     {initialValue ? <View style={{ flexDirection: 'row' }}>
                        <PrjIcon style={{ fontSize: 18, }} id="CAMERA" />
                        <GCText detail> {initialValue}</GCText></View> :
                        <GCText detail> {prjPriceListItemName(line)} </GCText>}
                  </View>
               </TouchableOpacity>
               <CmnTouchableEdit
                  specialEditBox
                  initial={initialValue}
                  titleText={prjPriceListItemName(line)}
                  onOkay={(newValue) => { onChange(newValue) }}
                  onCancel={() => { }}
                  onDelete={() => { onChange(null) }}
               >
                  {prjIconEditableBox()}
               </CmnTouchableEdit>
            </View>
            {/* <GCText detail light>{line.remarks}</GCText> */}
         </View>
      )
   } //renderTextInput


   function renderAdjInput(initialValue, onChange) {
      return (
         <View style={styles.inputTile} >
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>

               <CmnTouchablePrice
                  initial={initialValue}
                  onOkay={(newValue) => {
                     if (isValidAdj(newValue)) { onChange(newValue) }
                  }}
                  onCancel={() => { }}
               />
            </View>
         </View>
      )
   } //renderAdjInput


   //TODO localize weight formatting ... currently kg
   //NOTE all fields have '  ' at the end
   function renderUnitPrice(line) {
      const type = line.unitType
      const amt = line.unitPrice
      switch (type) {
         case 'pc':
            // return (cmnFormatAPrice(amt) + strX('cmn.b_each'))
            return (<GCText fit detail>{cmnFormatAPrice(amt) + strX('cmn.b_each')}  </GCText>)

         case 'kg':
            return (<GCText fit detail>{cmnFormatAPrice(amt) + strX('cmn.b_per_kg')}  </GCText>)
            break;

         //display the custom code if it is defined (in dict.Custom)
         //otherwise we say "Priced at shop"
         case 'spc':
            if (line.customPriceI18n) {
               // let tempArr=[]
               // tempArr.push(<GCText detail>{strX("dict.CustomPriceString." + line.customPriceI18n)}</GCText>)
               // tempArr.push(<PrjIcon id='I_IN_CIRCLE' style={{ fontSize: 20, marginBottom: -5 }} />)
               // return tempArr
               // return <GCText detail>{CstMenuPriceList.getCustomPricingString(line.customPriceI18n)} </GCText>
               return <GCText fit detail>{CstMenuPriceList.getCustomPricingString(line.customPriceI18n)} </GCText>
            }
            else {
               return (<GCText fit detail>{strX("cmn.CustomPriceAtShop")}  </GCText>)
            }
            break;
         case 'yesNo': //NOTE we will only be called if unitPrice is not null
            return (<GCText fit detail>{cmnFormatAPrice(amt)}  </GCText>)

         default:
            return (<GCText fit detail>'***  '</GCText>)

      }
   } //renderUnitPrice


   //a bit of a kludge .. if a line is marked as dontRender we just return a View with height 0

   if (line.dontRender) {
      return (<View style={{ height: 0 }} />)
   }

   return (

      // NOTE if a PC line is displayed because it is non-zero even if the category is collapsed
      // NOTE then it will stop displaying if it is decreased to zero
      // NOTE There was special handling required because we ended up trying to change
      // NOTE an unmounted component
      // <ListItem style={styles.listItemStyle}>
      <ListItem style={[styles.item, { backgroundColor: line.included ? COLORS.GC_SHADE_SELECTED : 'transparent' }]}>
         {/* <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 12, paddingBottom: 12, backgroundColor:'green' }}> */}
         <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center', paddingTop: ITEM_PADDING, paddingBottom: ITEM_PADDING,
            paddingLeft: GC_MIN_MARGIN,
         }}>
            {renderContent(line)}
         </View>
         {/* if the line is in the order then display some additional information  */}
         {renderInstructions(line)}
      </ListItem>

   )

} //end CdsMenuLineDisplay


//just like a price except it can be negative
function isValidAdj(priceAsString) {
   if (/^[+-]?[0-9]+[\.]?[0-9]*$/.test(priceAsString)) {
      return true
   }
   else {
      prjToast({ i18n: "cmn.alert.Please_enter_valid_price" })
      return false
   }
} //end isValidAdj


// NOT USED ANYMORE .... KEEP ... MAY NEED SOME DAY
// displayNetPrice = (netPrice) => {
//   if (netPrice == -1) {
//     return ("weighed at shop");
//   }
//   else if (netPrice == -2) {
//     return ("priced at shop");
//   }
//   else if (netPrice == -3) {
//     return ("invalid");
//   }
//   else {
//     return (cmnFormatAPrice(netPrice));

//   }
// }


//The net price of a line item depends on its unit type
//'pc' the net price is always defined by the count and unit price
//'kg' the weight my not have been entered .. we will set netPrice to -1 (awaiting shop weighing)
//'spc' if unitPrice is still zero .. we will set netPrice to -2 (awaiting shop pricing)
//any other code is invalid .. we will set netPrice to -3
//netPrice of -1 means not priced yet.
function updateNetPrice(line) {
   switch (line.unitType) {
      case 'pc':
         line.netPrice = line.unitPrice * line.count;
         break;

      case 'kg':
         if (line.weight == 0.0) {
            line.netPrice = -1;  //awaiting weighing
         }
         else {
            line.netPrice = line.weight * line.unitPrice;
         }
         break;

      case 'spc':
         if (line.unitPrice != 0.0) {
            line.netPrice = line.unitPrice; //has been priced by shop
         }
         else {
            line.netPrice = -2; //awaiting pricing by shop
         }
         break;

      case 'choice':
         line.netPrice = line.unitPrice;
         break;

      case 'EZcount':
         line.netPrice = 0;
         break;

      case 'EZnote':
      case 'shopNote':
         line.netPrice = 0;
         break;

      case 'adj':
         line.netPrice = line.unitPrice
         break;

      case 'yesNo':
         if ((line.unitPrice != null) && line.included) {
            line.netPrice = line.unitPrice
         } else {
            line.netPrice = 0.0
         }
         break;

      default: //invalid type
         line.netPrice = -3;
   }

} //end updateNetPrice


//prop checked
//prop onPress
//prop checkedStyle
//prop uncheckedStyle
//prop disabled
function NewCheckBox({ checked, onPress, disabled }) {
   // Move the switch aligh with Count button...orignal switch on and off position differently 
   // Align switch with plus and minus button
   // let flexEndAndroid = checked ? 15 : 30
   // let flexEndIOS = checked ? 10 : 10
   let flexEndAndroid = checked ? 15 : 0
   let flexEndIOS = checked ? 8 : 8
   return (
      // use left to move to the right because alignItem:'flex-end' doesn't do it
      // <View style={{ left: flexEnd }}>
      <View style={{ right: Platform.OS === 'ios' ? flexEndIOS : flexEndAndroid }}>
         <Switch
            // We can't apply any style to trackColor eg.shadow style 
            trackColor={{ false: COLORS.GC_SWITCH_DISABLE, true: COLORS.GC_ABS_WHITE }} //lighter 
            thumbColor={checked ? COLORS.GC_THEME_DARK : COLORS.GC_ABS_WHITE}
            onValueChange={(val) => {
               onPress(val)
            }}
            value={checked}
            style={{ transform: Platform.OS === 'ios' ? [{ scaleX: 1.25 }, { scaleY: 1.25 }] : [{ scaleX: 2.00 }, { scaleY: 1.75 }] }}
            disabled={disabled}
         />
      </View>

   )
} //end NewCheckBox


//gave up fiddling with react native, native base and other check boxes. Just did this

//prop checked
//prop onPress
//prop checkedStyle
//prop uncheckedStyle
//prop disabled
function OurCheckBox({ checked, onPress, checkedStyle, uncheckedStyle, disabled }) {
   if (checked) {
      return (
         <TouchableOpacity style={[checkboxStyles.checked, checkedStyle]}
            onPress={disabled ? null : onPress}
         >
            <PrjIcon color={COLORS.GC_CHECKBOX_OFF} id='CHECK' style={{ fontSize: 20 }} />
         </TouchableOpacity>
      )

   }
   else {
      return (
         <TouchableOpacity style={[checkboxStyles.unchecked, uncheckedStyle]}
            onPress={disabled ? null : onPress}
         >
         </TouchableOpacity>
      )

   }
} //end OurCheckBox


//prop value
//prop onChange(newValue)
function PlusMinus({ value, onChange }) {

   function handleMinus() {
      const newValue = Math.max(0, value - 1);
      onChange(newValue);
   }

   function handlePlus() {
      const newValue = value + 1;
      onChange(newValue);
   }

   const activeColor =
      value > 0
         ? COLORS.GC_PLUSMINUS_ON
         : COLORS.GC_PLUSMINUS_OFF;

   const textActiveColor =
      value > 0
         ? COLORS.GC_PLUSMINUS_TEXT_ON
         : COLORS.GC_PLUSMINUS_TEXT_OFF;

   const buttonSize = 36;

   return (
      // style reprecate InputSpinner style 
      <View
         style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 38,
            width: 100,
            borderWidth: 1,
            //CLAUDE: '#D0D0D0' and 'white' are hard-coded colours - should probably be COLORS constants
            borderColor: "#D0D0D0",
            borderRadius: 6,
            overflow: "hidden",
            backgroundColor: "white",
            borderRadius: buttonSize / 2,
            left: 10
         }}
      >
         {/* minus button */}
         <TouchableOpacity
            onPress={handleMinus}
            style={{
               width: buttonSize,
               height: buttonSize,
               borderRadius: buttonSize / 2,
               backgroundColor: activeColor,
               justifyContent: "center",
               alignItems: "center",
               marginLeft: 2,
            }}
         >
            <GCText style={{ color: textActiveColor, fontSize: 18, fontWeight: "600" }}>−</GCText>
         </TouchableOpacity>

         {/* value */}
         <View
            style={{
               flex: 1,
               height: "100%",
               justifyContent: "center",
               alignItems: "center",
               backgroundColor: COLORS.GC_PLUSMINUS_OFF,
               marginHorizontal: 4,
            }}
         >
            <GCText style={{ fontSize: 16 }}>{value}</GCText>
         </View>

         {/* Plus button */}
         <TouchableOpacity
            onPress={handlePlus}
            style={{
               width: buttonSize,
               height: buttonSize,
               borderRadius: buttonSize / 2,
               backgroundColor: activeColor,
               justifyContent: "center",
               alignItems: "center",
               marginRight: 2,
            }}
         >
            <GCText style={{ color: textActiveColor, fontSize: 18, fontWeight: "600" }}>+</GCText>
         </TouchableOpacity>
      </View>
   );
} //end PlusMinus


const styles = StyleSheet.create({

   item: {
      flexDirection: 'column',
      justifyContent: 'center',
      paddingLeft: 0,
   },
   modalSector: {
      width: 100,
      height: 'auto',
      padding: 10

   },
   overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // optional dim effect

   },
   selectStyle: {
      borderWidth: 1,
      borderColor: COLORS.GC_THEME_DARK,
      borderRadius: 10,
      width: 100,
      // padding: 10,
   },
   initValueTextStyle: {
      fontSize: 12,
      color: COLORS.GC_THEME_DARK,
   },
   selectTextStyle: {
      fontSize: 12,
      color: COLORS.GC_THEME_DARK,
   },
   inputTile: {
      justifyContent: 'center',
      width: '100%',
      height: 'auto',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 6,
      borderColor: COLORS.GC_TILE_BORDER,
      borderWidth: 1.5,
      backgroundColor: COLORS.GC_ABS_WHITE
   },
})

const checkboxStyles = StyleSheet.create({
   unchecked: {
      borderRadius: 20,
      height: 35,
      width: 35,
      backgroundColor: COLORS.GC_CHECKBOX_OFF,
      // SC thinks without shadow looks better
      // shadowColor: 'rgba(0, 0, 0, 0.1)',
      // shadowOpacity: .1,
      // elevation: 5,
      // shadowRadius: .8,
      borderWidth: 2,
      borderColor: COLORS.GC_CHECKBOX_BORDER

   },
   checked: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      height: 35,
      width: 35,
      backgroundColor: COLORS.GC_CHECKBOX_ON,
      // SC thinks without shadow looks better
      // shadowColor: 'rgba(0, 0, 0, 0.1)',
      // shadowOpacity: .1,
      // elevation: 5,
      // shadowRadius: .8,
      borderWidth: 2,
      borderColor: COLORS.GC_CHECKBOX_BORDER,


   },

})