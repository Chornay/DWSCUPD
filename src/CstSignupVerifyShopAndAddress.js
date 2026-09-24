
import React, { Component } from 'react'
import { View } from 'react-native'
import firebase from '@react-native-firebase/app';
import { cmnSignout } from 'DWcmn/CmnFunctions'

import { CdsScreen } from './CdsScreen';
import { PrjSpacer } from 'DWcmn/Prj';
import { PrjBusyMask } from 'DWcmn/PrjBusyMask'
import { isBlank } from 'DWcmn/PrjCmnFunctions'

import CstSpinnerScreen from './CstSpinnerScreen'
import CdsQuestionScreen from './CdsQuestionScreen'
import CstSignupWebViewWithAccept from './CstSignupWebViewWithAccept'
import CstSignupSlideIntro from './CstSignupSlideIntro'
import CstSignupShopSelect from './CstSignupShopSelect';
import { COLORS } from 'DWcmn/Global'

import { prjAlert } from 'DWcmn/PrjCmnFunctions'
import { dwdbfsCustGetByAuth, dwdbfsCustAdd } from 'DWcmn/dwdbfsCust'
import { dwdbfsShopGet } from 'DWcmn/dwdbfsShop'
import CstSignupProfilePersonal from './CstSignupProfilePersonal'
import { CmnAddressInput } from 'DWcmn/CmnAddressInput'
import { prjcmnInShopArea } from 'DWcmn/prjcmnLocationFunctions'
import { strX } from 'DWcmn/I18n';
import { GCI18n, GCText } from 'DWcmn/Gc'
import { GCFooterWithTwoIcons } from 'DWcmn/GCFooterForIcons'
import GCHeader from 'DWcmn/GCHeader'
import { CstShopTile } from './CstShopTile';
import { ScTile } from './ScTile'
import { prjStopType } from 'DWcmn/prjStopFunctions'
import { prjStopInitialize, prjStopInitHomeStopFromBuildingService } from 'DWcmn/prjStopFunctions'
import { prjStopInitHomeStopWithAddressLoc } from 'DWcmn/prjStopFunctions'
import { prjToast } from 'DWcmn/PrjToast'
import { CST } from './CST'
import { CstSignupNotificationPermission } from './CstSignupNotificationPermission'
import { dwdbfsCouponsAddWelcome } from 'DWcmn/dwdbfsCoupons'


//prop profileData
//prop chosenShop
//prop onOkay()
//prop onCancel()
export class CstSignupVerifyShopAndAddress extends Component {

    constructor(props) {
        super(props);
        this.state = {
            toggle: false,
        };
    }

    render() {
        return (
            <CdsScreen padding={10}>
                <GCHeader titleI18n='cmnNEW.LetsConfirm' />

                {/* <PrjSpacer size={40} />
                  <View style={{ flex: .2 }}>
                     <GCText large style={{ textAlign: 'center' }}>Let's confirm</GCText>
                  </View> */}
                <View style={{ flex: 1 }}>
                    <View style={{ flex: .5 }}>
                        <GCI18n large bold code='cmnNEW.SERVICE_PROVIDED_AT' />
                        <PrjSpacer size={10} />
                        <ScTile
                            initialMode
                            stop={this.props.profileData.homeStop}
                            onChange={async (fields) => {
                                //TODO NOTE that we actually don't need to add the fields here .. done in ScTile
                                //TODO check okay this.profileData.homeStop = { ...this.profileData.homeStop, ...fields };
                                this.toggle()
                            }}
                        />
                    </View>
                    <PrjSpacer size={40} />
                    <View style={{ flex: .5 }}>
                        <GCI18n large bold code='cmnNEW.SERVICE_PROVIDED_BY' />
                        <PrjSpacer size={10} />
                        <View style={{
                            backgroundColor: COLORS.GC_HIGHLIGHT_SELECTED,
                            shadowColor: 'rgba(0, 0, 0, 0.1)',
                            shadowOpacity: .1,
                            elevation: 5,
                            shadowRadius: .8,
                        }}>
                            <CstShopTile
                                shop={this.props.chosenShop}
                                selected={false}
                                clickable={false}
                                onPress={() => { }}
                            />
                        </View>
                    </View>
                </View>

                <GCFooterWithTwoIcons
                    onOkayCode='NEXT_IS_YES'
                    onCancelCode='PREV_IS_NO'
                    onOkay={() => {
                        if (prjStopType(this.props.profileData?.homeStop) == 'building' && isBlank(this.props.profileData.homeStop.unit)) {
                            prjToast({ type: 'reminder', i18n: 'cmnNEW.PleaseEnterYourUnit' }) //OK
                        }
                        else {
                            this.props.onOkay()
                        }
                    }}
                    onCancel={() => this.props.onCancel()}
                />
            </CdsScreen >
        )

    }

    //toggle a state variable to cause a render
    toggle = () => {
        this.setState({ toggle: !this.state.toggle })
    } //toggle 


}

