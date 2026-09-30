import React, { useEffect, useState } from 'react'
import { LogBox, View } from 'react-native';
import firestore from '@react-native-firebase/firestore';



import CmnIdList from 'DWcmn/CmnIdList'
import CmnItemsList from 'DWcmn/CmnItemsList'
import CmnHistoryList from 'DWcmn/CmnHistoryList';
import {CmnPhotosList} from 'DWcmn/CmnPhotosList'
import GCHeader from 'DWcmn/GCHeader'
import { COLORS } from 'DWcmn/Global'
import { GCFooterForIcons, GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import { PrjTabBar } from 'DWcmn/PrjTabBar'
import { getIconCodeForAction } from 'DWcmn/PrjCmnFunctions'
import { cstGenerateDetailActions, cstProcessAction, cstProcessActionOnEvent } from './cstActionProcessing'
import { dwdbfsOrderExtract } from 'DWcmn/DWDBfs'

import { OrderActionEnum } from 'DWcmn/Global'
import { CstScreen } from './CdsScreen';
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'
//20230523 replaced Notes with Photos
//20250214 action processing re-org




//navigation param - id
//navigation param - readonly

export function CstOrderDetail() {

   const navigation = useNavigation()
   const { id = null, readonly = false } = useRoute().params ?? {}

   const [order, setOrder] = useState(null)
   const [action, setAction] = useState(OrderActionEnum.noop)
   const [waitingForFirstQueryResult, setWaitingForFirstQueryResult] = useState(true)
   const [selectedTab, setSelectedTab] = useState(0)

   const tabFields = [
      { key: 0, i18n: 'cmn.ID' },
      { key: 1, i18n: 'cmn.Items' },
      { key: 2, i18n: 'cmnNEW.Photos' },
      { key: 3, i18n: 'cmn.History' }
   ]

   //subscribe to the order doc
   useEffect(() => {
      const unsubscribeOrder = firestore().collection("Orders").doc(id)
         .onSnapshot((docSnapshot) => {
            setOrder(dwdbfsOrderExtract(docSnapshot.data()))
            setWaitingForFirstQueryResult(false)
         })
      return () => { unsubscribeOrder() }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-time only, id is a nav param read once
   }, [])

   //turn off warnings because we get a pesky warning when items get removed by decrementing
   useEffect(() => {
      LogBox.ignoreAllLogs(true)
      return () => LogBox.ignoreAllLogs(false)
   }, [])


   //TODO spinner
   if (waitingForFirstQueryResult) {
      return null
   }

   const actions = readonly ? [] : cstGenerateDetailActions(order)

   return (
      <CstScreen>
         {(action == OrderActionEnum.noop) ? null :
            cstProcessAction(navigation, order,
               action, () => { setAction(OrderActionEnum.noop) })}

         {/* Header */}
         <GCHeader back titleI18n='cmn.Order_Detail' />
         <PrjTabBar fields={tabFields}
            selectedTab={selectedTab}
            onPress={(index) => setSelectedTab(index)} />
         <View style={{ flex: 1, marginHorizontal: 10 }}>
            {selectedTab == 0 && <CmnIdList order={order} />}
            {selectedTab == 1 && <CmnItemsList order={order} readonly={true} />}
            {selectedTab == 2 && <CmnPhotosList order={order} NoHeader />}
            {selectedTab == 3 && <CmnHistoryList order={order} />}
         </View>

         {/* FOOTER ..NOTE we have to set to standard background colour .. footer usually wants to be dark*/}
         <GCFooterForIcons
            style={{ backgroundColor: COLORS.GC_BACKGROUND }}>
            {actions.map((act, index) =>
               <GCFooterCmdIcon
                  key={index}
                  code={getIconCodeForAction(act)}
                  onPress={() => {
                     if (!cstProcessActionOnEvent(navigation, order, act)) {
                        setAction(act)
                     }
                  }}
               />
            )}
         </GCFooterForIcons>

      </CstScreen >
   ); //end return
} //end CstOrderDetail