import { UcOptions } from 'ucbuilder/enumAndMore';
import { intenseGenerator } from 'ucbuilder/intenseGenerator';

export const R = {
    main:{Form: {
    load: (pera: UcOptions, ...args: any[]): import('ucbuilder/main/Form.uc').Form => intenseGenerator.generateUC('ucbuilder/main/Form.uc', pera, args) as any,
},},
}