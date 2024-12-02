export interface UcConfig {
    dirPath: string,
    designerDir: string,
    paths: {
        [key:string]:string,
    },
}
export const ucConfig:UcConfig = {
    dirPath: '',
    designerDir:'_designer',
    paths:{
        
    }
}