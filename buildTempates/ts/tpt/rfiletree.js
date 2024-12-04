{=codefile.className}: {
    load: (pera: TptOptions): import('{=src.mainFileRootPath}').{=codefile.className}  => intenseGenerator.generateTPT('{=src.mainFileRootPath}', pera) as any,
    get type(): import('{=src.mainFileRootPath}').{=codefile.className} { return null as any },    
},