import React, { useState, useEffect, useRef } from 'react'
import { View, FlatList } from 'react-native'


import DrvSpinnerScreen from './DrvSpinnerScreen'
import firestore from '@react-native-firebase/firestore';
import moment from 'moment'
import { dwdbfsRouteLoadSnapshots } from 'DWcmn/DWDBfs'
import DsRouteTile from './DsRouteTile'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import DsViewOtherRoutes from './DsViewOtherRoutes';

import { DrvScreen } from './CdsScreen'
import GCHeader from 'DWcmn/GCHeader'
import { DRV } from './DRV'
import { DS } from './DS'
import { GCI18n } from 'DWcmn/Gc'
import { GCFooterForIcons, GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import SplashScreen from 'react-native-splash-screen'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useNavigation } from 'DWcmn/PrjNav5Wrapper'

//20201023 no longer pass action to Route
//20230628 change to use PrjTabBar
//20250207 added QR scan button
//20250218 display just today's routes and add Other tab and implement refresh
//20250220 use DsRouteTile

export function DrvMain() {

   const navigation = useNavigation()

   const [routes, setRoutes] = useState([])
   const [isComponentInitialized, setIsComponentInitialized] = useState(false) //not set until we get our first data

   const unsubscribeRoutesRef = useRef(null)

   //the changeListener will be invoked any time a change in the routes query is detected
   //we just reload the routes array state variable
   //NOTE this also loads our data the first time
   const getRoutes = (querySnapshot) => {

      let localRoutes = dwdbfsRouteLoadSnapshots(querySnapshot)
      setRoutes(localRoutes)
      setIsComponentInitialized(true)

   } //end getRoutes

   const displayList = (routesToDisplay) => {
      return (
         (routesToDisplay.length == 0) ?
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
               <GCI18n code='cmnNEW.Waiting' />
            </View>
            : <FlatList
               data={routesToDisplay}
               renderItem={({ item }) => {
                  return (<DsRouteTile route={item} />)
               }}
               keyExtractor={(item, index) => index.toString()}
            >
            </FlatList>
      )
   }

   //set up today's routes query for this driver; mount-only now that REFRESH remounts the screen
   //instead of re-invoking this, so there is no longer a case where it runs more than once per mount
   //TODO sort driver routes in creation time order .. decreasing (most recent first)
   useEffect(() => {
      try {
         const startTime = moment().startOf('day').toDate()
         const endTime = moment().endOf('day').toDate()
         unsubscribeRoutesRef.current = firestore().collectionGroup("Routes")
            .where("archive", "==", false)
            .where("comboShopId", "==", DS.getComboShopId())
            .where("schedDate", ">=", startTime)
            .where("schedDate", "<=", endTime)
            .orderBy("schedDate")
            .onSnapshot(getRoutes, error => { prjCloudLogError('DrvMain routes listener', error, {toastI18n:"cmnNEW.MsgSnapshotError"}) });
      }
      catch (error) {
         prjCloudLogError('DrvMain routes setup', error)
      }
      SplashScreen.hide()//have to do this in case we navigate right here without logo screen
      return () => { unsubscribeRoutesRef.current && unsubscribeRoutesRef.current() }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, mirrors original componentDidMount/componentWillUnmount
   }, [])

   //we are not done until initialization is finished AND we have our first DB results
   if (!isComponentInitialized) {
      return (
         <DrvSpinnerScreen />
      );
   } //end if 

   //display routes, open route, wait for route
   return (
      <DrvScreen padding={10}>
         <GCHeader titleText={DRV.getId()} optionsBurger={() => { navigation.navigate('DrvProfile') }}/>
         {/* DATA SECTION */}
         <View style={{ flex: 1}}>
            {displayList(routes)}
         </View>

         <GCFooterForIcons>
            <GCFooterCmdIcon code="REFRESH"
               onPress={() => { navigation.replace('DrvMain') }} />
            <GCFooterCmdIcon code="ROUTES"
               onPress={() => navigation.navigate('DsViewOtherRoutes')
               } />
            <GCFooterCmdIcon code="SEARCH"
               onPress={
                  () => { navigation.navigate('DsSearch') }
               } />
            <GCFooterCmdIcon code="SCAN_QR"
               onPress={() => navigation.navigate('DsScanQrForOrder')} />
         </GCFooterForIcons>
      </DrvScreen >

   )
}// end DrvMain