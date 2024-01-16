function randNumbers(min: number = 0, max: number = 1000000): number {
    let difference: number = max - min;
    let rand: number = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
}

export const GLOBAL_OPTIONS: {
    tabindexes: {
        allowTabInAllForms: boolean;
    };
} = {
    tabindexes: {
        allowTabInAllForms: true,
    },
};
export interface AttrOfUC {
    UC_STAMP: string,
    PARENT_STAMP: string,
    UNIQUE_STAMP: string,
    ROOT_STAMP: string,
}
export const attrOfUC: AttrOfUC = {
    UC_STAMP: "uc" + randNumbers(),
    PARENT_STAMP: "parent" + randNumbers(),
    UNIQUE_STAMP: "uniq" + randNumbers(),
    ROOT_STAMP: "root" + randNumbers(),
}

export const ATTR_OF = {
    UC: Object.freeze({
        UC_STAMP: "uc" + randNumbers(),
        PARENT_STAMP: "parent" + randNumbers(),
        UNIQUE_STAMP: "uniq" + randNumbers(),
        ROOT_STAMP: "root" + randNumbers(),
    }),
};

