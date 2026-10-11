import React, { useState, useEffect, useRef } from 'react'
import { View } from 'react-native'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'
import { CdsScreen } from './CdsScreen'
import GCHeader from 'DWcmn/GCHeader'
import { dwdbfsShopGet } from 'DWcmn/dwdbfsShop'
import { prjcmnInShopArea } from 'DWcmn/prjcmnLocationFunctions'
import { prjcmnCalculateEnclosingMapRegionWithLocArray } from 'DWcmn/prjcmnLocationFunctions'
import { prjToast } from 'DWcmn/PrjToast'
import { cmnAlertPopup } from 'DWcmn/cmnAnnunciationFunctions'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'

//CdsShopBoundaries
//A component to show the boundaries of a shop/building AND test if a point is within

//param shopId

export function CdsShopBoundaries() {

   const navigation = useNavigation()
   const { shopId = null } = useRoute().params ?? {}
   const [isComponentInitialized, setIsComponentInitialized] = useState(false)
   const shopRef = useRef(null)
   const mapPointerRef = useRef(null)
   const isMountedRef = useIsMounted()

   useEffect(() => {
      async function init() {
         try {
            const shopRec = await dwdbfsShopGet(shopId)
            if (!isMountedRef.current) return
            if (!shopRec) {
               prjCloudLogError('CdsShopBoundaries', 'shop not found: ' + shopId, { toastI18n: "cmnNEW.MsgDbReadError" })
               navigation.goBack()
               return
            }
            shopRef.current = shopRec
            setIsComponentInitialized(true)
         } catch (error) {
            prjCloudLogError('CdsShopBoundaries', error, { toastI18n: "cmnNEW.MsgDbReadError" })
            if (isMountedRef.current) navigation.goBack()
         }
      }

      init()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; shopId is a route param fixed for the life of this screen
   }, [])
   if (!isComponentInitialized) return null

   const shop = shopRef.current
   const boundary = shop.boundary

   return (
      <CdsScreen>
         <View style={{ flex: 1 }}>
            <GCHeader back={() => { navigation.goBack() }}
               titleText={'Boundaries for Shop ' + shop.id}
            />

            <View style={styles.mapContainer}>
               <MapView
                  provider={PROVIDER_GOOGLE} //for ios
                  ref={mapPointerRef}
                  style={styles.map}
                  showsUserLocation={false}
                  showsMyLocationButton={false}
                  moveOnMarkerPress={false}
                  onPress={ (e) => {
                     try {
                        const response = prjcmnInShopArea(e.nativeEvent.coordinate, shop)
                        if (response) { prjToast({ type: 'success', text: 'Point is inside area' }) } //OK
                        else { prjToast({ type: 'warning', text: 'Point is outside area' }) } //OK
                     } catch (error) {
                        cmnAlertPopup({ text: error.message });
                     }

                  }}
                  initialRegion={prjcmnCalculateEnclosingMapRegionWithLocArray(boundary, null)}
               >
                  <MapView.Polygon
                     coordinates={boundary}
                     fillColor="rgba(255, 0, 0, 0.25)"
                     strokeColor={'red'}
                  />

               </MapView>
            </View >
         </View>
      </CdsScreen>
   );
}//end CdsShopBoundaries

const styles = {
   mapContainer: {
      flex: 1,
      paddingLeft: 0,
      paddingRight: 0,
      //CLAUDE: 'marginButtom' is a typo for marginBottom, so it has never done anything (and it's 0, so fixing it changes nothing visible)
      marginButtom: 0,
   },
   map: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
   },
}