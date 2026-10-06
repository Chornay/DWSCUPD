import React, { useState, useRef, useEffect } from 'react'
import { FlatList, View, Text } from 'react-native'
// import DatePicker from 'react-native-date-picker'

import { DsScreen } from './CdsScreen'
import ShpSpinnerScreen from './ShpSpinnerScreen'
import { GC_STD_MARGIN } from 'DWcmn/Global'
import GCHeader from 'DWcmn/GCHeader'
import { GCFooterForIcons, GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import DsRouteTile from './DsRouteTile'
import firestore from '@react-native-firebase/firestore';
import { dwdbfsRouteLoadSingleSnapshot } from 'DWcmn/dwdbfsRoute'
import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { DS } from './DS'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions';
import { cmnCalendarDate } from 'DWcmn/CmnFunctions'
import { dsWarningScreenDoesNotUpdate } from './dsWarningScreenDoesNotUpdate'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'

import moment from 'moment';

//20250309 comboShop
//20250525 added "Screen Does Not Update"


//NOTE remember that we do NOT monitor the routes on this screen for changes
//NOTE applyMask is set on init read BUT no render is done then anyhow
export function DsViewOtherRoutes() {

   const [startTimeAsMoment, setStartTimeAsMoment] = useState(moment())
   const [pickDate, setPickDate] = useState(false)
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const [applyMask, setApplyMask] = useState(false)
   const routesRef = useRef([])

   //refreshRoutes returns an array of all routes for the specified date (as a moment)
   //NOTE that we do not use the state variable startTimeAsMoment because it is sometimes set just before
   //     we call refreshRoutes (so is not guaranteed to be updated)
   async function refreshRoutes(dateAsMoment) {

      const temp = moment(dateAsMoment)
      const startTime = temp.startOf('day').toDate()
      const endTime = temp.endOf('day').toDate()

      const localRoutes = []
      setApplyMask(true)
      try {
         const querySnapshot = await firestore()
            .collectionGroup("Routes")
            .where("archive", "==", false)
            .where("comboShopId", "==", DS.getComboShopId())
            .where("schedDate", ">=", startTime)
            .where("schedDate", "<", endTime)
            .orderBy('schedDate')
            .get();
         querySnapshot.forEach(snapshot => {
            localRoutes.push(dwdbfsRouteLoadSingleSnapshot(snapshot))
         })

         routesRef.current = localRoutes

      }
      catch (error) {
         prjCloudLogError('DsViewOtherRoutes refreshRoutes', error, { toastI18n: "cmnNEW.MsgDbReadError" })
      }
      setApplyMask(false)
      setIsComponentInitialized(true)
   }

   //on mounting we set today's date and load routes
   useEffect(() => {
      refreshRoutes(startTimeAsMoment)
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, mirrors original componentDidMount
   }, [])

   if (!isComponentInitialized) {
      return (
         <ShpSpinnerScreen />
      );
   } //end if 

   // <GCHeader back titleText={startTimeAsMoment.calendar().split(" at")[0]} />

   return (
      <DsScreen padding={10}>
         {applyMask && <PrjBusyMask />}
         <GCHeader back titleText={cmnCalendarDate(startTimeAsMoment.toDate())} />
         <View style={{ flex: 1 }}>
            {/* <DatePicker
               modal
               mode='date'
               open={pickDate}
               date={startTimeAsMoment.toDate()}
               onConfirm={async (date) => {
                  const dateAsMoment = moment(date)
                  await refreshRoutes(dateAsMoment)
                  setStartTimeAsMoment(dateAsMoment)
                  setPickDate(false)
               }}
               onCancel={() => setPickDate(false)}

            /> */}
            <FlatList
               data={routesRef.current}
               renderItem={({ item }) => {
                  return (<DsRouteTile route={item} />)
               }}
               keyExtractor={(item, index) => index.toString()}
            >
            </FlatList>
            {dsWarningScreenDoesNotUpdate()}
         </View>
         <GCFooterForIcons>
            <GCFooterCmdIcon code="DATE_PREV"
               onPress={async () => {
                  const temp = moment(startTimeAsMoment)
                  const dateAsMoment = temp.add(-1, 'day')
                  await refreshRoutes(dateAsMoment)
                  setStartTimeAsMoment(dateAsMoment)
               }} />
            <GCFooterCmdIcon code="REFRESH"
               onPress={async () => { await refreshRoutes(startTimeAsMoment) }} />
            {/* <GCFooterCmdIcon code="DATE" //BOMBS ON IOS
               onPress={
                  () => { setPickDate(true) }
               } /> */}
            <GCFooterCmdIcon code="DATE_NEXT"
               onPress={async () => {
                  const temp = moment(startTimeAsMoment)
                  const dateAsMoment = temp.add(1, 'day')
                  await refreshRoutes(dateAsMoment)
                  setStartTimeAsMoment(dateAsMoment)
               }} />
         </GCFooterForIcons>
      </DsScreen>
   )
} //end DsViewOtherRoutes