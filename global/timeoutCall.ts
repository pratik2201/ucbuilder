class tmoNode {
    callbacklist: (() => void)[] = [];

    push(callback: () => void): void {
        this.callbacklist.push(callback);
    }

    fire(): void {
        this.callbacklist.forEach(c => c());
        this.callbacklist = [];
    }
}

class timeoutCall {
    static oldnode: tmoNode = new tmoNode();
    static newnode: tmoNode = new tmoNode();
    static mode: 'add' | '' = '';
    static isOn: boolean = false;
    static counter: number = 0;

    static start(callback: () => void): void {
        callback();
        return;
        this.counter++;
        this.newnode.push(callback);
        if (!this.isOn) {
            this.isOn = true;
            setTimeout(() => {
                this.newnode.fire();
                this.isOn = false;
            });
        }
    }
}

export { timeoutCall };