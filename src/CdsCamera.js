import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native';

import GCHeader from 'DWcmn/GCHeader'
import GCFooterForIcons, { GCFooterCmdIcon } from 'DWcmn/GCFooterForIcons'
import { COLORS } from 'DWcmn/Global'

import { CdsScreen } from './CdsScreen';
import { RNCamera } from 'react-native-camera';
import { prjToast } from 'DWcmn/PrjToast'
import { PrjIconButton } from 'DWcmn/Prj';
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'

//20241120 added PrjBusyMask
//         added the tag parameter
//         renamed from CstCamera to CdsCamera
//20250602 implemented the onSave method


//param onSave(uri) returns the uri of the image to save
//  this will be the location of the image in temporary storage on the device
export default class CdsCamera extends Component {

   constructor() {
      super();
      this.state = {
         imageUri: null,
         isInitialized: false,
         isDbWriteInProgress: false,
      };
      this.order = null
      this.tag = null
   }

   async componentDidMount() {
      this.onSave = this.props.navigation.getParam('onSave', null);
      this.setState({ isInitialized: true })
   } //end componentDidmount


   render() {

      if (!this.state.isInitialized) {
         return null
      }
      return (
         <CdsScreen>
            {(this.state.isDbWriteInProgress) && <PrjBusyMask />}
            <GCHeader noBottomPadding back titleI18n='cmnNEW.Camera' />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
               <RNCamera
                  ref={ref => { this.camera = ref; }}
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
               {this.state.imageUri == null ?

                  <PrjIconButton
                     style={{ fontSize: 50 }}
                     id="TAKE_PHOTO"
                     onPress={async () => {
                        if (this.camera) {
                           const options = { quality: 0.2, base64: true };
                           try {
                              this.setState({ imageUri: await this.camera.takePictureAsync(options) })
                              this.camera.pausePreview()
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
                        this.setState({ imageUri: null })
                        this.camera.resumePreview()
                     }}
                  />}

               {this.state.imageUri != null && <GCFooterCmdIcon
                  code="SAVE"
                  onPress={async () => {
                     this.setState({ isDbWriteInProgress: true })
                     await this.onSave(this.state.imageUri.uri)
                     this.setState({ isDbWriteInProgress: false })
                     this.props.navigation.goBack()
                  }}
               />}
            </GCFooterForIcons>

         </CdsScreen>
      ); //end return
   } //end render

} //end class CdsCamera


const styles = StyleSheet.create({
   rnCamera: {
      flex: 1,
      width: '94%',
      alignSelf: 'center',
   }
})
