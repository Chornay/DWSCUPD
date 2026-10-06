import React, { useState } from 'react'
import { TouchableOpacity, FlatList } from 'react-native'
import { View } from 'react-native'
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import { CmnTouchableEdit } from 'DWcmn/CmnTouchableEdit'
import { CdsScreen } from './CdsScreen';
import { GCText, GCI18n } from 'DWcmn/Gc'
import GCHeader from 'DWcmn/GCHeader'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { COLORS } from 'DWcmn/Global'
import { PRJ_STYLES } from 'DWcmn/PrjStyles'
import { PrjSpacer } from 'DWcmn/Prj'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { isBlank } from 'DWcmn/PrjCmnFunctions'
import RadioButton from 'react-native-simple-radio-button-input';
import { strX } from 'DWcmn/I18n';
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { ListItemGBC, ListItemRight, ListItemBody, ListItemLeft } from 'DWcmn/PrjNativeBase'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'

//20250712 changed the customer display to give more detail

const MODES = {
   MAIN: 0,
   DISPLAY_RESULTS: 10,
}

const WHAT_TO_SEARCH = [
   "Orders",
   "Customers",
   "Routes"
]

//TODO implement Route search
//key is the table name, value is an array of available keys 
const HOW_TO_SEARCH = {
   "Orders": ["name", "id", "phoneNumber", "address"],
   "Customers": ["address", "phoneNumber", "name", "id"],
   // "Routes": ["pickup", "delivery"]
}

//want to translate the key (or table) name to something displayable
const DISPLAYABLE = {
   "address": "cmn.Address",
   "Customers": "cmnNEW.Customer",
   "delivery": "Delivery",
   "id": "cmnNEW.Id",
   "name": "cmn.Name",
   "Orders": "cmnNEW.Order",
   "phoneNumber": "cmn.Phone",
   "pickup": "Pickup",
   "Routes": "cmnNEW.Route",
}

const cnvText = (code) => {
   return strX(DISPLAYABLE[code])
}

