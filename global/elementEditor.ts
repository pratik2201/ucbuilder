import { controlOpt, uniqOpt, strOpt } from "ucbuilder/build/common";
import { KeyboardKeys } from "ucbuilder/lib/hardware";

export class ElementEditor {
    htEle: HTMLElement;
    isInEditMode: boolean = false;
    lastActiveElement: HTMLElement;
    ATTR: { lastEditedData: string } = {
        lastEditedData: '______lval' + uniqOpt.guidAs_,
    };
    multiline: boolean = false;
    callbackOnSave: (changedContent: string, oldContent: string) => void = (changedContent, oldContent) => { };
    callbackOnReset: (oldContent: string) => void = (oldContent) => { };

    onDemandActualValue(): string {
        return this.htEle!.innerHTML;
    }

    bindEvents(): void {
        this.lastActiveElement = document.activeElement as HTMLElement;
        this.htEle!.setAttribute("contenteditable", "true");
        this.htEle!.addEventListener('blur', this.blurEventListener);
        this.htEle!.addEventListener('keydown', this.keydownListener);
    }

    unbindEvents(): void {
        this.htEle!.setAttribute("contenteditable", "false");
        this.htEle!.removeEventListener('blur', this.blurEventListener);
        this.htEle!.removeEventListener('keydown', this.keydownListener);
        if (this.lastActiveElement !== undefined) this.lastActiveElement.focus();
    }

    editRow(htEle: HTMLElement | undefined = undefined, callbackOnSave: (changedContent: string, oldContent: string) => void = (changedContent, oldContent) => { }, callbackOnReset: (oldContent: string) => void = (oldContent) => { }, multiline: boolean = false): void {
        this.multiline = multiline;
        this.callbackOnSave = callbackOnSave;
        this.callbackOnReset = callbackOnReset;
        this.htEle = htEle;
        this.bindEvents();

        const val: string = this.onDemandActualValue();
        this.htEle!.dataset[this.ATTR.lastEditedData] = val;
        this.isInEditMode = true;
        this.htEle!.innerHTML = val;
        this.htEle!.focus();
        controlOpt.selectAllText(this.htEle!);
    }

    blurEventListener = (event: FocusEvent): void => {
        if (this.isInEditMode) {
            console.log('blurEventListener');
            this.saveRow();
            event.preventDefault();
        }
    }

    keydownListener = (event: KeyboardEvent): void => {
        switch (event.keyCode) {
            case KeyboardKeys.Escape:
                this.reset();
                event.preventDefault();
                break;
            case KeyboardKeys.Up:
            case KeyboardKeys.Down:
                if (!this.multiline) {
                    this.reset();
                    event.preventDefault();
                }
                break;
            case KeyboardKeys.Enter:
                if (this.isInEditMode) {
                    if (this.multiline && event.shiftKey) {
                        event.stopPropagation();
                        return;
                    }
                    this.saveRow();
                    event.preventDefault();
                }
                break;
        }
    }

    reset(): void {
        const oldContent: string = this.htEle!.dataset[this.ATTR.lastEditedData]!;
        this.callbackOnReset(oldContent);
        this.unbindEvents();
        this.htEle!.innerHTML = oldContent;
    }

    saveRow(): void {
        if (this.isInEditMode) {
            const cntnt: string = this.htEle!.innerText.trim();
            const newContent: string = strOpt.replaceAll(cntnt, "\n", "<br>");
            const oldContent: string = this.htEle!.dataset[this.ATTR.lastEditedData]!;
            this.callbackOnSave(newContent, oldContent);
            this.unbindEvents();
        }
        this.isInEditMode = false;
    }
}