import { UcOptions,TptOptions } from 'ucbuilder/enumAndMore';
import { intenseGenerator } from 'ucbuilder/intenseGenerator';

export const R = {
    sampleForm:{buttons:{rightButtonManage: {
    load: (pera: UcOptions, ...args: any[]): import('ucbuilder/sampleForm/buttons/rightButtonManage.uc').rightButtonManage => intenseGenerator.generateUC('ucbuilder/sampleForm/buttons/rightButtonManage.uc', pera, args) as any,
    get type(): import('ucbuilder/sampleForm/buttons/rightButtonManage.uc').rightButtonManage { return null as any },
},},home: {
    load: (pera: UcOptions, ...args: any[]): import('ucbuilder/sampleForm/home.uc').home => intenseGenerator.generateUC('ucbuilder/sampleForm/home.uc', pera, args) as any,
    get type(): import('ucbuilder/sampleForm/home.uc').home { return null as any },
},},
}