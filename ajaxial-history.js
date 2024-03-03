// HTML attributes;
// - ajxl-history=""
// - ajxl-history-action="push"
// - ajxl-history-name="<name>"
console.log("ajaxial history extension", Ajaxial)

document.addEventListener("click", function(ev) {
    if (ev.target.closest("a[ajxl-path]")) {
        ev.preventDefault();
    }
})

window.addEventListener("popstate", (ev) => {
    if (!ev.state) {
        return;
    }
    console.log(ev.type, ev.state);
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
});

function getHistoryState() {
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

document.addEventListener("ajaxial:trigger", function(ev) {
    console.log(ev.type, ev.detail);
    const d = ev.detail;
    let path = d.source.getAttribute("ajxl-history") || d.source.getAttribute("ajxl-path");
    if (path === null) { return }
    const action = d.source.getAttribute("[ajxl-history-action]");
    const state = getHistoryState();
    // saveState();
    if (action === "replace") {
        console.log("replace")
        // storeHistory();
        history.replaceState(state, "", path)
    } else { // push
        // storeHistory();
        history.replaceState(state, "", "")
        history.pushState(null, "", path);
    }
})

document.addEventListener("ajaxial:finish", function() {
    // TODO: Maybe add some throttle to firing this event?
    // Delay is option also, but I think throttle is better.
    history.replaceState(getHistoryState(), "", "")
})


// document.addEventListener("DOMContentLoaded", function() {
//    document.querySelector("a").click();
// })

