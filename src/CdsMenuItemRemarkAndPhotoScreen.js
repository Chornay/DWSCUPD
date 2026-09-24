import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, Image } from 'react-native';

import GCHeader from 'DWcmn/GCHeader'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import { GCText, GCI18n } from 'DWcmn/Gc'
import { CmnTouchableEdit } from 'DWcmn/CmnTouchableEdit'
import { COLORS } from 'DWcmn/Global'
import { strX } from 'DWcmn/I18n';
import { CdsScreen } from './CdsScreen';
import { PrjIcon } from 'DWcmn/PrjIconComponents'
import { PrjSpacer } from 'DWcmn/Prj';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { PrjIconForRemark } from 'DWcmn/PrjIconForRemark'
import { prjIconEditableBox } from 'DWcmn/PrjIconComponents'
import storage from '@react-native-firebase/storage';
import { dwdbfsOrderUpdateFields } from 'DWcmn/dwdbfsOrder'
import { CST } from './CST'
import { prjToast } from 'DWcmn/PrjToast'
import { useRefresh } from 'DWcmn/prjUseRefresh'
import { useIsMounted } from 'DWcmn/prjUseIsMounted'


//param line
export default function CdsMenuItemRemarkAndPhotoScreen({ navigation }) {

   const [isInitialized, setIsInitialized] = useState(false)
   const [imageCloudUrl, setImageCloudUrl] = useState(null)
   const refresh = useRefresh()
   const isMountedRef = useIsMounted()

   const lineRef = useRef(null)


   //one-time setup: pull the line from nav params and fetch its photo (if it has one)
   useEffect(() => {

      async function loadPhoto() {
         //CLAUDE: a null line rejects here (unhandled) and the screen would stay blank - needs protection/logging
         if (lineRef.current.imagePath) {
            try {
               const imageRef = await storage().ref(lineRef.current.imagePath);
               const downloadUrl = imageRef ? await imageRef.getDownloadURL() : null
               if (isMountedRef.current) { setImageCloudUrl(downloadUrl) }
            } catch (error) { prjToast({ text: error.message }) }
         }
         if (isMountedRef.current) { setIsInitialized(true) }
      }

      lineRef.current = navigation.getParam("line", null)
      loadPhoto()
      // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only setup, as the class did in componentDidMount
   }, [])


   //NOTE line.imagePath is changed directly (it isn't state) so every change to it must be followed by refresh()
   function renderPhotoInvitation(line) {
      const imageAlreadyExists = line.imagePath
      if (imageAlreadyExists) {
         return (
            <View style={styles.photoInvitation}>
               <View style={{ flex: .5 }}>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}
                     onPress={() => {
                        navigation.navigate('CdsCamera', { onSave: async (uri) => await savePhoto(line, uri) })
                     }}>
                     <PrjIcon id="RETAKE_PHOTO" />
                     <GCI18n title style={{ paddingStart: 20 }} code='cmnNEW.RETRY' />
                  </TouchableOpacity>
               </View>
               <View style={{ flex: .5 }}>
                  <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-end', width: '100%' }}
                     onPress={() => {
                        setImageCloudUrl(null)
                        line.imagePath = null
                        refresh()
                     }}>
                     <PrjIcon id="DELETE" />
                  </TouchableOpacity>
               </View>
            </View>
         )
      }

      else {
         return (
            <TouchableOpacity style={{ flexDirection: 'row' }}
               onPress={() => {
                  navigation.navigate('CdsCamera', { onSave: async (uri) => await savePhoto(line, uri) })
               }}>
               <View style={styles.photoInvitation}>
                  <PrjIcon id="CAMERA" />
                  <GCI18n title code='cmnNEW.TakePhoto' />
                  <PrjIcon id="CAMERA" />
               </View>
            </TouchableOpacity>
         )

      }

   } //end renderPhotoInvitation


   async function savePhoto(line, imageOnDeviceUri) {
      try {
         //store the picture in the cloud
         const path = generateDatedFileName('custImages', CST.getCustId(), 'png')
         const reference = storage().ref(path)
         await reference.putFile(imageOnDeviceUri);
         const downloadUrl = await reference.getDownloadURL()
         //NOTE change the line BEFORE setting state so the re-render triggered below sees the new imagePath
         line.imagePath = path
         if (isMountedRef.current) {
            setImageCloudUrl(downloadUrl)
            refresh()
         }
      }
      catch (error) {
         prjToast({ type: 'danger', text: error.message }) //OK
      }
   } //end savePhoto


   if (!isInitialized) {
      return null
   }

   const line = lineRef.current

   //unitType of 'EZnote'/'shopNote' do not need remarks ... already free form input
   const allowRemarks = !['EZnote', 'shopNote'].includes(line.unitType)

   return (
      <CdsScreen>
         {/* //TODO Chang title */}
         <GCHeader noBottomPadding back titleText={line.longName} />
         <View style={{ flex: 1, marginHorizontal: 10 }}>
            <PrjSpacer size={10} />
            {allowRemarks && <View style={styles.tile}>
               <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <GCText title>{strX('cmnNEW.REMARKS')}</GCText>
                  <CmnTouchableEdit
                     specialEditBox
                     titleI18n='cmnNEW.RemarksForOrder'
                     initial={line.remarks}
                     onOkay={(newValue) => { line.remarks = newValue; refresh() }}
                     onCancel={() => { }}
                     onDelete={() => { line.remarks = null; refresh() }}
                  >
                     {prjIconEditableBox()}
                  </CmnTouchableEdit>
               </View>
               <GCText detail light>{line.remarks}</GCText>
            </View>}

            {renderPhotoInvitation(line)}
            <PrjSpacer size={10} />
            {imageCloudUrl && <Image
               onError={() => prjToast({ i18n: "cmnNEW.ImageNotFound" })} //OK
               style={{ width: '100%', height: '80%' }}
               source={{ uri: imageCloudUrl }}
            />}
         </View>

      </CdsScreen>
   ); //end return

} //end CdsMenuItemRemarkAndPhotoScreen


//file name will be folder/prefix-datestuff.fileType
function generateDatedFileName(folder, prefix, fileType) {
   const now = new Date();

   const year = now.getFullYear();
   const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
   const day = String(now.getDate()).padStart(2, '0');

   const hours = String(now.getHours()).padStart(2, '0');
   const minutes = String(now.getMinutes()).padStart(2, '0');
   const seconds = String(now.getSeconds()).padStart(2, '0');
   const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

   const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}_${milliseconds}`;
   return `${folder}/${prefix}-${timestamp}.${fileType}`;
} //end generateDatedFileName


const styles = StyleSheet.create({
   tile: {
      justifyContent: 'center',
      width: '100%',
      height: 'auto',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 6,
      marginBottom: 10,
      borderColor: COLORS.GC_TILE_BORDER,
      borderWidth: 1.5,
      backgroundColor: COLORS.GC_ABS_WHITE
   },
   photoInvitation: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 'auto',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: COLORS.GC_THEME_DARK,
   },

})