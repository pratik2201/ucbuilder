export type InputType = 'deleteContentBackward' | 'deleteByDrag' | 'deleteContentForward' | 'insertText' | 'insertFromPaste' | 'deleteByCut';
export class UcExtra {
    constructor(){}
    static getAdvanceTextBeforeInput(e: InputEvent) {
        let iType: InputType = e.inputType as any;
        let txt = e.target as HTMLInputElement;
        let cval = txt.value;
        let edata = (e.data ?? '');
        let nextVal = txt.value;
        let deltedText = '';
        let deletedTextLen = 0;
        switch (iType) {
            case 'insertText':
            case 'insertFromPaste':
                nextVal = cval.substring(0, txt.selectionStart) + edata + cval.substring(txt.selectionEnd);
                break;
            case 'deleteContentBackward':
                deltedText = cval.substring(txt.selectionStart, txt.selectionEnd);
                deletedTextLen = deltedText.length == 0 ? 1 : 0
                nextVal = cval.substring(0, txt.selectionStart - deletedTextLen) + cval.substring(txt.selectionEnd)
                break;
            case 'deleteContentForward':
                deltedText = cval.substring(txt.selectionStart, txt.selectionEnd);
                deletedTextLen = deltedText.length == 0 ? 1 : 0
                nextVal = cval.substring(0, txt.selectionStart) + cval.substring(txt.selectionEnd + deletedTextLen)
                break;
            case 'deleteByCut':
            case 'deleteByDrag':
                nextVal = cval.substring(0, txt.selectionStart) + cval.substring(txt.selectionEnd)
                break;
        }
        return nextVal;
    }
}