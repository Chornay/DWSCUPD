
//FIX missing GARMENT

//if no code then return default image
//elif code is a uri return uri:code
//else return the image from the app
export function cdsMenuGetThumbnail(code) {

    if (!code || typeof code !== 'string') return (require('../images/pricelist/dwLogo.png'))

    if (code.startsWith("http"))  return {uri:code}

    switch (code) {
        case 'ACCESSORIES': return (require('../images/pricelist/accessories.png')) //not used
        case 'BEDDING': return (require('../images/pricelist/bedding.png'))
        case 'DRYCLEAN': return (require('../images/pricelist/drycleaning.png'))
        case 'EZ': return (require('../images/pricelist/EZ.png'))
        case 'GARMENTS': return (require('../images/pricelist/garments.png'))
        case 'HANDWASH': return (require('../images/pricelist/handwash.png'))
        case 'HANDWASH_IRON': return (require('../images/pricelist/handwash-iron.png'))
        case 'HOUSEHOLD': return (require('../images/pricelist/household.png'))
        case 'IRONING': return (require('../images/pricelist/ironing.png'))
        case 'LADIES': return (require('../images/pricelist/ladies.png'))
        case 'LEATHER': return (require('../images/pricelist/leather.png'))
        case 'MENS': return (require('../images/pricelist/mens.png'))
        case 'OPTIONS': return (require('../images/pricelist/options.png'))
        case 'OTHERS': return (require('../images/pricelist/others.png'))
        case 'SHOP_CHARGES': return (require('../images/pricelist/shopCharges.png'))
        case 'WASH_FOLD': return (require('../images/pricelist/wash-fold.png'))
        case 'WASH_IRON': return (require('../images/pricelist/wash-iron.png'))
        default: return (require('../images/pricelist/dwLogo.png'))

    }
}
