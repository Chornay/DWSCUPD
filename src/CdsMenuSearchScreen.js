import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, FlatList, TextInput } from 'react-native';

import GCHeader from 'DWcmn/GCHeader'
import { PrjSpacer } from 'DWcmn/Prj'
import { CdsScreen } from './CdsScreen';
import { CdsMenuLineDisplay } from './CdsMenuLineDisplay'
import { cdsMenuPricelistUpdateTotals } from './cdsMenuPricelistUpdateTotals'
import { prjPriceListItemStr } from 'DWcmn/PrjCmnFunctions'
import { useRefresh } from 'DWcmn/prjUseRefresh'

//param priceList
export default function CdsMenuSearchScreen({ navigation }) {

   const [isInitialized, setIsInitialized] = useState(false)
   const [filteredTags, setFilteredTags] = useState([])
   const [queryText, setQueryText] = useState('')
   const refresh = useRefresh()

   const tagsRef = useRef([]) //whole priceList
   const priceListRef = useRef(null)


   //one-time setup: pull the priceList from nav params and load every item under the starting category
   useEffect(() => {

      //recursively add every non-category entry under category to the tags
      function loadCategory(category) {
         //CLAUDE: a category with null entries will throw here - needs protection/logging
         for (const entry of category.entries) {
            if (entry.isCategory) { loadCategory(entry) }
            else {
               tagsRef.current.push({
                  key: entry.code,
                  category: category.name,
                  name: prjPriceListItemStr(entry.name),
                  entry: entry
               })
            }
         }
      }

      tagsRef.current = []
      priceListRef.current = navigation.getParam('priceList', null);
      //CLAUDE: a null priceList throws on priceList.top - needs protection/logging
      //we start at the specified category or at the top
      const startingCategory = navigation.getParam('category', priceListRef.current.top);
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
                           console.log('Left touch!')
                           navigation.navigate('CdsMenuItemRemarkAndPhotoScreen', { 'line': item.entry })
                        }}
                        changedSomething={() => {
                           console.log('Right touch!')
                           cdsMenuPricelistUpdateTotals(priceListRef.current);
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


const styles = StyleSheet.create({
})
// import React, { useState } from 'react';
// import { View, TextInput, FlatList, Text } from 'react-native';

// const data = [
//   'Apple',
//   'Banana',
//   'Blueberry',
//   'Grapes',
//   'Orange',
//   'Pineapple',
//   'Strawberry',
// ];

// export default function SearchExample() {
//   const [query, setQuery] = useState('');
//   const [filteredData, setFilteredData] = useState(data);

//   const handleSearch = (text) => {
//     setQuery(text);
//     const result = data.filter(item =>
//       item.toLowerCase().startsWith(text.toLowerCase())
//     );
//     setFilteredData(result);
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <TextInput
//         placeholder="Search..."
//         value={query}
//         onChangeText={handleSearch}
//         style={{
//           height: 40,
//           borderColor: 'gray',
//           borderWidth: 1,
//           paddingLeft: 8,
//           marginBottom: 10,
//         }}
//       />

//       <FlatList
//         data={filteredData}
//         keyExtractor={(item, index) => item + index}
//         renderItem={({ item }) => <Text style={{ padding: 5 }}>{item}</Text>}
//       />
//     </View>
//   );
// }