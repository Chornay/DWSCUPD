import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, FlatList, TextInput } from 'react-native';

import GCHeader from 'DWcmn/GCHeader'
import { PrjSpacer } from 'DWcmn/Prj'
import { CdsScreen } from './CdsScreen';
import { CdsMenuLineDisplay } from './CdsMenuLineDisplay'
import { cdsMenuPricelistUpdateTotals } from './cdsMenuPricelistUpdateTotals'
import { prjPriceListItemStr } from 'DWcmn/PrjCmnFunctions'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'

//NOTE that we will NOT search EZ entries
//param priceList
export function CdsMenuSearchScreen() {

   const navigation = useNavigation()
   const { priceList = null, category = null } = useRoute().params ?? {}

   const [isInitialized, setIsInitialized] = useState(false)
   const [filteredTags, setFilteredTags] = useState([])
   const [queryText, setQueryText] = useState('')
   const refresh = useRefresh()

   const tagsRef = useRef([]) //whole priceList


   //one-time setup: load every item under the starting category (nav params)
   useEffect(() => {

      //recursively add every non-category entry under category to the tags
      function loadCategory(cat) {
         //CLAUDE: a category with null entries will throw here - needs protection/logging
         for (const entry of cat.entries) {
            if (entry.isCategory) {
               if (entry.type !== 'EZ') loadCategory(entry)
            }
            else {
               tagsRef.current.push({
                  key: entry.code,
                  category: cat.name,
                  name: prjPriceListItemStr(entry.name),
                  entry: entry
               })
            }
         }
      }

      tagsRef.current = []
      //CLAUDE: a null priceList throws on priceList.top - needs protection/logging
      //we start at the specified category or at the top
      const startingCategory = category ?? priceList.top
      loadCategory(startingCategory)
      setIsInitialized(true)
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup, as the class did in componentDidMount
   }, [])


   function handleSearch(text) {

      //too short to search .. don't leave results from an earlier query on screen
      if (text.length < 3) {
         setFilteredTags([])
         return
      }
      const result = tagsRef.current.filter(item => {
         if (item.name.toLowerCase().includes(text.toLowerCase())) console.log(item.name)
         return item.name.toLowerCase().includes(text.toLowerCase())
      }
      );
      setFilteredTags(result)
   } //handleSearch


   if (!isInitialized) { return null }
   return (
      <CdsScreen>
         <GCHeader titleI18n='cmnNEW.Search' back={() => { navigation.goBack() }} />
         <View style={{ flex: 1, marginHorizontal: 10 }}>
            <TextInput
               placeholder="Search..."
               value={queryText}
               onChangeText={(text) => { handleSearch(text); setQueryText(text) }}
               style={{
                  height: 40,
                  borderColor: 'gray',
                  borderWidth: 1,
                  paddingLeft: 8,
                  marginBottom: 10,
               }}
            />

            <PrjSpacer size={10} />
            <FlatList
               data={filteredTags}
               renderItem={({ item, index }) => {
                  return (
                     <CdsMenuLineDisplay
                        onLeftTouch={() => {
                           navigation.navigate('CdsMenuItemRemarkAndPhotoScreen', { 'line': item.entry })
                        }}
                        changedSomething={() => {
                           cdsMenuPricelistUpdateTotals(priceList);
                           refresh()
                        }}
                        line={item.entry} key={index}
                        useLongName></CdsMenuLineDisplay>)
               }}
            />
         </View>
      </CdsScreen>
   ); //end return

} //end CdsMenuSearchScreen
