import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native';

import GCHeader from 'DWcmn/GCHeader'
import { GCFooterForIcons, GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import { COLORS } from 'DWcmn/Global'

import { CdsScreen } from './CdsScreen';
import { RNCamera } from 'react-native-camera';
import { prjToast } from 'DWcmn/PrjToast'
import { PrjIconButton } from 'DWcmn/Prj';
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper'

//20241120 added PrjBusyMask
//         added the tag parameter
//         renamed from CstCamera to CdsCamera
//20250602 implemented the onSave method


//param onSave(uri) returns the uri of the image to save
//  this will be the location of the image in temporary storage on the device
export function CdsCamera() {

   const navigation = useNavigation()
   const { onSave = null } = useRoute().params ?? {}

   const [imageUri, setImageUri] = useState(null)
   const [isInitialized, setIsInitialized] = useState(false)
   const [isDbWriteInProgress, setIsDbWriteInProgress] = useState(false)

   const cameraPointerRef = useRef(null)

   useEffect(() => {
      setIsInitialized(true)
   }, [])


   if (!isInitialized) {
      return null
   }
   return (
      <CdsScreen>
         {(isDbWriteInProgress) && <PrjBusyMask />}
         <GCHeader noBottomPadding back titleI18n='cmnNEW.Camera' />
         <View style={{ flex: 1, marginHorizontal: 10 }}>
            <RNCamera
               ref={ref => { cameraPointerRef.current = ref; }}
               style={styles.rnCamera}
               type={RNCamera.Constants.Type.back}
               // flashMode={RNCamera.Constants.FlashMode.on} //leave at AUTO
               captureAudio={false}
               androidCameraPermissionOptions={{
                  title: 'Permission to use camera',
                  message: 'We need your permission to use your camera',
                  buttonPositive: 'Ok',
                  buttonNegative: 'Cancel',
               }}
            />
         </View>
         <GCFooterForIcons
            style={{ backgroundColor: COLORS.GC_BACKGROUND }}>
            {imageUri == null ?

               <PrjIconButton
                  style={{ fontSize: 50 }}
                  id="TAKE_PHOTO"
                  onPress={async () => {
                     if (cameraPointerRef.current) {
                        const options = { quality: 0.2, base64: true };
                        try {
                           setImageUri(await cameraPointerRef.current.takePictureAsync(options))
                           cameraPointerRef.current.pausePreview()
                        }
                        catch (error) {
                           prjToast({ type: 'danger', text: error.message }) //OK
                        }

                     }
                  }}
               />
               :
               <GCFooterCmdIcon
                  code="RETAKE_PHOTO"
                  onPress={async () => {
                     setImageUri(null)
                     cameraPointerRef.current.resumePreview()
                  }}
               />}

            {imageUri != null && <GCFooterCmdIcon
               code="SAVE"
               onPress={async () => {
                  setIsDbWriteInProgress(true)
                  await onSave(imageUri.uri)
                  setIsDbWriteInProgress(false)
                  navigation.goBack()
               }}
            />}
         </GCFooterForIcons>

      </CdsScreen>
   ); //end return

} //end CdsCamera


const styles = StyleSheet.create({
   rnCamera: {
      flex: 1,
      width: '94%',
      alignSelf: 'center',
   }
})