import React, { useEffect } from 'react';
import { useNavigation, useRoute } from 'DWcmn/PrjNav5Wrapper';

import firebase from '@react-native-firebase/app';
import { cmnSignout } from 'DWcmn/CmnFunctions';

import CdsSpinnerScreen from './CdsSpinnerScreen';
import { dwdbfsUserGetByAuthAndAppType } from 'DWcmn/DWDBfs';
import { getInitialLanguage } from 'DWcmn/I18n';
import { useIsMounted } from 'DWcmn/prjUseIsMounted'
import { prjCloudLogError } from 'DWcmn/prjCloudLog'

export default function CdsStackSigninOrMain() {
  const navigation = useNavigation();
  const { appType = null } = useRoute().params ?? {};
  const isMountedRef = useIsMounted();

  useEffect(() => {
    const init = async () => {
      await getInitialLanguage();
      const fbUser = firebase.auth().currentUser;

      let dbUser = null;
      let readFailed = false;
      if (fbUser) {
        try {
          dbUser = await dwdbfsUserGetByAuthAndAppType(appType, fbUser.uid);
        } catch (error) {
          readFailed = true;
          prjCloudLogError('CdsStackSigninOrMain.UserGet', error, { toastI18n: "cmnNEW.MsgDbReadError" });
        }
      }
      if (!isMountedRef.current) return;

      if (dbUser) {
        navigation.replace('StackMain', { user: dbUser, comeFrom: 'auto' });
        return;
      }

      //CLAUDE: signed in with no profile for this appType means sign out, but a failed read proves nothing, so never sign out on error
      if (fbUser && !readFailed) await cmnSignout();
      if (!isMountedRef.current) return;
      navigation.replace('StackSignin');
    };

    init();
  }, []);

  return <CdsSpinnerScreen />;
}