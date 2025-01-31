let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let cachedFloat64ArrayMemory0 = null;

function getFloat64ArrayMemory0() {
    if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
        cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64ArrayMemory0;
}

function getArrayF64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}
/**
 *
 * * create array with n elements in  array [a,b]
 *
 * @param {number} a
 * @param {number} b
 * @param {number} n
 * @returns {Float64Array}
 */
export function linspace(a, b, n) {
    const ret = wasm.linspace(a, b, n);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

/**
 *
 * * calculate binomial coefficient (n over k)
 *
 * @param {number} n
 * @param {number} k
 * @returns {number}
 */
export function binomial_coefficient(n, k) {
    const ret = wasm.binomial_coefficient(n, k);
    return ret >>> 0;
}

/**
 *
 * * calculate bernstein coefficient of degree n, index i at position t ([0,1})
 *
 * @param {number} n
 * @param {number} i
 * @param {number} t
 * @returns {number}
 */
export function bernstein_coefficient(n, i, t) {
    const ret = wasm.bernstein_coefficient(n, i, t);
    return ret;
}

/**
 *
 * * calculate all bernstein coefficients of degree n at position t ([0,1])
 * * @returns array of lenth n+1
 *
 * @param {number} n
 * @param {number} t
 * @returns {Float64Array}
 */
export function bernstein_coefficients(n, t) {
    const ret = wasm.bernstein_coefficients(n, t);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
}

let WASM_VECTOR_LEN = 0;

function passArrayF64ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 8, 8) >>> 0;
    getFloat64ArrayMemory0().set(arg, ptr / 8);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_0.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 *
 * * calculate point on bezier curve defined by control points q at position t
 *
 * @param {Float64Array} q
 * @param {number} t
 * @returns {Float64Array}
 */
export function bezier_point(q, t) {
    const ptr0 = passArrayF64ToWasm0(q, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.bezier_point(ptr0, len0, t);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 *
 * * calculate normalized tangent vector for bezier at position t
 *
 * @param {Float64Array} qf
 * @param {number} t
 * @returns {Float64Array}
 */
export function bezier_tangent(qf, t) {
    const ptr0 = passArrayF64ToWasm0(qf, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.bezier_tangent(ptr0, len0, t);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 *
 * * calculate normalized vector for bezier at position t
 *
 * @param {Float64Array} q
 * @param {number} t
 * @returns {Float64Array}
 */
export function bezier_norm(q, t) {
    const ptr0 = passArrayF64ToWasm0(q, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.bezier_norm(ptr0, len0, t);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

/**
 *
 * * calculate bezier control points from points on curve
 *
 * @param {Float64Array} pf
 * @returns {Float64Array}
 */
export function bezier_reverse(pf) {
    const ptr0 = passArrayF64ToWasm0(pf, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.bezier_reverse(ptr0, len0);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v2;
}

export function __wbindgen_error_new(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

export function __wbindgen_init_externref_table() {
    const table = wasm.__wbindgen_export_0;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

