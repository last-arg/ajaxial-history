// HTML attributes:
// - ajxl-history="<path>"
//   - in case empty ajxl-path is used
// - ajxl-history-action: 
//   - push (default)
//   - replace
// - ajxl-history-name="<name>"
//   - in case empty 'default' name is used

// Can overwrite storeState and readStore to use own storage to back up state.
// Like localStorage, IndexDB, ...

// TODO: Use event dispatching for read/store data (state) modification?

const AjaxialHistory = new class {
    /** @typedef {{[string]: string}} State */
    constructor() {
        /** @type {number | undefined} */
        this.throttle_timeout = undefined;

        document.addEventListener("click", function(ev) {
            if (ev.target.closest("a[ajxl-path]")) {
                ev.preventDefault();
            }
        })

        window.addEventListener("popstate", this);
        document.addEventListener("ajaxial:trigger", this)
        document.addEventListener("ajaxial:finish", this)
    }
    /** @param {Event} ev */
    handleEvent(ev) {
        let type = ev.type.replace(":", "_");
        this[`handle_${type}`](ev)
    }
    /** 
        @param {any} state 
        @returns {State}
    */
    readState(state) { return state }
    // TODO: make handle_popstate and readState async
    // Or let user handle by overwritting these functions to async?
    /** @param {PopStateEvent} ev */
    handle_popstate(ev) {
        if (!ev.state) {
            return;
        }
        const state = this.readState(ev.state);
        const elems = document.querySelectorAll("[ajxl-history-name]");
        if (elems.length === 0) {
            if (state.default) {
                let node = Ajaxial.responseConverters.html(state.default)(document.body);
                Ajaxial.process(node);
                Ajaxial.swapStrategies.innerhtml(document.body, node);
            }
        } else {
            for (const elem of elems) {
                const key = elem.getAttribute("ajxl-history-name") || "default";
                if (!state[key]) { continue }
                let node = Ajaxial.responseConverters.html(state[key])(elem);
                Ajaxial.process(node);
                Ajaxial.swapStrategies.innerhtml(elem, node);
            }
        }
    }
    /** 
        @param {State} state 
        @returns {any}
    */
    storeState(state) { return state; }
    /** @param {Event} ev */
    handle_ajaxial_trigger(ev) {
        const d = ev.detail;
        let path = d.source.getAttribute("ajxl-history") || d.source.getAttribute("ajxl-path");
        if (path === null) { return }
        const action = d.source.getAttribute("[ajxl-history-action]");
        let state = this.getHistoryState();
        state = this.storeState(state);
        if (action === "replace") {
            history.replaceState(state, "", path)
        } else { // push
            history.replaceState(state, "", "")
            history.pushState(null, "", path);
        }
    }
    handle_ajaxial_finish() {
        if (this.throttle_timeout !== undefined) { return }
        this.throttle_timeout = window.setTimeout(() => {
            history.replaceState(this.getHistoryState(), "", "")
            this.throttle_timeout = undefined;
        }, 100);
    }
    /** @returns {State} */
    getHistoryState() {
        let elems = document.querySelectorAll("[ajxl-history-name]");
        let state = {};
        if (elems.length === 0) {
           state.default = document.body.innerHTML;
        } else {
            // TODO: what if there are several elements with the same history
            // name?
            for (const elem of elems) {
                let name = elem.getAttribute("ajxl-history-name");
                if (name === null) { 
                    continue 
                } else if (name.length === 0) {
                    name = "default;"
                }
                state[name] = elem.innerHTML;
            }
        }
        return state;
    }
}()
