class openCloser{    
    ignoreList = {};
    /**
      * @param {string} openTxt 
      * @param {string} closeTxt 
      * @param {string} contents 
      * @param {Function} callback 
      */
     doTask (openTxt, closeTxt, contents, callback =
        /**
         * @param {string} outText outer string 
         * @param {string} inText inner string 
         * @param {number} txtCount number of `openTxt` found in contents
         */
        (outText, inText, txtCount) => { })  {
        
        let opened = 0, closed = 0;
        let rtrn = "";
        let lastoutIndex = 0, lastinIndex = 0;
        for (let index = 0, len = contents.length; index < len; index++) {
            let cnt = contents.charAt(index);
            if (opened == closed && index > 0 && opened > 0) {
                let selector = contents.substring(lastoutIndex, lastinIndex);
                let cssStyle = contents.substring(lastinIndex + 1, index - 1);
                rtrn += callback(selector, cssStyle, opened);
                lastoutIndex = index;
                opened = closed = 0;
            }
            switch (cnt) {
                case openTxt:
                    if (opened == 0)
                        lastinIndex = index;
                    opened++;
                    break;
                case closeTxt:
                    closed++;

                    break;
            }
        }
        return rtrn;
    }
}
module.exports = {
    openCloser
}