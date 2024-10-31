import { UcOptions,TptOptions } from 'ucbuilder/enumAndMore';
import { intenseGenerator } from 'ucbuilder/intenseGenerator';

export const R = {
    sampleForm:{buttons:{rightButtonManage: {
    load: (pera: UcOptions, ...args: any[]): import('sharepnl/sampleForm/buttons/rightSide/rightButtonManage.uc').rightButtonManage => intenseGenerator.generateUC('sharepnl/sampleForm/buttons/rightSide/rightButtonManage.uc', pera, args) as any,
    get type(): import('sharepnl/sampleForm/buttons/rightSide/rightButtonManage.uc').rightButtonManage { return null as any },
},},home: {
    load: (pera: UcOptions, ...args: any[]): import('../sharepnl/sampleForm/home.uc').home => intenseGenerator.generateUC('ucbuilder/sampleForm/home.uc', pera, args) as any,
    get type(): import('../sharepnl/sampleForm/home.uc').home { return null as any },
},},
}