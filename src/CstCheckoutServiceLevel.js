import React, { useState, useRef, useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'

import { CstScreen } from './CdsScreen';
import CstSpinnerScreen from './CstSpinnerScreen';
import { GCFooterWithSingleIcon } from 'DWcmn/GCFooterForIcons'
import GCHeader from 'DWcmn/GCHeader' //NOTE doing the default import
import { GCText, GCI18n } from 'DWcmn/Gc'
import { strX } from 'DWcmn/I18n';
import { COLORS } from 'DWcmn/Global'
import { prjUpdateOrderPricing } from 'DWcmn/prjUpdateOrderPricing'
import { CST } from './CST'



//We will end up here if and only if a shop supports express or same day service.
//The express and same day options will appear only if configured for this shop

//on exit order fields will be set
//  serviceLevel regular, express, sameDay
//  serviceSurcharge %

//param order
const CstCheckoutServiceLevel = ({ navigation }) => {

    const [serviceLevel, setServiceLevel] = useState('regular')
    const [surchargePercent, setSurchargePercent] = useState(0)
    const [isComponentInitialized, setIsComponentInitialized] = useState(false)
    const orderRef = useRef(null)

    useEffect(() => {

        //CLAUDE no null check on order .. the lines below throw if the param is missing
        orderRef.current = navigation.getParam('order', null)

        setServiceLevel(orderRef.current.serviceLevel)
        setSurchargePercent(orderRef.current.serviceSurchargePercent)
        setIsComponentInitialized(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-time only, order nav param is read once
    }, [])

    const setLevel = (selected, surcharge) => {
        setServiceLevel(selected)
        setSurchargePercent(surcharge)
    }

    if (!isComponentInitialized) {
        return (
            <CstSpinnerScreen />
        );
    }
    const shop = CST.getShop()

    //CLAUDE -1 means 'not offered' .. should be a named constant (also in CstCheckout)
    //CLAUDE the service level strings 'regular', 'express', 'sameDay' should be named constants too
    return (

        <CstScreen>

            <GCHeader back cancel titleI18n='cstNEW.ServiceLevel' />

            <View style={{ flex: 1 }}>
                <Section selected={serviceLevel} onPress={setLevel} section='regular' surcharge={0} >
                    <GCI18n title code="cstNEW.RegularService" />
                    <GCText>{strX("cstNEW.OrderRequiresTimeReg", { hrs: orderRef.current.procTimeReg })}</GCText>
                </Section>
                {shop.surchargeExpress != -1 &&
                    <Section selected={serviceLevel} onPress={setLevel} section='express' surcharge={shop.surchargeExpress}>
                        <GCI18n title code="cstNEW.ExpressService" />
                        <GCText>{strX("cstNEW.OrderRequiresTimeExp", { hrs: orderRef.current.procTimeExp })}</GCText>
                        <GCText>{strX("cstNEW.SurchargeIsPercentExp", { percent: shop.surchargeExpress })}</GCText>
                    </Section>}
                {shop.surchargeSameDay != -1 &&
                    <Section selected={serviceLevel} onPress={setLevel} section='sameDay' surcharge={shop.surchargeSameDay}>
                        <GCI18n title code="cstNEW.SameDayService" />
                        <GCText>{strX("cstNEW.OrderRequiresTimeSameDay", { hrs: orderRef.current.procTimeSameDay })}</GCText>
                        <GCText>{strX("cstNEW.SurchargeIsPercentSameDay", { percent: shop.surchargeSameDay })}</GCText>
                    </Section>
                }
            </View>

            <GCFooterWithSingleIcon
                code={"NEXT_IS_PICKUP"}
                onPress={() => {
                    orderRef.current.serviceLevel = serviceLevel
                    orderRef.current.serviceSurchargePercent = surchargePercent
                    prjUpdateOrderPricing(orderRef.current) //reprice including surcharge
                    navigation.navigate('CstCheckoutSelectRoutePickup', { 'order': orderRef.current })
                }} />

        </CstScreen >
    );

}// end CstCheckoutServiceLevel

export default CstCheckoutServiceLevel

//prop selected
//prop section
//prop surcharge
//prop onPress()
const Section = ({ selected, section, surcharge, onPress, children }) => {
    const active = selected == section
    const maybeHighlightStyle = ((active) ? styles.highlight : null)

    return (
        <TouchableOpacity
            disabled={active}
            onPress={() => onPress(section, surcharge)}
        >
            <View style={maybeHighlightStyle}>
                <View style={{ flexDirection: 'column', paddingHorizontal: 10, paddingVertical: 20, alignItems: 'center' }}>
                    {children}
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    highlight: {
        backgroundColor: COLORS.GC_HIGHLIGHT_SELECTED,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOpacity: .1,
        elevation: 5,
        shadowRadius: .8,
    },
})