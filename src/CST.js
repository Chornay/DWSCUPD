export class CST {
    static shpRec = null;
    static cstRec = null;

    static setCust(rec) { cstRec = rec }
    static setShop(rec) { shpRec = rec }

    static getCust() { return cstRec }
    static getCustId() { return cstRec?.id }
    static isDemoUser() { return cstRec?.isDemoUser}

    static getShop() { return shpRec }
    static getShopId() { return shpRec?.id }
    static getComboShopId() {return shpRec?.comboShopId}
    static getShopName() { return shpRec?.name }

}