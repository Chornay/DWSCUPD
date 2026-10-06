import React, { useState, useEffect } from 'react'
import { View } from 'react-native'


import { ShpScreen } from './CdsScreen';
import { PrjTabBar } from 'DWcmn/PrjTabBar'
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterForIcons, GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import { dwdbfsOrderLoadSnapshots } from 'DWcmn/DWDBfs'
import { dwdbfsRouteLoadSingleSnapshot } from 'DWcmn/dwdbfsRoute'


import firestore from '@react-native-firebase/firestore';
import { RouteActionEnum, RouteStatusEnum } from 'DWcmn/Global';
import DsViewRouteTabOrders from './DsViewRouteTabOrders'
import ShpViewRouteTabMap from './ShpViewRouteTabMap'
import DsViewRouteTabSummary from './DsViewRouteTabSummary'
import ShpSpinnerScreen from './ShpSpinnerScreen'
import { getIconCodeForAction } from 'DWcmn/PrjCmnFunctions'
import { prjRouteTimeFormatted } from 'DWcmn/PrjCmnFunctions'

import { shpGenerateRouteDetailActions, shpProcessRouteAction } from './shpRouteActionProcessing'
import { cmnFilterOrders } from 'DWcmn/CmnFunctionsFilterSort'
import ShpRouteSettingsModal from './ShpRouteSettingsModal'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'

//20250207 moved back key up
//20250207 removed masses of commented code and compared to Drv
//20250308 change to use the routes collectionGroup on docId

//nav param - routeDocId
export function ShpViewRoute() {

   const navigation = useNavigation()
   const { routeDocId = null } = useRoute().params ?? {}

   const [route, setRoute] = useState(null)
   const [orders, setOrders] = useState([])                        //array of all orders in route
   const [filteredOrders, setFilteredOrders] = useState([])                //array of only the orders to be displayed
   const [filterOrdersSetting, setFilterOrdersSetting] = useState('all')        //what orders do we want to see? -- all,pickup,delivery
   const [sortOrdersSetting, setSortOrdersSetting] = useState('name')           //how to sort the orders? -- TODO
   const [isSettingsVisible, setIsSettingsVisible] = useState(false)           //settings modal display flag
   const [waitingForDataInitialization, setwaitingForDataInitialization] = useState(true)
   const [action, setAction] = useState(RouteActionEnum.noop)
   const [selectedTab, setSelectedTab] = useState(0)

   const tabFields = [
      { key: 0, i18n: 'cmn.LIST' },
      { key: 1, i18n: 'cmn.MAP' },
      { key: 2, i18n: 'cmn.SUMMARY' },
   ]

   const getRoute = (querySnapshot) => {
      let localRoute = dwdbfsRouteLoadSingleSnapshot(querySnapshot.docs[0])
      setRoute(localRoute)
      setwaitingForDataInitialization(false)
   } //end getRoute

   const getOrders = (querySnapshot) => {
      //get the orders from db
      let localOrders = dwdbfsOrderLoadSnapshots(querySnapshot)
      setOrders(localOrders)

      //update the filtered (and sorted) array
      let localFilteredOrders = cmnFilterOrders(filterOrdersSetting, localOrders)
      // TODO example cmnSortOrders(sortOrdersSetting, localFilteredOrders)
      setFilteredOrders(localFilteredOrders)
   } //end getOrders

   useEffect(() => {
      //ASSERT routeDocId != null

      let unsubscribeRoute
      let unsubscribeOrders
      try {
         // get the route
         unsubscribeRoute = firestore().collectionGroup("Routes").where("docId", "==", routeDocId)
            .onSnapshot(getRoute, error => { prjCloudLogError('ShpViewRoute route listener', error,
               {toastI18n:"cmnNEW.MsgSnapshotError"}) });
         // find all the orders for this route
         unsubscribeOrders = firestore().collection("Orders").where("routesArray", "array-contains", routeDocId)
            .onSnapshot(getOrders, error => { prjCloudLogError('ShpViewRoute orders listener', error,
               {toastI18n:"cmnNEW.MsgSnapshotError"}) });
         //TODO not sorted??
      }
      catch (error) {
         prjCloudLogError('ShpViewRoute listener setup', error)
      }

      //TODO disable back handler?

      return () => {
         unsubscribeRoute && unsubscribeRoute();
         unsubscribeOrders && unsubscribeOrders();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, mirrors original componentDidMount/componentWillUnmount
   }, [])
   //we are not done until we have our first DB results
   //TODO do we really want to wait here for the DB ... or display empty columns with the spinner?
   if (waitingForDataInitialization) {
      return (
         <ShpSpinnerScreen />
      );
   } //end if 

   const readonly = false; //TODO do we want this flag?
   const actions = shpGenerateRouteDetailActions(route.status)

   return (
      <ShpScreen>
         <ShpRouteSettingsModal isVisible={isSettingsVisible}
            onDone={() => { setIsSettingsVisible(false) }}
            onSet={(x) => {
               if (x.filterOrdersSetting !== undefined) { setFilterOrdersSetting(x.filterOrdersSetting) }
               if (x.sortOrdersSetting !== undefined) { setSortOrdersSetting(x.sortOrdersSetting) }
               if (x.isSettingsVisible !== undefined) { setIsSettingsVisible(x.isSettingsVisible) }
            }}
         />
         {(action != RouteActionEnum.noop) &&
            shpProcessRouteAction(route, orders, action,
               () => { setAction(RouteActionEnum.noop) })}
         {/* HEADER SECTION */}
         <GCHeader back titleText={prjRouteTimeFormatted(route)}
            optionsBurger={() => setIsSettingsVisible(true)}
         />
         {/* <View style={{height:10}}/> */}
         {/* DATA SECTION (LIST OR MAP) */}
         <View style={{ flex: 1 }}>
            <PrjTabBar fields={tabFields}
               selectedTab={selectedTab}
               onPress={(index) => setSelectedTab(index)} />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
               {selectedTab == 0 && <DsViewRouteTabOrders orders={filteredOrders} />}
               {selectedTab == 1 && <ShpViewRouteTabMap orders={filteredOrders} />}
               {selectedTab == 2 && <DsViewRouteTabSummary route={route} orders={filteredOrders} />}
            </View>
         </View>

         {/* FOOTER SECTION  contains any action buttons for the current status */}
         <GCFooterForIcons>
            {actions.map((act, index) =>
               <GCFooterCmdIcon
                  key={index}
                  code={getIconCodeForAction(act)}

                  onPress={() => {

                     //   if (cstCmnProcessImmmediateAction(navigation, order, act)){
                     //     // setAction(OrderActionEnum.noop) //nothing further to do
                     //  }
                     //  else {setAction(act) }} //handle command in modal
                     // }
                     setAction(act)
                  }} //handle command in modal
               />
            )}
         </GCFooterForIcons>

      </ShpScreen >

   )
} //end ShpViewRoute