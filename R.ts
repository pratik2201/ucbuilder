import { UcOptions,TptOptions } from 'ucbuilder/enumAndMore';
import { intenseGenerator } from 'ucbuilder/intenseGenerator';

export const R = {
    main:{Form: {
    load: (pera: UcOptions, ...args: any[]): import('ucbuilder/main/Form.uc').Form => intenseGenerator.generateUC('ucbuilder/main/Form.uc', pera, args) as any,
    get type(): import('ucbuilder/main/Form.uc').Form { return null as any },
},},
}