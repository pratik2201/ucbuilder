{=codefile.className}: {
    load: (pera: UcOptions, ...args: any[]): import('{=src.mainFileRootPath}').{=codefile.className} => intenseGenerator.generateUC('{=src.mainFileRootPath}', pera, args) as any,
    get type(): import('{=src.mainFileRootPath}').{=codefile.className} { return null as any },
},