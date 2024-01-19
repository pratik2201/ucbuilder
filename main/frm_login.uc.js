var ucbuilder;
(function (ucbuilder) {
    var main;
    (function (main) {
        class frm_login extends main.frm_login_designer {
            constructor() {
                super();
                this.stamp = "hello";
            }
        }
        main.frm_login = frm_login;
    })(main = ucbuilder.main || (ucbuilder.main = {}));
})(ucbuilder || (ucbuilder = {}));
