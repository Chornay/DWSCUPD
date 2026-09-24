export class DRV {
    static drvRec = null;
 
    static setRec(rec) {drvRec=rec}
 
    static getRec() { return drvRec }
    static getId() {return drvRec?.id}
 
 }