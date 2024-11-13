import { RowInfo, SearchStatus, SourceManage } from "ucbuilder/global/datasources/SourceManage";

export class SearchableItemNode {
    private _Text: string;
    constructor(_text?: string) {
        if (_text)
            this.Text = _text;
    }
    public get Text(): string {
        return this._Text;
    }
    public set Text(value: string) {
        //console.log(value);

        this.ignoredCharsIndexes.length = 0;
        this._Text = this.highlightedText = value;
        this.SearchableText = value.replace(/[\W\s]/g, (match, index, text) => {
            this.ignoredCharsIndexes.push(index);
            return '';
        });
    }
    reset() {
        this.highlightedText = this._Text;
    }
    highlightedText: String = "";
    highlightCallback = (index: number, textToHighLight: string, analyserReport: AnalyseResultType = 'NotFound'): string => {
        switch (analyserReport) {
            case 'Equal': return '<u text-search-statue="equal">' + textToHighLight + '</u>';
            case 'StartWith': return '<u text-search-statue="startwith">' + textToHighLight + '</u>';
            case 'Include': return '<u text-search-statue="include" >' + textToHighLight + '</u>';
        }
    };
    public setOutput(searchStartIndex: number, text: string, analyserReport: AnalyseResultType = 'NotFound') {
        let searchEndIndex = searchStartIndex + text.length;
        let specialCharIndexes = 0;
        /* if (this._Text == 'Branch & Devision') {
            // debugger;
         }*/
        for (let i = 0; i < this.ignoredCharsIndexes.length; i++) {
            specialCharIndexes = this.ignoredCharsIndexes[i];
            if (specialCharIndexes <= searchStartIndex) {
                searchStartIndex++;
                searchEndIndex++;
            }
            else if (specialCharIndexes < searchEndIndex) searchEndIndex++;
            else break;

        }
        let hiLtedText = this.highlightCallback(searchStartIndex, this._Text.substring(searchStartIndex, searchEndIndex), analyserReport);
        let beginText = this._Text.slice(0, searchStartIndex);
        let endingText = this._Text.slice(searchEndIndex);
        this.highlightedText = beginText + '' + hiLtedText + '' + endingText;
        //this.highlightedText = this.Text + " (" + index + " to  " + lastIndex + "  ["+this.ignoredCharsIndexes.join(",")+"] @ " + this.Text.substring(index,lastIndex) + ")";
    }
    public SearchableText: string = "";
    private ignoredCharsIndexes: number[] = [];
}
interface analyserSource<T> {
    foundIndexOfEqual?: number,
    startIndexOfStartWith?: number,
    endIndexOfStartWith?: number,
    allMix: T[];
    equal: T[];
    startwith: T[];
    include: T[];
}
export class ResultAnalyser<T> {
    source: SourceManage<T>;
    /* public get source(): SourceManage<T> {
         return this._source;
     }
     public set source(value: SourceManage<T>) {
         this._source = value;
        
     }*/

    filteredSource: any[] = [];

    sortSource() {
        let _SortEvent = this.Event.onSortCall;
        let src = this.source;
        src.sort((a, b) => { return _SortEvent(a, b); });
        let obj = undefined;
        for (let j = 0; j < src.length; j++) {
            obj = src[j];
           // src.getRowByObj(obj).isModified = true;
            src.resetRow(SourceManage.getRow(obj));
        }
        src.unshift(...this.TopStickyRows, ...this.DefaultRows);
    }
    Event = {
        onSortCall: (a: T, b: T) => {
            let rtrn = 0;
            let cols = this.columnsToFindIn;
            for (let i = 0; i < cols.length; i++) {
                const col = cols[i];
                rtrn += a[col].SearchableText.localeCompare(a[col].SearchableText);
            }
            return rtrn;
        },
        beforeFillingRows: (source: T[]) => {

        }
    }
    public TopStickyRows: T[] = [];
    public bottomStickyRows: T[] = [];
    public DefaultRows: T[] = [];

    setDefaultRow() {
        this.TopStickyRows = this.source.slice(0, this.source.info.defaultIndex);
    }
    get NonSourceRows() {
        return [...this.TopStickyRows, ...this.DefaultRows];
    }
    get SourceOriginalRows() {
        return [ ...this.source.originalSource];
    }
    get FullSample() {
        return [...this.TopStickyRows, ...this.DefaultRows, ...this.source.originalSource];
    }
    
