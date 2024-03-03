// HTML attributes:
// - ajxl-history="<path>"
//   - in case empty ajxl-path is used
// - ajxl-history-action: 
//   - push (default)
//   - replace
// - ajxl-history-name="<name>"
//   - in case empty 'default' name is used

const AjaxialHistory = new class {
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
    handleEvent(ev) {
        let type = ev.type;
        if (type.startsWith("ajaxial:")) {
            type = type.split(":")[1];
        }
        this[`handle_${type}`](ev)
    }
    handle_popstate(ev) {
        if (!ev.state) {
            return;
        }
        const elems = document.querySelectorAll("[ajxl-history-name]");
        if (elems.length === 0) {
            if (ev.state.default) {
                let node = Ajaxial.responseConverters.html(ev.state.default)(document.body);
                Ajaxial.process(node);
                Ajaxial.swapStrategies.innerhtml(document.body, node);
            }
        } else {
            for (const elem of elems) {
                const key = elem.getAttribute("ajxl-history-name") || "default";
                if (!ev.state[key]) { continue }
                let node = Ajaxial.responseConverters.html(ev.state[key])(elem);
                Ajaxial.process(node);
                Ajaxial.swapStrategies.innerhtml(elem, node);
            }
        }
    }
    handle_trigger(ev) {
        const d = ev.detail;
        let path = d.source.getAttribute("ajxl-history") || d.source.getAttribute("ajxl-path");
        if (path === null) { return }
        const action = d.source.getAttribute("[ajxl-history-action]");
        const state = this.getHistoryState();
        // saveState();
        if (action === "replace") {
            // storeHistory();
            history.replaceState(state, "", path)
        } else { // push
            // storeHistory();
            history.replaceState(state, "", "")
            history.pushState(null, "", path);
        }
    }
    handle_finish() {
        if (this.throttle_timeout !== undefined) { return }
        this.throttle_timeout = window.setTimeout(() => {
            history.replaceState(this.getHistoryState(), "", "")
            this.throttle_timeout = undefined;
        }, 100);
    }
    getHistoryState() {
        let elems = document.querySelectorAll("[ajxl-history-name]");
        let state = {};
        if (elems.length === 0) {
           state.default = document.body.innerHTML;
        } else {
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

document.addEventListener("DOMContentLoaded", function() {
   document.querySelector("a").click();
})

