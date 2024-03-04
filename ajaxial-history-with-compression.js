// Load this after ajaxial-history extension

// TODO: would there be a benefit of storing Uint8Array instead of Array?

// Byte length when input will be compressed.
// compression_threshold value 0 means compression is disabled
AjaxialHistory.extra.compression_threshold = 0;
function hasCompressionSupport() {
    return window.DecompressionStream && window.DecompressionStream;
}
AjaxialHistory.readState = async function(state) {
    if (this.extra.compression_threshold > 0 && hasCompressionSupport()) {
        for (const key in state) {
            const content = state[key];
            if (Array.isArray(content)) { 
                const blob_stream = new Blob([ new Uint8Array(content) ]).stream();
                const stream = blob_stream.pipeThrough(new DecompressionStream("gzip"));
                const bytes = []
                for await (const chunk of stream) {
                    Array.prototype.push.apply(bytes, chunk);
                }
                state[key] = new TextDecoder().decode(new Uint8Array(bytes));
            }
        }
    }

    return state;
} 

AjaxialHistory.storeState = async function(state) {
    if (this.extra.compression_threshold > 0 && hasCompressionSupport()) {
        for (const key in state) {
            const content = state[key];
            if (content.length >= this.extra.compression_threshold) {
                const blob_stream = new Blob([ content ], {type: 'text/plain'}).stream();
                const stream = blob_stream.pipeThrough(new CompressionStream("gzip"));
                const bytes = [];
                for await (const chunk of stream) {
                    Array.prototype.push.apply(bytes, chunk);
                }
                state[key] = bytes;
            }
        }
    }

    return state;
} 