    filterInitlized = false;
    clearFilter(sort: boolean = true) {
        let src = this.source;
        src.info.doForAll({
            isModified: true,
            isVisible: undefined,
            searchStatus: SearchStatus.notFound
        });
        src.clear();
        src.push(...src.originalSource);
        if (sort)
            this.sortSource();
        src.callToFill();
        this.lasttext = '';
        this.filterInitlized = false;
    }
    lasttext = "";
    filter(text: string) {
        text = text.trim();
        let src = this.source;
        if (text == '') { this.clearFilter(); }
        else if (!text.startsWithI(this.lasttext) || this.lasttext == '') {
            this.initFilter(text);
        } else {
            let snode = new SearchableItemNode();
            snode.Text = text;
            this.initStorageForAnalyse();
            this.filteredSource.map(row => this.analyse(snode, row));
            src.clear();
            this.pushResultInside(snode, src);
            if (src.length > 0) {
                src.unshift(...this.TopStickyRows);
            } else {
                src.unshift(...this.TopStickyRows,...this.DefaultRows);
            }
            src.callToFill();
        }
        /*switch (text.length) {
            case 0:
                this.clearFilter();

                break;
            case 1:
                this.initFilter(text);
                break;
            default:
                //this.initFilter(text); return;
                if (!this.filterInitlized) { this.initFilter(text); return; }
                let snode = new SearchableItemNode();
                snode.Text = text;

                this.initStorageForAnalyse();
                src.originalSource.map(row => this.analyse(snode, row));

                this.source.clear();
                this.source.push(...this.defaultTopRows);
                this.pushResultInside(snode, this.source);
                this.updateSource();
                break;
        }*/
    }
    private initFilter(text: string) {
        let snode = new SearchableItemNode();
        this.initStorageForAnalyse();
        snode.Text = text;
        let src = this.source;
        let tmp: T[] = [];
        tmp.push(...src.originalSource);
        //tmp.splice(0, src.info.defaultIndex);
        for (let i = 0; i < tmp.length; i++) {
            const row = tmp[i];
            this.analyse(snode, row);
        }
        this.filteredSource.length = 0;
        this.pushResultInside(snode, this.filteredSource);
        src.clear();
        src.push(...this.filteredSource);
        if (src.length > 0) {
            src.unshift(...this.TopStickyRows);
        } else {
            src.unshift(...this.TopStickyRows,...this.DefaultRows);
        }
        src.callToFill();
        this.filterInitlized = true;
        this.lasttext = text;
    }

    clearSources() {
        this.source.clear(true);
        this.filteredSource.length = 0;
    }

    columnsToFindIn: string[] = [];
    analyserStorage = {};
    constructor(source: SourceManage<T>) {
        this.source = source;
    }
    pushColumnsToFindIn(...columnsToFindIn: string[]) {
        this.columnsToFindIn.push(...columnsToFindIn);
        this.source.searchables.length = 0;
        this.source.searchables.push(...this.columnsToFindIn);
        this.initStorageForAnalyse();
    }
    initStorageForAnalyse() {

        let cols = this.columnsToFindIn;
        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            this.analyserStorage[col] = {
                allMix: [],
                equal: [],
                startwith: [],
                include: [],
            };
        }
    }
    analyse(findThis: SearchableItemNode, /*insideThis: SearchableItemNode,*/ row: T): AnalyseResultType[] {
        let results: AnalyseResultType[] = [];
        let cols = this.columnsToFindIn;
        let src = this.source;
        let Robj: RowInfo<T>; Robj = src.getRowByObj(row);
        for (let i = 0, len = cols.length; i < len; i++) {
            const col = cols[i];
            let res = this.analyserStorage[col] as analyserSource<T>;
            let insideThis = row[col] as SearchableItemNode;
            Robj = src.getRowByObj(row);
            Robj.isVisible = true;
            insideThis.reset();

            let inTest = insideThis.SearchableText.includesI(findThis.SearchableText);
            if (inTest.result) {
                insideThis.setOutput(inTest.index, findThis.SearchableText, 'Include');
                res.allMix.push(row);
                //res.include.push(row);
                results.push('Include');
                Robj.isModified = true;
                Robj.searchStatus = SearchStatus.include;
            }
            else {

                Robj.isVisible = false;
                Robj.searchStatus = SearchStatus.notFound;
                results.push('NotFound');
            }
        }
        return results;
    }
    pushResultInside(findThis: SearchableItemNode, target = []) {
        let src = this.source;
        let ttl: analyserSource<T> = {
            allMix: [],
            equal: [],
            startwith: [],
            include: [],
        }
        let insideThis: SearchableItemNode;
        let cols = this.columnsToFindIn;
        for (let i = 0, ilen = cols.length; i < ilen; i++) {
            const col = cols[i];
            let res = this.analyserStorage[col] as analyserSource<T>;
            for (let j = 0, jlen = res.allMix.length; j < jlen; j++) {
                const row = res.allMix[j];
                insideThis = row[col] as SearchableItemNode;
                let Robj = src.getRowByObj(row);
                if (insideThis.SearchableText.startsWithI(findThis.SearchableText)) {
                    insideThis.setOutput(0, findThis.SearchableText, 'StartWith');
                    res.startwith.push(row);
                    Robj.searchStatus = SearchStatus.startWith;

                } else {
                    res.include.push(row);
                }
            }
            for (let j = 0, jlen = res.startwith.length; j < jlen; j++) {
                const row = res.allMix[j];
                insideThis = row[col] as SearchableItemNode;
                let Robj = src.getRowByObj(row);
                if (jlen == 1 || insideThis.SearchableText.equalIgnoreCase(findThis.SearchableText)) {
                    insideThis.setOutput(0, findThis.SearchableText, 'Equal');
                    Robj.searchStatus = SearchStatus.equal;
                    res.equal.push(row);
                }
            }
            ttl.allMix.push(...res.equal, ...res.startwith, ...res.include);
        }
        target.push(...ttl.allMix.distinct());
    }
}
export type AnalyseResultType = "Equal" | "StartWith" | "Include" | "NotFound";
