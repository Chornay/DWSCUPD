import React from 'react'
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native'
import { withNavigation } from 'react-navigation';

import { ListItem, Left, Body, Right } from 'native-base';

import { COLORS } from 'DWcmn/Global';
import GLOBALS from 'DWcmn/Global';
import { PrjIcon } from 'DWcmn/PrjIconComponents';
import { GCText } from 'DWcmn/Gc'
import { prjPriceListItemStr } from 'DWcmn/PrjCmnFunctions'
import { CdsMenuLineDisplay } from './CdsMenuLineDisplay'
import { cdsMenuGetThumbnail } from './cdsMenuGetThumbnail'
import { cstPriceListCatNameInLine } from './CstMenuPriceList'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { GC_STD_MARGIN, GC_MIN_MARGIN } from 'DWcmn/Global'
import { useRefresh } from 'DWcmn/prjUseRefresh'

//20211001 new remarks components
//2022122 removed lots of commented and unused code and unused styles
//20230213 add resizeMode=contain
//20230507 removed itemDivider property from category line (no shading)
//20260919 converted to functional component

//This component displays a category name on a line AND
//  all its included items (which may include other categories)
//prop category
//prop countChanged()
//prop navigation
//prop priceList .... just to pass to CdsMenuCategoryScreen if necessary
//prop isTop true iff this screen is displaying on a new screen 'level'
export function CdsMenuCategory({ category, countChanged, navigation, priceList, isTop }) {

   const refresh = useRefresh()

   //if any changes are made in PriceList you must call refresh() to redisplay
   const stylingIfIncluded = category.included ? styles.included : null

   //a line item (or a child category) changed something .. redisplay and let our owner know
   function toggle() {
      refresh()
      countChanged()
   } //toggle


   function renderIcon(cat) {

      //if selecting this category will go to a new screen then we display a square (like a screen, get it?)
      //  and if there are elements in the category that are in the order then we fill in the square
      if (cat.isNewScreen) {
         return <PrjIcon id='SCREEN' style={{ fontSize: 28 }} />
      }
      else {
         return <PrjIcon id={cat.expanded ? "KEY_ARROW_UP_BOLD" : "KEY_ARROW_DOWN_BOLD"} />
      }
      // if (cat.isNewScreen) {
      //    if (cat.included) {
      //       return <View style={iconStyles.checked}>
      //          <PrjIcon id='CHECK' style={{ fontSize: 20 }} />
      //       </View>
      //    }
      //    else {
      //       return <View style={iconStyles.unchecked} />
      //    }
      // }
      // else {
      //    let icon
      //    if (cat.included) {
      //       icon = cat.expanded ? "KEY_ARROW_UP_BOLD" : "KEY_ARROW_DOWN_BOLD"
      //    }
      //    else {
      //       icon = (cat.expanded ? "KEY_ARROW_UP" : "KEY_ARROW_DOWN")
      //    }
      //    return <PrjIcon id={icon} />
      // }
   } //renderIcon


   return (
      <View style={{}}>
         {/* Category Header Line */}
         {isTop || <ListItem button thumbnail style={stylingIfIncluded}
            onPress={() => {
               if (category.isNewScreen) {
                  navigation.push("CdsMenuCategoryScreen", { 'category': category, 'priceList': priceList })
               }
               else {
                  category.expanded = !category.expanded
                  refresh()
               }
            }}>

            {/* only 'real' categories will have associated thumbnails */}
            {(!category.isPseudoItem) &&
               <Left>
                  <Image source={cdsMenuGetThumbnail(category.thumbnail)} style={styles.thumbnailImage} />
               </Left>
            }

            <Body>
               <View style={{ height: 30, justifyContent: 'center' }}>
                  {cstPriceListCatNameInLine(category)}
               </View>
            </Body>

            <Right>
               <View style={{ marginRight: GC_MIN_MARGIN }}>
                  {renderIcon(category)}
               </View>
               {/* <PrjIcon id={icon} /> */}
            </Right>
         </ListItem>
         }

         {/* Line Items for the category if it is expanded (or isTop .. 'owns' this screen) */}
         {/* Items will display if the category is expanded. */}
         {/* The line display component lets us know when a change is made .. we call refresh() */}
         {/* 20260919 the class version passed 'extradata' (wrong case) to FlatList so it was ignored .. removed */}
         {(isTop || category.expanded || category.included) ?
            <FlatList
               removeClippedSubviews={false} //added 20250610 .. TextInput modals were disappearing
               // keyExtractor={(item, index) => item.code} //20220320
               data={category.entries}
               renderItem={({ item }) => {
                  if (isTop || category.expanded) { // used to have || item.included
                     return (<View style={{ flex: 1 }}>
                        {
                           (item.isCategory) ?
                              <CdsMenuCategory countChanged={toggle}
                                 navigation={navigation}
                                 priceList={priceList}
                                 category={item} /> :
                              <CdsMenuLineDisplay
                                 changedSomething={toggle} line={item}
                                 onLeftTouch={() => { navigation.navigate('CdsMenuItemRemarkAndPhotoScreen', { 'line': item }) }}
                              />
                        }
                     </View>)
                  }
                  else {
                     return null
                  }
               }}
            />
            : null}
      </View>
   )
} //end CdsMenuCategory

const styles = StyleSheet.create({
   included: {
      backgroundColor: COLORS.GC_HIGHLIGHT_SELECTED
   },
   thumbnailImage: {
      // width: 28,
      // height: 28,
      width: 36,
      height: 36,
      borderRadius: 0,
      resizeMode: 'cover',
      // resizeMode:"contain"
   }
})
// const iconStyles = StyleSheet.create({
//    unchecked: {
//       height: 25,
//       width: 25,
//       backgroundColor: COLORS.GC_CHECKBOX_OFF,
//       // SC thinks without shadow looks better
//       // shadowColor: 'rgba(0, 0, 0, 0.1)',
//       // shadowOpacity: .1,
//       // elevation: 5,
//       // shadowRadius: .8,
//       borderWidth: 2,
//       borderColor: COLORS.GC_CHECKBOX_BORDER
//    },
//    checked: {
//       alignItems: 'center',
//       justifyContent: 'center',
//       height: 25,
//       width: 25,
//       backgroundColor: COLORS.GC_CHECKBOX_ON,
//       // SC thinks without shadow looks better
//       // shadowColor: 'rgba(0, 0, 0, 0.1)',
//       // shadowOpacity: .1,
//       // elevation: 5,
//       // shadowRadius: .8,
//       borderWidth: 2,
//       borderColor: COLORS.GC_CHECKBOX_BORDER,
//    },
//    included: {
//       backgroundColor:COLORS.GC_HIGHLIGHT_SELECTED
//    }
// })