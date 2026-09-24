import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, FlatList, TouchableOpacity, Dimensions, Image } from 'react-native'

import { cdsMenuGetThumbnail } from './cdsMenuGetThumbnail'
import { withNavigation } from 'react-navigation'
import { GCText } from 'DWcmn/Gc'
import { COLORS } from 'DWcmn/Global'
import { prjPriceListItemStr } from 'DWcmn/PrjCmnFunctions'
import { CdsMenuInfoIcon } from './CdsMenuInfoIcon'
//20230213 add resizeMode = contain to thumbnail
//20230505 moved ? icon to top right corner
//20230507 highlight inluded tiles
//20260919 converted to functional components

const { width: SCREEN_WIDTH } = Dimensions.get('window') || {};
const { height: SCREEN_HEIGHT } = Dimensions.get('window') || {};


//prop priceList
//prop category
function CdsMenuCategoryTiled({ category, priceList, navigation }) {

   const [isComponentInitialized, setIsComponentInitialized] = useState(false)

   const columnsRef = useRef(null)
   const heightRef = useRef(null)
   const widthRef = useRef(null)


   //lets decide how big to make the tiles.
   //we are just going to do a simple calculation based on the screen size NOT our parent container
   //a one shot calculation when we are mounted
   //NOTE we could actually use onLayout to find out the actual size but meh
   useEffect(() => {
      const smallest = (Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) - 40) * .95 //knock off some for padded edges
      //CLAUDE: columns is 0 on a very narrow screen, which makes height a division by zero - needs a floor of 1
      columnsRef.current = Math.floor(smallest / 150.)
      heightRef.current = smallest / columnsRef.current
      widthRef.current = heightRef.current
      setIsComponentInitialized(true)
   }, [])


   if (!isComponentInitialized) { //not finished our preparation yet
      return (null)
   }


   return (
      <FlatList
         numColumns={columnsRef.current}
         data={category.entries}
         keyExtractor={(item, index) => index.toString()}
         renderItem={({ item }) => {
            return (
               <CategoryTile key={item.key.toString()}
                  height={heightRef.current} width={widthRef.current}
                  category={item}
                  onPress={() => {
                     navigation.push("CdsMenuCategoryScreen", { 'category': item, 'priceList': priceList })
                  }} />
            )
         }}
      />

   );
} //end CdsMenuCategoryTiled


//prop category
//prop height,width
//prop onPress
//NOTE that we display the category thumbnail as an image because we can size it the way we want.
function CategoryTile({ category, height, width, onPress }) {

   //categories with items selected will be highlighted
   const includedStyle = category.included ? styles.included : null

   return (
      <TouchableOpacity
         style={[styles.tileStyle, includedStyle,
         { height: height, width: width }]}
         onPress={onPress}
      >
         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Image
               style={{ flex: 1, width: '100%' }}
               resizeMode="contain"
               source={cdsMenuGetThumbnail(category.thumbnail)}
            />
         </View>

         <View style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}>
            <GCText fit title bold>
               {prjPriceListItemStr(category.name).toUpperCase()}
            </GCText>
         </View>
         <View style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', alignItems: 'flex-end' }}>
            <View style={{ marginTop: 10, marginRight: 10 }}><CdsMenuInfoIcon line={category} size={30} /></View>
         </View>

      </TouchableOpacity>
   )
} //end CategoryTile


export default withNavigation(CdsMenuCategoryTiled)

const styles = StyleSheet.create({
   tileStyle: {
      flexDirection: 'column',
      //height and width are now determined in the component
      // width: (SCREEN_WIDTH * .95) / 2,
      // height: (SCREEN_HEIGHT * .95) / 3.5,
      // backgroundColor: '#ffff',
      // borderColor: '#818182',
      // borderWidth: .5,
      backgroundColor: '#FCFCFC',
      borderWidth: .5,
      borderColor: '#DADADA',
      marginTop: 10,
      paddingHorizontal: 5,
      paddingVertical: 10,
      borderRadius: 16,
      marginBottom: 10,
      marginLeft: 10,
      marginRight: 10,
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOpacity: .5,
      elevation: 4,
   },
   included: {
      backgroundColor: COLORS.GC_HIGHLIGHT_SELECTED
   }
})