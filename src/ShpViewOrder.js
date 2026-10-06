import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import firestore from '@react-native-firebase/firestore';

import GCHeader from 'DWcmn/GCHeader'
import { PrjTabBar } from 'DWcmn/PrjTabBar'
import { GCFooterForIcons, GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'

import CmnIdList from 'DWcmn/CmnIdList'
import CmnItemsList from 'DWcmn/CmnItemsList'
import CmnHistoryList from 'DWcmn/CmnHistoryList';
import CmnNotesList from 'DWcmn/CmnNotesList'
import { shpGenerateOrderDetailActions } from './shpOrderActionProcessing';
import { shpProcessOrderAction, shpProcessOrderActionOnEvent } from './shpOrderActionProcessing'
import { dwdbfsOrderExtract } from 'DWcmn/DWDBfs'
import { getIconCodeForAction } from 'DWcmn/PrjCmnFunctions'
import { CmnPhotosList } from 'DWcmn/CmnPhotosList'
import { OrderActionEnum } from 'DWcmn/Global'
import { ShpScreen } from './CdsScreen';
import { prjCloudLogError } from 'DWcmn/prjCloudLog'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'

//20250207 added the onBack parameter, added immediateProcessing logic (without any functionality)
//20250207 added selectedTab parameter defaulting to 1 ... see Items tab by default




//nav param - onBack() if you want the back key to do anything other than goBack
//nav param - id
//nav param - readonly 
//nav param - selectedTab .. default 1 (to see the items in the order)

export function ShpViewOrder() {

   const navigation = useNavigation()
   const { id = null, readonly = false, selectedTab: selectedTabParam = 1, onBack = true } = useRoute().params ?? {}

   const [order, setOrder] = useState(null)
   const [action, setAction] = useState(OrderActionEnum.noop)
   const [waitingForFirstQueryResult, setWaitingForFirstQueryResult] = useState(true)
   const [selectedTab, setSelectedTab] = useState(selectedTabParam)

   const tabFields = [
      { key: 0, i18n: 'cmn.ID' },
      { key: 1, i18n: 'cmn.Items' },
      { key: 2, i18n: 'cmnNEW.Photos' },
      { key: 3, i18n: 'cmn.Notes' },
      { key: 4, i18n: 'cmn.History' },
   ]

   const getOrder = (docSnapshot) => {
      setOrder(dwdbfsOrderExtract(docSnapshot.data()))
      setWaitingForFirstQueryResult(false)
   } //end getOrder

   //set up the database listener for order data
   useEffect(() => {
      let unsubscribeOrder
      try {
         unsubscribeOrder = firestore().collection("Orders").doc(id)
            .onSnapshot(getOrder, error => { prjCloudLogError('ShpViewOrder order listener', error, {toastI18n:"cmnNEW.MsgSnapshotError"}) });
      }
      catch (error) {
         prjCloudLogError('ShpViewOrder order setup', error)
      }
      return () => { unsubscribeOrder && unsubscribeOrder() }
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only effect, mirrors original componentDidMount/componentWillUnmount
   }, [])

   //TODO spinner
   if (waitingForFirstQueryResult) {
      return null
   }

   const actions = readonly ? [] : shpGenerateOrderDetailActions(order)

   // NOTE in the normal case where there is no onBack set then TRUE will just do the default back
   return (
      <ShpScreen>

         {(action != OrderActionEnum.noop) &&
            shpProcessOrderAction(order, action, () => { setAction(OrderActionEnum.noop) })}

         <GCHeader back={onBack} titleI18n='cmn.Order_Detail' />
         <PrjTabBar fields={tabFields}
            selectedTab={selectedTab}
            onPress={(index) => setSelectedTab(index)} />
         <View style={{ flex: 1, marginHorizontal: 10 }}>
            {selectedTab == 0 && <CmnIdList order={order} />}
            {selectedTab == 1 && <CmnItemsList order={order} readonly={readonly} />}
            {selectedTab == 2 && <CmnPhotosList order={order} NoHeader />}
            {selectedTab == 3 && <CmnNotesList notes={order.notes} NoHeader />}
            {selectedTab == 4 && <CmnHistoryList order={order} />}
         </View>

         {/* FOOTER */}
         <GCFooterForIcons>
            {actions.map((act, index) =>
               <GCFooterCmdIcon
                  key={index}
                  code={getIconCodeForAction(act)}
                  onPress={async () => { //if we don't handle now, we will handle during render
                     if (!await shpProcessOrderActionOnEvent(navigation, order, act)) {
                        setAction(act)
                     }
                  }} //handle command in modal
               />
            )}
         </GCFooterForIcons>

      </ShpScreen >
   ); //end return

} //end ShpViewOrder