//you can navigate here
//OR if you just display component you should pass 
//1. an onBack method  eg onBack={()=>{setMode(MAIN)}}
export function DsSearch({ onBack }) {

   const navigation = useNavigation()

   const [isSearchingInProgress, setIsSearchingInProgress] = useState(false)
   const [mode, setMode] = useState(MODES.MAIN)
   const [results, setResults] = useState([]) //results of the query .. could be from any of the tables.
   const [whatToSearch, setWhatToSearch] = useState('Orders') //the 'table' to search, orders/customers/routes

   //user selects whether they want to look at Orders, Customers or Routes
   const renderWhatToSearch = () => {
      return (
         <View style={{ paddingHorizontal: 20 }} >
            <GCText>Select an option</GCText>
            <PrjSpacer size={20} />
            {/* Map and display the selection of options*/}
            {WHAT_TO_SEARCH.map((table) => (
               // flexDirection row or formHorizontal={true}  doesn't work for some reasons
               <View key={table} style={styles.radioButton}>
                  <RadioButton
                     color={COLORS.GC_THEME_DARK}
                     selected={whatToSearch == table}
                     onPress={() => { setWhatToSearch(table) }}
                  />
                  <View style={{ paddingLeft: 10 }}>
                     <GCText color={COLORS.GC_TEXT_GREY}> {cnvText(table)} </GCText>
                  </View>
               </View>
            ))}
         </View>
      )
   } //end renderWhatToSearch

   //user presses how they want to look up the chosen category 
   //  the TouchableEdit calls doSearch
   const renderHowToSearch = () => {
      return (
         <View>
            <View style={{ paddingHorizontal: 20 }}>
               {/* Selection of search key...etc Name, ID, Phone, Address... */}
               <GCText>Select a search key</GCText>
               <FlatList
                  data={HOW_TO_SEARCH[whatToSearch]}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => {
                     return (
                        <View style={{ paddingLeft: 10 }}>
                           <CmnTouchableEdit
                           titleText={"Enter " +cnvText(item)}
                           onCancel={()=>{}}
                           onOkay={(keyValue)=>{
                              doSearch(item,keyValue)
                           }}
                           >
                              <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                                 <GCText color={COLORS.GC_TEXT_GREY}>{cnvText(item)}</GCText>
                              </View>

                           </CmnTouchableEdit>

                        </View>
                     )
                  }} />
            </View>
         </View>
      )
   } //end renderHowToSearch

      const renderCustomerItem = (cust) => {
      return (
         <TouchableOpacity
         // onPress={() => { navigation.navigate('OrderDetail', { 'id': order.id, }) }}
         >
            <View style={styles.searchTileContent}>
               <PrjSpacer size={10} />
        {formLine('cmn.Name', cust.name)}
        {formLine('cmnNEW.Id', cust.id)}
        {formLine('cmn.Address', cust.address)}
        {formLine('cmn.Phone', cust.phoneNumber)}
            </View>
         </TouchableOpacity>
      )
   } //end renderCustomerItem

   //copied from CmnIdList
  // left - an i18n tag for the name of the field to be displayed
  // right - the value of the field
  // styled - true iff the 'right' field is already styled
  function formLine(left, right, styled = false) {
    const COL1 = .3
    const COL2 = .7
    return (
      <View>
        <ListItemGBC style={{ marginLeft: 0 }}>
          <View style={{ flex: COL1 }}><GCI18n code={left} /></View>
          {(styled) ? <View style={{ flex: COL2 }}>{right}</View> :
            <View style={{ flex: COL2 }}><GCText>{right}</GCText></View>}
        </ListItemGBC>
      </View>)
  }

   const renderOrderItem = (order) => {
      return (
         <TouchableOpacity
            onPress={() => { navigation.navigate('OrderDetail', { 'id': order.id, }) }}
         >
            <View style={styles.searchTileContent}>
               <PrjSpacer size={10} />
               {/* Order id and date */}
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                  <View style={{ flexDirection: 'column' }}>
                     <GCText title >Order ID</GCText>
                     <GCText details color={COLORS.GC_TEXT_GREY}>{order.id}</GCText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                     <GCText title >Name</GCText>
                     <GCText details color={COLORS.GC_TEXT_GREY}>{order.name}</GCText>
                  </View>
               </View>
               <PrjSpacer size={10} />
               {/* Name and Phone number */}
               <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                  <View style={{ flexDirection: 'column' }}>
                     {/* what address do we want to display here? */}
                     <GCText title >Address</GCText>
                     <GCText details color={COLORS.GC_TEXT_GREY}>{order.pickupStop.code}</GCText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                     <GCText title>Phone Number</GCText>
                     <GCText details color={COLORS.GC_TEXT_GREY}>{order.phoneNumber}</GCText>
                  </View>
               </View>
               <PrjSpacer size={10} />
            </View>
         </TouchableOpacity>
      )
   } //end renderOrderItem

   const doSearch = async (key, keyValue) => {

      //if not value specified, we just return
      if (isBlank(keyValue)) {
         return
      }
      let newResults = []

      setIsSearchingInProgress(true)
      try {
         switch (whatToSearch) {
            //for orders and customers we have the table name and key name for lookup
            case 'Orders':
            case 'Customers':
               let queryResult = await firestore().collection(whatToSearch)
               .where(key, ">=", keyValue)
               .where(key, "<=", keyValue+'z')
               .get()
               queryResult.forEach((doc) => {
                  const foo = doc.data()
                  newResults.push(foo)
               })
               setResults(newResults)
               setMode(MODES.DISPLAY_RESULTS)
               break;
            //CLAUDE: dead case - whatToSearch can only ever be 'Orders', 'Customers' or 'Route' (per
            //WHAT_TO_SEARCH above), never 'Routes' (plural). This case, and the matching one in the
            //DISPLAY_RESULTS renderItem switch below, can never be reached as written. Also note
            //HOW_TO_SEARCH has no 'Route' entry either, so selecting Route currently dead-ends at
            //renderHowToSearch with an empty key list - Route search isn't actually wired up yet,
            //matching the "TODO implement Route search" comment above.
            case 'Routes':
               break;
            default:
               prjAlert('Invalid table specified in search')
               break;
         }
      }
      catch (error) {
         prjCloudLogError('DsSearch doSearch', error)
      }
      setIsSearchingInProgress(false)

   } //end doSearch

   switch (mode) {

      case MODES.MAIN:
         //NOTE that if there is no onBack we want to set back prop to true to get default behaviour
         return (

            <CdsScreen>
               <GCHeader back={onBack||true} titleText='Search' />
               {isSearchingInProgress && <PrjBusyMask />}
               {renderWhatToSearch()}
               <PrjSpacer size={40} />
               {renderHowToSearch()}
            </CdsScreen>
         )
         break;

      case MODES.DISPLAY_RESULTS:
         //display the contents of the results[] state variable (depending on whatToSearch)
         return (
            <CdsScreen>
               <GCHeader
                  back={() => setMode(MODES.MAIN)}
                  titleText='Results'
               />
               <View style={{ flex: 1, marginHorizontal: GC_STD_MARGIN }}>
                  {results.length == 0 ?
                     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><GCText>No result found ...</GCText></View> :
                     <FlatList
                        data={results}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => {
                           switch (whatToSearch) {
                              case 'Customers':
                                 return (
                                    <View>{renderCustomerItem(item)}</View>
                                 )
                                 break;
                              case 'Orders':
                                 return (
                                    <View>{renderOrderItem(item)}</View>
                                 )
                                 break;
                              case 'Routes':
                                 return (
                                    <View><GCText>Route</GCText></View>
                                 )
                                 break;
                           }
                        }} />
                  }
               </View>
            </CdsScreen>
         )
         break;
      default:
         prjAlert('Invalid mode ' + mode + ' in search')
         return null
         break;

   }//end switch

} //end DsSearch


const styles = {
   searchTileContent: {
      flex: 1,
      flexDirection: 'column',
      paddingHorizontal: 20,
      paddingVertical: 10
   },
   radioButton: {
      flexDirection: 'row',
      marginBottom: 15,
      paddingHorizontal: 20
   },
   textShadow: {
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: -1, height: 0 },
      textShadowRadius: 3.05, elevation: 4,
   }

}