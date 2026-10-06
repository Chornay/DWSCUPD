import React, { useState, useEffect } from 'react'
import { View } from 'react-native'


import { DrvScreen } from './CdsScreen';
import { PrjTabBar } from 'DWcmn/PrjTabBar'
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterForIcons, GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'


import firestore from '@react-native-firebase/firestore';
import { RouteActionEnum, RouteStatusEnum } from 'DWcmn/Global';


import DsViewRouteTabOrders from './DsViewRouteTabOrders'
import DrvViewRouteTabMap from './DrvViewRouteTabMap'
import DsViewRouteTabSummary from './DsViewRouteTabSummary'
import DrvSpinnerScreen from './DrvSpinnerScreen'
import DrvRouteSettingsModal from './DrvRouteSettingsModal'
import { dwdbfsOrderLoadSnapshots } from 'DWcmn/DWDBfs'
import { dwdbfsRouteLoadSingleSnapshot } from 'DWcmn/dwdbfsRoute'
import { drvGenerateRouteDetailActions, drvProcessRouteAction } from './drvRouteActionProcessing';
import { getIconCodeForAction } from 'DWcmn/PrjCmnFunctions'
import { prjRouteTimeFormatted } from 'DWcmn/PrjCmnFunctions'
import { cmnFilterOrders, cmnSortOrders } from 'DWcmn/CmnFunctionsFilterSort'
import { drvProcessRouteActionOnEvent } from './drvRouteActionProcessing'
import { DRV } from './DRV'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'

//20201023 removed action property
//20230628 use PrjTabBar
//20250207 move back arrow up

//nav param - routeDocId

export function DrvViewRoute() {

   const navigation = useNavigation()
   const { routeDocId = null } = useRoute().params ?? {}

   const [route, setRoute] = useState(null)
   const [orders, setOrders] = useState([])                        //array of all orders in route
   const [filteredOrders, setFilteredOrders] = useState([])                //array of only the orders to be displayed
   const [filterOrdersSetting, setFilterOrdersSetting] = useState('all')        //what orders do we want to see? -- all,pickup,delivery
   const [sortOrdersSetting, setSortOrdersSetting] = useState('name')           //how to sort the orders? -- TODO
   const [isSettingsVisible, setIsSettingsVisible] = useState(false)           //settings modal display flag
   const [waitingForRouteResult, setWaitingForRouteResult] = useState(true)
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
      setWaitingForRouteResult(false)
   } //end getRoute

   const getOrders = (querySnapshot) => {
      //get the orders from db
      let localOrders = dwdbfsOrderLoadSnapshots(querySnapshot)
      setOrders(localOrders)

      //update the filtered (and sorted) array
      let localFilteredOrders = cmnFilterOrders(filterOrdersSetting, localOrders)
      cmnSortOrders(sortOrdersSetting, localFilteredOrders)
      setFilteredOrders(localFilteredOrders)
   } //end getOrders

   useEffect(() => {
      //ASSERT routeDocId != null

      let unsubscribeRoute
      let unsubscribeOrders
      try {
         // get the route
         unsubscribeRoute = firestore().collectionGroup("Routes").where("docId", "==", routeDocId)
            .onSnapshot(getRoute, error => { prjCloudLogError('DrvViewRoute route listener', error, {toastI18n:"cmnNEW.MsgSnapshotError"}) });
         // find all the orders for this route
         unsubscribeOrders = firestore().collection("Orders").where("routesArray", "array-contains", routeDocId)
            .onSnapshot(getOrders, error => { prjCloudLogError('DrvViewRoute orders listener', error, {toastI18n:"cmnNEW.MsgSnapshotError"}) });
         //TODO not sorted??
      }
      catch (error) {
         prjCloudLogError('DrvViewRoute listener setup', error)
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
   if (waitingForRouteResult) {
      return (
         <DrvSpinnerScreen />
      );
   } //end if 

   const readonly = route.status != RouteStatusEnum.open //Driver can only change when 'owns' the route.
   //TODO what should be readonly next ... we need to be able to open the route...
   const actions = drvGenerateRouteDetailActions(DRV.getId(), route)

   return (
      <DrvScreen>
         <DrvRouteSettingsModal isVisible={isSettingsVisible}
            onDone={() => { setIsSettingsVisible(false) }}
            onSet={(x) => {
               if (x.filterOrdersSetting !== undefined) { setFilterOrdersSetting(x.filterOrdersSetting) }
               if (x.sortOrdersSetting !== undefined) { setSortOrdersSetting(x.sortOrdersSetting) }
               if (x.isSettingsVisible !== undefined) { setIsSettingsVisible(x.isSettingsVisible) }
            }}
         />
         {(action == RouteActionEnum.noop) ? null :
            drvProcessRouteAction(DRV.getId(), route, orders, action,
               () => { setAction(RouteActionEnum.noop) })}
         {/* HEADER SECTION */}
         <GCHeader back titleText={prjRouteTimeFormatted(route)}
            optionsBurger={() => navigation.navigate('CdsShopBoundaries', { 'shopId': route.shopId })}

      // optionsBurger={() => setIsSettingsVisible(true)}
            />
         {/* <View style={{height:10}}/> */}
         {/* DATA SECTION (LIST OR MAP) */}
         <View style={{ flex: 1 }}>
            <PrjTabBar fields={tabFields}
               selectedTab={selectedTab}
               onPress={(index) => setSelectedTab(index)} />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
               {selectedTab == 0 && <DsViewRouteTabOrders orders={filteredOrders} readonly={readonly} />}
               {selectedTab == 1 && <DrvViewRouteTabMap orders={filteredOrders} />}
               {selectedTab == 2 && <DsViewRouteTabSummary route={route} orders={filteredOrders} />}
            </View>
         </View>

         <GCFooterForIcons>
            {actions.map((act, index) =>
               <GCFooterCmdIcon
                  key={index}
                  code={getIconCodeForAction(act)}

                  onPress={() => {

                     if (!drvProcessRouteActionOnEvent(navigation, DRV.getId(), route, filteredOrders, act)) {
                        setAction(act)
                     }
                  }}
               />
            )}
         </GCFooterForIcons>

      </DrvScreen >
   )
} //end DrvViewRoute