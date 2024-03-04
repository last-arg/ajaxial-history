const AjaxialHistory = new class {
    /** @typedef {{[string]: string}} State */
    constructor() {
        /** @type {number | undefined} */
        this.throttle_timeout = undefined;

        document.addEventListener("click", function(ev) {
            // TODO: also limit only to elements with ajxl-history attribute?
            // This would align more with Ajaxial default behaviour which
            // doesn't prevent links (<a>).
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
        @param {State} state 
        @returns {any}
    */
    storeState(state) { return state; }
    /** 
        @param {any} state 
        @returns {State}
    */
    readState(state) { return state }
    /** @param {PopStateEvent} ev */
    async handle_popstate(ev) {
        if (!ev.state) {
            return;
        }
        const state = await this.readState(ev.state);
        const elems = document.querySelectorAll("[ajxl-history-name]");
        if (elems.length === 0) {
            if (state.default) {
                let node = Ajaxial.responseConverters.html(state.default)(document.body);
                Ajaxial.process(node);
                Ajaxial.swapStrategies.innerhtml(document.body, node);
            }
        } else {
            for (const elem of elems) {
                const key = elem.ajxl["history-name"] || "default";
                if (!state[key]) { continue }
                let node = Ajaxial.responseConverters.html(state[key])(elem);
                Ajaxial.process(node);
                Ajaxial.swapStrategies.innerhtml(elem, node);
            }
        }
    }
    /** @param {Event} ev */
    handle_ajaxial_trigger(ev) {
        const d = ev.detail;
        let path = d.source.ajxl.history || d.source.ajxl.path;
        if (path === null) { return }
        const action = d.source.ajxl["history-action"];
        let state = this.constructor.getHistoryState();
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
            history.replaceState(this.constructor.getHistoryState(), "", "")
            this.throttle_timeout = undefined;
        }, 100);
    }
    /** @returns {State} */
    static getHistoryState() {
        let elems = document.querySelectorAll("[ajxl-history-name]");
        let state = {};
        if (elems.length === 0) {
           state.default = document.body.innerHTML;
        } else {
            // TODO: what if there are several elements with the same history
            // name?
            for (const elem of elems) {
                let name = elem.ajxl["history-name"];
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
}


// (async function() {
//     console.log("stream")
//     let str = "hello world"
//     for (let i = 0; i < 100_000; i++) {
//         str += " some_mor" + i;
//     }
//     console.time();
//     const stream = new Blob([ str ], {type: 'text/plain'}).stream();
//     const c = new CompressionStream("gzip");
//     const compressed = stream.pipeThrough(c);
//     let total = 0
//     let total_str = "";
//     let total_arr = []
//     for await (const res of compressed) {
//         total += res.length
//         // total_str += res.toString();
//         // const arr = Array.from(res);
//         // total_arr.push(...res);
//         Array.prototype.push.apply(total_arr, res);
//         // total_arr = total_arr.concat(...res);
//         // total_arr = total_arr.concat(Array.from(res));
//     }
//     console.timeEnd();
//     console.log("string len", str.length)
//     console.log("compressed len", total)
//     console.log("total string len", total_str.length)
//     console.log("total arr len", total_arr.length)
//     console.log("total arr (string) len", JSON.stringify(total_arr).length)
//     console.log("uint8array len", new Uint8Array(total_arr).length)
//     console.log(total_arr)
// }())

