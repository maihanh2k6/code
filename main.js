/*! css-doodle@0.15.3 */ ! function(e, t) {
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).CSSDoodle = t();
}(this, (function() {
    "use strict";

    function e(e) {
        let t = 0,
            n = 1,
            r = 1;
        return {
            curr: (n = 0) => e[t + n],
            end: () => e.length <= t,
            info: () => ({
                index: t,
                col: n,
                line: r
            }),
            index: e => void 0 === e ? t : t = e,
            next() {
                let i = e[t++];
                return "\n" == i ? (r++, n = 0) : n++, i;
            }
        };
    }

    function t(t) {
        t = t.trim();
        let n = [];
        if (!/^var\(/.test(t)) return n;
        let r = e(t);
        try {
            n = function(e) {
                let t = "",
                    n = [],
                    r = [],
                    i = {};
                for (; !e.end();) {
                    let s = e.curr();
                    if ("(" == s) n.push(s), t = "";
                    else if (")" == s || "," == s) {
                        if (/^\-\-.+/.test(t) && (i.name ? (i.alternative || (i.alternative = []), i.alternative.push({
                                name: t
                            })) : i.name = t), ")" == s) {
                            if ("(" != n[n.length - 1]) throw new Error("bad match");
                            n.pop();
                        }
                        "," == s && (n.length || (r.push(i), i = {})), t = "";
                    } else /\s/.test(s) || (t += s);
                    e.next();
                }
                return n.length ? [] : (i.name && r.push(i), r);
            }(r);
        } catch (e) {
            console.warn(e && e.message || "Bad variables.");
        }
        return n;
    }

    function n(e) {
        return {
            make_array: function(e) {
                return Array.isArray(e) ? e : [e];
            },
            join: function(e, t = "\n") {
                return (e || []).join(t);
            },
            last: function(e, t = 1) {
                return e[e.length - t];
            },
            first: function(e) {
                return e[0];
            },
            clone: function(e) {
                return JSON.parse(JSON.stringify(e));
            },
            shuffle: function(t) {
                let n = Array.from ? Array.from(t) : t.slice(),
                    r = t.length;
                for (; r;) {
                    let t = ~~(e() * r--),
                        i = n[r];
                    n[r] = n[t], n[t] = i;
                }
                return n;
            },
            flat_map: function(e, t) {
                return Array.prototype.flatMap ? e.flatMap(t) : e.reduce(((e, n) => e.concat(t(n))), []);
            },
            remove_empty_values: function(e) {
                return e.filter((e => null != e && String(e).trim().length));
            }
        };
    }
    let {
        first: r,
        last: i,
        clone: s
    } = n();
    const o = {
            func: (e = "") => ({
                type: "func",
                name: e,
                arguments: []
            }),
            argument: () => ({
                type: "argument",
                value: []
            }),
            text: (e = "") => ({
                type: "text",
                value: e
            }),
            pseudo: (e = "") => ({
                type: "pseudo",
                selector: e,
                styles: []
            }),
            cond: (e = "") => ({
                type: "cond",
                name: e,
                styles: [],
                arguments: []
            }),
            rule: (e = "") => ({
                type: "rule",
                property: e,
                value: []
            }),
            keyframes: (e = "") => ({
                type: "keyframes",
                name: e,
                steps: []
            }),
            step: (e = "") => ({
                type: "step",
                name: e,
                styles: []
            })
        },
        l = {
            white_space: e => /[\s\n\t]/.test(e),
            line_break: e => /\n/.test(e),
            number: e => !isNaN(e),
            pair: e => ['"', "(", ")", "'"].includes(e),
            pair_of: (e, t) => ({
                '"': '"',
                "'": "'",
                "(": ")"
            } [e] == t)
        },
        a = {
            \u03c0: Math.PI,
            "\u220f": Math.PI
        };

    function u(e, {
        col: t,
        line: n
    }) {
        console.warn(`(at line ${n}, column ${t}) ${e}`);
    }

    function c(e) {
        return function(t, n) {
            let r = t.index(),
                i = "";
            for (; !t.end();) {
                let n = t.next();
                if (e(n)) break;
                i += n;
            }
            return n && t.index(r), i;
        };
    }

    function h(e, t) {
        return c((e => /[^\w@]/.test(e)))(e, t);
    }

    function p(e) {
        return c((e => /[\s\{]/.test(e)))(e);
    }

    function d(e, t) {
        return c((e => l.line_break(e) || "{" == e))(e, t);
    }

    function f(e, t) {
        let n, r = o.step();
        for (; !e.end() && "}" != (n = e.curr());)
            if (l.white_space(n)) e.next();
            else {
                if (r.name.length) {
                    if (r.styles.push(S(e, t)), "}" == e.curr()) break;
                } else r.name = k(e);
                e.next();
            } return r;
    }

    function m(e, t) {
        const n = [];
        let r;
        for (; !e.end() && "}" != (r = e.curr());) l.white_space(r) || n.push(f(e, t)), e.next();
        return n;
    }

    function g(e, t) {
        let n, r = o.keyframes();
        for (; !e.end() && "}" != (n = e.curr());)
            if (r.name.length) {
                if ("{" == n) {
                    e.next(), r.steps = m(e, t);
                    break;
                }
                e.next();
            } else if (h(e), r.name = p(e), !r.name.length) {
            u("missing keyframes name", e.info());
            break;
        }
        return r;
    }

    function y(e, t = {}) {
        for (e.next(); !e.end();) {
            let n = e.curr();
            if (t.inline) {
                if ("\n" == n) break;
            } else if ("*" == (n = e.curr()) && "/" == e.curr(1)) break;
            e.next();
        }
        t.inline || (e.next(), e.next());
    }

    function v(e) {
        for (e.next(); !e.end();) {
            if (">" == e.curr()) break;
            e.next();
        }
    }

    function _(e) {
        let t, n = "";
        for (; !e.end() && ":" != (t = e.curr());) l.white_space(t) || (n += t), e.next();
        return n;
    }

    function x(e, t, n) {
        let r, u = [],
            c = [],
            h = [],
            p = "";
        for (; !e.end();) {
            if (r = e.curr(), /[\('"`]/.test(r) && "\\" !== e.curr(-1)) h.length && "(" != r && r === i(h) ? h.pop() : h.push(r), p += r;
            else if ("@" != r || n)
                if (n && /[)]/.test(r) || !n && /[,)]/.test(r))
                    if (h.length) ")" == r && h.pop(), p += r;
                    else {
                        if (p.length && (c.length ? c.push(o.text(p)) : c.push(o.text((d = p).trim().length ? l.number(+d) ? +d : d.trim() : d)), p.startsWith("\xb1") && !n)) {
                            let e = p.substr(1),
                                t = s(c);
                            i(t).value = "-" + e, u.push(b(t)), i(c).value = e;
                        }
                        if (u.push(b(c)), [c, p] = [
                                [], ""
                            ], ")" == r) break;
                    }
            else a[r] && !/[0-9]/.test(e.curr(-1)) && (r = a[r]), p += r;
            else c.length || (p = p.trimLeft()), p.length && (c.push(o.text(p)), p = ""), c.push(w(e));
            if (t && ")" == e.curr() && !h.length) {
                c.length && u.push(b(c));
                break;
            }
            e.next();
        }
        var d;
        return u;
    }

    function b(e) {
        let t = e.map((e => {
                if ("text" == e.type && "string" == typeof e.value) {
                    let t = String(e.value);
                    t.includes("`") && (e.value = t = t.replace(/`/g, '"')), e.value = t.replace(/\n+|\s+/g, " ");
                }
                return e;
            })),
            n = r(t) || {},
            s = i(t) || {};
        if ("text" == n.type && "text" == s.type) {
            let e = r(n.value),
                o = i(s.value);
            "string" == typeof n.value && "string" == typeof s.value && l.pair_of(e, o) && (n.value = n.value.slice(1), s.value = s.value.slice(0, s.value.length - 1), t.cluster = !0);
        }
        return t;
    }

    function w(e) {
        let t, n = o.func(),
            r = "@",
            i = !1;
        for (e.next(); !e.end();) {
            t = e.curr();
            let s = "." == t && "@" == e.curr(1),
                o = e.curr(1);
            if ("(" == t || s) {
                i = !0, e.next(), n.arguments = x(e, s, "@doodle" === r || "@shaders" == r);
                break;
            }
            if (!i && "(" !== o && !/[0-9a-zA-Z_\-.]/.test(o)) {
                r += t;
                break;
            }
            r += t, e.next();
        }
        let {
            fname: s,
            extra: l
        } = function(e) {
            let t = "",
                n = "";
            if (/\D$/.test(e) && !/\d+x\d+/.test(e) || Math[e.substr(1)]) return {
                fname: e,
                extra: n
            };
            for (let r = e.length - 1; r >= 0; r--) {
                let i = e[r],
                    s = e[r - 1],
                    o = e[r + 1];
                if (!(/[\d.]/.test(i) || "x" == i && /\d/.test(s) && /\d/.test(o))) {
                    t = e.substring(0, r + 1);
                    break;
                }
                n = i + n;
            }
            return {
                fname: t,
                extra: n
            };
        }(r);
        return n.name = s, l.length && n.arguments.unshift([{
            type: "text",
            value: l
        }]), n.position = e.info().index, n;
    }

    function $(e) {
        let t, n = o.text(),
            r = 0,
            i = !0;
        const s = [],
            u = [];
        for (s[r] = []; !e.end();)
            if (t = e.curr(), i && l.white_space(t)) e.next();
            else {
                if (i = !1, "\n" != t || l.white_space(e.curr(-1)))
                    if ("," != t || u.length) {
                        if (/[;}]/.test(t)) {
                            n.value.length && (s[r].push(n), n = o.text());
                            break;
                        }
                        "@" == t ? (n.value.length && (s[r].push(n), n = o.text()), s[r].push(w(e))) : l.white_space(t) && l.white_space(e.curr(-1)) || ("(" == t && u.push(t), ")" == t && u.pop(), a[t] && !/[0-9]/.test(e.curr(-1)) && (t = a[t]), n.value += t);
                    } else n.value.length && (s[r].push(n), n = o.text()), s[++r] = [], i = !0;
                else n.value += " ";
                e.next();
            } return n.value.length && s[r].push(n), s;
    }

    function k(e) {
        let t, n = "";
        for (; !e.end() && "{" != (t = e.curr());) l.white_space(t) || (n += t), e.next();
        return n;
    }

    function E(e) {
        let t, n = {
            name: "",
            arguments: []
        };
        for (; !e.end();) {
            if ("(" == (t = e.curr())) e.next(), n.arguments = x(e);
            else {
                if (/[){]/.test(t)) break;
                l.white_space(t) || (n.name += t);
            }
            e.next();
        }
        return n;
    }

    function z(e, t) {
        let n, r = o.pseudo();
        for (; !e.end() && "}" != (n = e.curr());)
            if (l.white_space(n)) e.next();
            else {
                if (r.selector) {
                    let n = S(e, t);
                    if ("@use" == n.property ? r.styles = r.styles.concat(n.value) : r.styles.push(n), "}" == e.curr()) break;
                } else r.selector = k(e);
                e.next();
            } return r;
    }

    function S(e, t) {
        let n, r = o.rule();
        for (; !e.end() && ";" != (n = e.curr());) {
            if (r.property.length) {
                r.value = $(e);
                break;
            }
            if (r.property = _(e), "@use" == r.property) {
                r.value = R(e, t);
                break;
            }
            e.next();
        }
        return r;
    }

    function T(e, t) {
        let n, r = o.cond();
        for (; !e.end() && "}" != (n = e.curr());) {
            if (r.name.length)
                if (":" == n) {
                    let t = z(e);
                    t.selector && r.styles.push(t);
                } else if ("@" != n || d(e, !0).includes(":")) {
                if (!l.white_space(n)) {
                    let n = S(e, t);
                    if (n.property && r.styles.push(n), "}" == e.curr()) break;
                }
            } else r.styles.push(T(e));
            else Object.assign(r, E(e));
            e.next();
        }
        return r;
    }

    function A(e, t) {
        let n = "";
        return e && e.get_variable && (n = e.get_variable(t)), n;
    }

    function j(e, n) {
        e.forEach && e.forEach((e => {
            if ("text" == e.type && e.value) {
                let r = t(e.value);
                e.value = r.reduce(((e, t) => {
                    let r, i = "",
                        s = "";
                    i = A(n, t.name), !i && t.alternative && t.alternative.every((e => {
                        if (s = A(n, e.name), s) return i = s, !1;
                    }));
                    try {
                        r = P(i, n);
                    } catch (e) {}
                    return r && e.push.apply(e, r), e;
                }), []);
            }
            "func" == e.type && e.arguments && e.arguments.forEach((e => {
                j(e, n);
            }));
        }));
    }

    function R(e, t) {
        return e.next(), ($(e) || []).reduce(((e, n) => {
            j(n, t);
            let [r] = n;
            return r.value && r.value.length && e.push(...r.value), e;
        }), []);
    }

    function P(t, n) {
        const r = e(t),
            i = [];
        for (; !r.end();) {
            let e = r.curr();
            if (l.white_space(e)) r.next();
            else {
                if ("/" == e && "*" == r.curr(1)) y(r);
                else if ("/" == e && "/" == r.curr(1)) y(r, {
                    inline: !0
                });
                else if (":" == e) {
                    let e = z(r, n);
                    e.selector && i.push(e);
                } else if ("@" == e && "@keyframes" === h(r, !0)) {
                    let e = g(r, n);
                    i.push(e);
                } else if ("@" != e || d(r, !0).includes(":")) {
                    if ("<" == e) v(r);
                    else if (!l.white_space(e)) {
                        let e = S(r, n);
                        e.property && i.push(e);
                    }
                } else {
                    let e = T(r, n);
                    e.name.length && i.push(e);
                }
                r.next();
            }
        }
        return i;
    }

    function M(e, t, n) {
        return Math.max(t, Math.min(n, e));
    }

    function C(e, t, n) {
        let r = 0,
            i = e,
            s = e => e > 0 && e < 1 ? .1 : 1,
            o = arguments.length;
        1 == o && ([e, t] = [s(e), e]), o < 3 && (n = s(e));
        let l = [];
        for (;
            (n >= 0 && e <= t || n < 0 && e > t) && (l.push(e), e += n, !(r++ >= 1e3)););
        return l.length || l.push(i), l;
    }

    function L(e) {
        return /^[a-zA-Z]$/.test(e);
    }

    function I(e) {
        return null == e;
    }

    function O(e) {
        let t = () => e;
        return t.lazy = !0, t;
    }

    function U(e, t, n) {
        return "c-" + e + "-" + t + "-" + n;
    }

    function D(e) {
        for (; e && e.value;) return D(e.value);
        return I(e) ? "" : e;
    }

    function N(e, t, n = 0) {
        let r = new Image;
        r.crossOrigin = "anonymous", r.src = e, r.onload = function() {
            setTimeout(t, n);
        };
    }

    function B() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }
    const [F, H, W] = [1, 32, 1024];

    function X(e) {
        let [t, n, r] = (e + "").replace(/\s+/g, "").replace(/[,\uff0cxX]+/g, "x").split("x").map((e => parseInt(e)));
        const i = 1 == t || 1 == n ? W : H,
            s = 1 == t && 1 == n ? W : F,
            o = {
                x: M(t || F, 1, i),
                y: M(n || t || F, 1, i),
                z: M(r || F, 1, s)
            };
        return Object.assign({}, o, {
            count: o.x * o.y * o.z
        });
    }

    function q(e) {
        return '"' == e || "'" == e;
    }

    function G(e) {
        return e[e.length - 1];
    }

    function V(e, t) {
        return `url("data:image/svg+xml;utf8,${encodeURIComponent(e) + (t ?`#${t}`:"")}")`;
    }

    function Y(e) {
        const t = 'xmlns="http://www.w3.org/2000/svg"';
        return e.includes("<svg") || (e = `<svg ${t}>${e}</svg>`), e.includes("xmlns") || (e = e.replace(/<svg([\s>])/, `<svg ${t}$1`)), e;
    }

    function Z(e) {
        function t(e, t, n) {
            return e * (1 - n) + t * n;
        }
        return {
            lerp: t,
            rand: function(n = 0, r = n) {
                return 1 == arguments.length && (1 == n ? n = 0 : n < 1 ? n /= 10 : n = 1), t(n, r, e());
            },
            nrand: function(t = 0, n = 1) {
                let r = 0,
                    i = 0;
                for (; 0 === r;) r = e();
                for (; 0 === i;) i = e();
                const s = Math.sqrt(-2 * Math.log(r)),
                    o = 2 * Math.PI * i;
                return t + n * (s * Math.cos(o));
            },
            pick: function(...t) {
                let n = t.reduce(((e, t) => e.concat(t)), []);
                return n[~~(e() * n.length)];
            },
            unique_id: function(e = "") {
                return e + Math.random().toString(32).substr(2);
            }
        };
    }

    function J(e) {
        return (...t) => {
            let n = function(e) {
                let t = "";
                return e.some((e => {
                    let n = String(e).trim();
                    if (!n) return "";
                    let r = n.match(/\d(\D+)$/);
                    return t = r ? r[1] : "";
                })), t;
            }(t);
            return function(e, t) {
                return (...n) => {
                    n = n.map((e => Number(String(e).replace(/\D+$/g, ""))));
                    let r = e.apply(null, n);
                    return t.length ? Array.isArray(r) ? r.map((e => e + t)) : r + t : r;
                };
            }(e, n).apply(null, t);
        };
    }

    function K(e) {
        return (...t) => {
            let n = t.map((e => String(e).charCodeAt(0))),
                r = e.apply(null, n);
            return Array.isArray(r) ? r.map((e => String.fromCharCode(e))) : String.fromCharCode(r);
        };
    }
    let {
        last: Q
    } = n();
    const ee = {
        \u03c0: Math.PI,
        "\u220f": Math.PI
    };

    function te(e, t) {
        return re(ie(e), Object.assign(ee, t));
    }
    const ne = {
        "^": 4,
        "*": 3,
        "/": 3,
        "%": 3,
        "+": 2,
        "-": 2,
        "(": 1,
        ")": 1
    };

    function re(e, t, n = []) {
        let r = [];
        for (; e.length;) {
            let {
                name: s,
                value: o,
                type: l
            } = e.shift();
            if ("variable" === l) {
                let e = t[o];
                void 0 === e && (e = Math[o]), void 0 === e && (e = oe(o, t)), void 0 === e && (e = 0), "number" != typeof e && (n.push(e), (i = n)[0] == i[2] && i[1] == i[3] ? (e = 0, n = []) : e = re(ie(e), t, n)), r.push(e);
            } else if ("function" === l) {
                let e, n = o.map((e => re(e, t))),
                    i = s.split(".");
                for (; e = i.pop();) {
                    if (!e) continue;
                    let r = t[e] || Math[e];
                    n = "function" == typeof r ? Array.isArray(n) ? r(...n) : r(n) : 0;
                }
                r.push(n);
            } else if (/\d+/.test(o)) r.push(o);
            else {
                let e = r.pop(),
                    t = r.pop();
                r.push(se(o, Number(t), Number(e)));
            }
        }
        var i;
        return r[0];
    }

    function ie(e) {
        let t = function(e) {
            let t = String(e),
                n = [],
                r = "";
            for (let e = 0; e < t.length; ++e) {
                let i = t[e];
                if (ne[i])
                    if ("-" == i && "e" == t[e - 1]) r += i;
                    else if (n.length || r.length || !/[+-]/.test(i)) {
                    let {
                        type: e,
                        value: t
                    } = Q(n) || {};
                    "operator" == e && !r.length && /[^()]/.test(i) && /[^()]/.test(t) ? r += i : (r.length && (n.push({
                        type: "number",
                        value: r
                    }), r = ""), n.push({
                        type: "operator",
                        value: i
                    }));
                } else r += i;
                else /\S/.test(i) && ("," == i ? (n.push({
                    type: "number",
                    value: r
                }), r = "", n.push({
                    type: "comma",
                    value: i
                })) : r += i);
            }
            return r.length && n.push({
                type: "number",
                value: r
            }), n;
        }(e);
        const n = [],
            r = [];
        for (let e = 0; e < t.length; ++e) {
            let {
                type: i,
                value: s
            } = t[e], o = t[e + 1] || {};
            if ("number" == i)
                if ("(" == o.value && /[^\d.]/.test(s)) {
                    let n = "",
                        i = [],
                        o = [];
                    for (e += 1; void 0 !== t[e++];) {
                        let r = t[e];
                        if (void 0 === r) break;
                        let s = r.value;
                        if (")" == s) {
                            if (!i.length) break;
                            i.pop(), n += s;
                        } else if ("(" == s && i.push(s), "," != s || i.length) n += s;
                        else {
                            let e = ie(n);
                            e.length && o.push(e), n = "";
                        }
                    }
                    n.length && o.push(ie(n)), r.push({
                        type: "function",
                        name: s,
                        value: o
                    });
                } else /[^\d.]/.test(s) ? r.push({
                    type: "variable",
                    value: s
                }) : r.push({
                    type: "number",
                    value: s
                });
            else if ("operator" == i)
                if ("(" == s) n.push(s);
                else if (")" == s) {
                for (; n.length && "(" != Q(n);) r.push({
                    type: "operator",
                    value: n.pop()
                });
                n.pop();
            } else {
                for (; n.length && ne[Q(n)] >= ne[s];) {
                    let e = n.pop();
                    /[()]/.test(e) || r.push({
                        type: "operator",
                        value: e
                    });
                }
                n.push(s);
            }
        }
        for (; n.length;) r.push({
            type: "operator",
            value: n.pop()
        });
        return r;
    }

    function se(e, t, n) {
        switch (e) {
            case "+":
                return t + n;
            case "-":
                return t - n;
            case "*":
                return t * n;
            case "/":
                return t / n;
            case "%":
                return t % n;
            case "^":
                return Math.pow(t, n);
        }
    }

    function oe(e, t) {
        let [n, r, i] = e.match(/([\d.]+)(.*)/) || [], s = t[i];
        return void 0 === s ? s : "number" == typeof s ? Number(r) * s : r * re(ie(s), t);
    }
    const le = {};

    function ae(e, t) {
        return (...n) => {
            let r = e + n.join("-");
            return le[r] ? le[r] : le[r] = t.apply(null, n);
        };
    }
    const {
        last: ue,
        flat_map: ce
    } = n();

    function he(e) {
        return (...t) => e.apply(null, ce(t, (e => String(e).startsWith("[") ? de(e) : e)));
    }

    function pe(e, t) {
        return {
            type: e,
            value: t
        };
    }
    const de = ae("build_range", (e => {
        let t = function(e) {
            let t = String(e),
                n = [],
                r = [];
            if (!t.startsWith("[") || !t.endsWith("]")) return n;
            for (let e = 1; e < t.length - 1; ++e) {
                let i = t[e];
                if ("-" != i || "-" != t[e - 1])
                    if ("-" != i)
                        if ("-" != ue(r)) r.length && n.push(pe("char", r.pop())), r.push(i);
                        else {
                            r.pop();
                            let e = r.pop();
                            n.push(e ? pe("range", [e, i]) : pe("char", i));
                        }
                else r.push(i);
            }
            return r.length && n.push(pe("char", r.pop())), n;
        }(e);
        return ce(t, (({
            type: e,
            value: t
        }) => {
            if ("char" == e) return t;
            let [n, r] = t, i = !1;
            n > r && ([n, r] = [r, n], i = !0);
            let s = K(C)(n, r);
            return i && s.reverse(), s;
        }));
    }));
    class fe {
        constructor(e) {
            this.prev = this.next = null, this.data = e;
        }
    }
    class me {
        constructor(e = 20) {
            this._limit = e, this._size = 0;
        }
        push(e) {
            this._size >= this._limit && (this.root = this.root.next, this.root.prev = null);
            let t = new fe(e);
            this.root ? (t.prev = this.tail, this.tail.next = t, this.tail = t) : this.root = this.tail = t, this._size++;
        }
        last(e = 1) {
            let t = this.tail;
            for (; --e && t.prev;) t = t.prev;
            return t.data;
        }
    }
    const {
        cos: ge,
        sin: ye,
        sqrt: ve,
        atan2: _e,
        pow: xe,
        PI: be
    } = Math, we = be / 180;

    function $e(e, t) {
        "function" == typeof arguments[0] && (t = e, e = {}), t || (t = e => [ge(e), ye(e)]);
        let n, r, i = e.split || 120,
            s = e.scale || 1,
            o = we * (e.start || 0),
            l = e.deg ? e.deg * we : be / (i / 2),
            a = [],
            u = ([e, t], n) => {
                a.push(50 * e * n + 50 + "% " + (50 * t * n + 50) + "%");
            };
        for (let e = 0; e < i; ++e) {
            let r = t(o - l * e, e);
            e || (n = r), u(r, s);
        }
        if (void 0 !== e.frame) {
            u(n, s);
            let a = (e.frame || 1) / 100;
            a <= 0 && (a = .002);
            for (let e = 0; e < i; ++e) {
                let n = o + l * e,
                    [i, c] = t(n, e),
                    h = _e(c, i),
                    p = [i - a * ge(h), c - a * ye(h)];
                e || (r = p), u(p, s);
            }
            u(r, s), u(n, s);
        }
        return e.type = ke(e["fill-rule"]), e.type ? `polygon(${e.type}, ${a.join(",")})` : `polygon(${a.join(",")})`;
    }

    function ke(e) {
        return "nonzero" === e || "evenodd" == e ? e : "";
    }

    function Ee(e, t, n) {
        let r = we * n;
        return [e * ge(r) - t * ye(r), t * ge(r) + e * ye(r)];
    }
    const ze = {
        circle: () => "circle(49%)",
        triangle: () => $e({
            split: 3,
            start: -90
        }, (e => [1.1 * ge(e), 1.1 * ye(e) + .2])),
        rhombus: () => $e({
            split: 4
        }),
        pentagon: () => $e({
            split: 5,
            start: 54
        }),
        hexgon: () => $e({
            split: 6,
            start: 30
        }),
        hexagon: () => $e({
            split: 6,
            start: 30
        }),
        heptagon: () => $e({
            split: 7,
            start: -90
        }),
        octagon: () => $e({
            split: 8,
            start: 22.5
        }),
        star: () => $e({
            split: 5,
            start: 54,
            deg: 144
        }),
        diamond: () => "polygon(50% 5%, 80% 50%, 50% 95%, 20% 50%)",
        cross: () => "polygon(\n 5% 35%, 35% 35%, 35% 5%, 65% 5%,\n 65% 35%, 95% 35%, 95% 65%, 65% 65%,\n 65% 95%, 35% 95%, 35% 65%, 5% 65%\n )",
        clover: (e = 3) => (4 == (e = M(e, 3, 5)) && (e = 2), $e({
            split: 240
        }, (t => {
            let n = ge(e * t) * ge(t),
                r = ge(e * t) * ye(t);
            return 3 == e && (n -= .2), 2 == e && (n /= 1.1, r /= 1.1), [n, r];
        }))),
        hypocycloid(e = 3) {
            let t = 1 - (e = M(e, 3, 6));
            return $e({
                scale: 1 / e
            }, (n => {
                let r = t * ge(n) + ge(t * (n - be)),
                    i = t * ye(n) + ye(t * (n - be));
                return 3 == e && (r = 1.1 * r - .6, i *= 1.1), [r, i];
            }));
        },
        astroid: () => ze.hypocycloid(4),
        infinity: () => $e((e => {
            let t = .7 * ve(2) * ge(e),
                n = xe(ye(e), 2) + 1;
            return [t / n, t * ye(e) / n];
        })),
        heart: () => $e((e => Ee(1.2 * (.75 * xe(ye(e), 3)), 1.1 * (ge(1 * e) * (13 / 18) - ge(2 * e) * (5 / 18) - ge(3 * e) / 18 - ge(4 * e) / 18 + .2), 180))),
        bean: () => $e((e => {
            let [t, n] = [xe(ye(e), 3), xe(ge(e), 3)];
            return Ee((t + n) * ge(e) * 1.3 - .45, (t + n) * ye(e) * 1.3 - .45, -90);
        })),
        bicorn: () => $e((e => Ee(ge(e), xe(ye(e), 2) / (2 + ye(e)) - .5, 180))),
        drop: () => $e((e => Ee(ye(e), (1 + ye(e)) * ge(e) / 1.4, 90))),
        pear: () => $e((e => [ye(e), (1 + ye(e)) * ge(e) / 1.4])),
        fish: () => $e((e => [ge(e) - xe(ye(e), 2) / ve(2), ye(2 * e) / 2])),
        whale: () => $e({
            split: 240
        }, (e => {
            let t = 3.4 * (xe(ye(e), 2) - .5) * ge(e);
            return Ee(ge(e) * t + .75, ye(e) * t * 1.2, 180);
        })),
        bud: (e = 3) => (e = M(e, 3, 10), $e({
            split: 240
        }, (t => [(1 + .2 * ge(e * t)) * ge(t) * .8, (1 + .2 * ge(e * t)) * ye(t) * .8]))),
        alien(...e) {
            let [t = 1, n = 1, r = 1, i = 1, s = 1] = e.map((e => M(e, 1, 9)));
            return $e({
                split: 480,
                type: "evenodd"
            }, (e => [.31 * (ge(e * t) + ge(e * r) + ge(e * s)), .31 * (ye(e * n) + ye(e * i) + ye(e))]));
        }
    };

    function Se(e) {
        return I(e) || "" === e;
    }

    function Te(e) {
        let t = Object.assign({}, e, {
            split: M(parseInt(e.split) || 0, 3, 3600),
            start: 0
        });
        e.degree && (e.rotate = e.degree);
        let n = Se(e.x) ? "cos(t)" : e.x,
            r = Se(e.y) ? "sin(t)" : e.y,
            i = Se(e.r) ? "" : e.r;
        return $e(t, ((t, s) => {
            let o = Object.assign({}, e, {
                    t,
                    \u03b8: t,
                    seq: (...e) => e.length ? e[s % e.length] : ""
                }),
                l = te(n, o),
                a = te(r, o);
            if (i) {
                let e = te(i, o);
                l = e * Math.cos(t), a = e * Math.sin(t);
            }
            return e.rotate && ([l, a] = Ee(l, a, Number(e.rotate) || 0)), e.origin && ([l, a] = function(e, t, n) {
                let [r, i = r] = String(n).split(/[,\s]/).map(Number);
                return [e + (r || 0), t + (i || 0)];
            }(l, a, e.origin)), [l, a];
        }));
    }

    function Ae(e, t) {
        return t ? /[,\uff0c]/.test(e) : /[,\uff0c\s]/.test(e);
    }

    function je(e, t) {
        for (; !e.end() && Ae(e.curr(1), t);) e.next();
    }

    function Re(t, n = !1) {
        I(t) && (t = "");
        const r = e(String(t)),
            i = [],
            s = [];
        let o = "";
        for (; !r.end();) {
            let e = r.curr();
            if (void 0 === e) break;
            "(" == e ? (o += e, s.push(e)) : ")" == e ? (o += e, s.length && s.pop()) : s.length ? o += e : Ae(e, n) ? (i.push(o), o = "", je(r, n)) : o += e, r.next();
        }
        return I(o) || i.push(o), i;
    }

    function Pe(e, t = {}) {
        for (e.next(); !e.end();) {
            let t = e.curr();
            if ("*" == (t = e.curr()) && "/" == e.curr(1)) {
                e.next(), e.next();
                break;
            }
            e.next();
        }
    }
    const Me = {
        name: "cssd-uniform-time",
        "animation-name": "cssd-uniform-time-animation",
        "animation-duration": "31536000000",
        "animation-iteration-count": "infinite",
        "animation-delay": "0s",
        "animation-direction": "normal",
        "animation-fill-mode": "none",
        "animation-play-state": "running",
        "animation-timing-function": "linear"
    };

    function Ce(t) {
        const {
            shuffle: r
        } = n(t), {
            pick: i,
            rand: s,
            nrand: o,
            unique_id: l
        } = Z(t), a = {
            index: ({
                count: e
            }) => t => e,
            row: ({
                y: e
            }) => t => e,
            col: ({
                x: e
            }) => t => e,
            depth: ({
                z: e
            }) => t => e,
            size: ({
                grid: e
            }) => t => e.count,
            "size-row": ({
                grid: e
            }) => t => e.y,
            "size-col": ({
                grid: e
            }) => t => e.x,
            "size-depth": ({
                grid: e
            }) => t => e.z,
            id: ({
                x: e,
                y: t,
                z: n
            }) => r => U(e, t, n),
            n: ({
                extra: e
            }) => t => e ? e[0] : "@n",
            nx: ({
                extra: e
            }) => t => e ? e[1] : "@nx",
            ny: ({
                extra: e
            }) => t => e ? e[2] : "@ny",
            N: ({
                extra: e
            }) => t => e ? e[3] : "@N",
            repeat: u(""),
            multiple: u(","),
            "multiple-with-space": u(" "),
            pick: ({
                context: e
            }) => he(((...t) => c(e, "last_pick", i(t)))),
            "pick-n"({
                context: e,
                extra: t,
                position: n
            }) {
                let r = "pn-counter" + n;
                return he(((...n) => {
                    e[r] || (e[r] = 0), e[r] += 1;
                    let i = n.length,
                        [s] = t || [],
                        o = n[((void 0 === s ? e[r] : s) - 1) % i];
                    return c(e, "last_pick", o);
                }));
            },
            "pick-d"({
                context: e,
                extra: t,
                position: n
            }) {
                let i = "pd-counter" + n,
                    s = "pd-values" + n;
                return he(((...n) => {
                    e[i] || (e[i] = 0), e[i] += 1, e[s] || (e[s] = r(n));
                    let o = n.length,
                        [l] = t || [],
                        a = ((void 0 === l ? e[i] : l) - 1) % o,
                        u = e[s][a];
                    return c(e, "last_pick", u);
                }));
            },
            "last-pick": ({
                context: e
            }) => (t = 1) => {
                let n = e.last_pick;
                return n ? n.last(t) : "";
            },
            rand: ({
                context: e
            }) => (...t) => {
                let n = (t.every(L) ? K : J)(s).apply(null, t);
                return c(e, "last_rand", n);
            },
            nrand: ({
                context: e
            }) => (...t) => {
                let n = (t.every(L) ? K : J)(o).apply(null, t);
                return c(e, "last_rand", n);
            },
            "rand-int": ({
                context: e
            }) => (...t) => {
                let n = (t.every(L) ? K : J)(((...e) => Math.round(s(...e)))).apply(null, t);
                return c(e, "last_rand", n);
            },
            "nrand-int": ({
                context: e
            }) => (...t) => {
                let n = (t.every(L) ? K : J)(((...e) => Math.round(o(...e)))).apply(null, t);
                return c(e, "last_rand", n);
            },
            "last-rand": ({
                context: e
            }) => (t = 1) => {
                let n = e.last_rand;
                return n ? n.last(t) : "";
            },
            stripe: () => (...e) => {
                let t, n = e.map(D),
                    r = n.length,
                    i = 0,
                    s = [];
                if (!r) return "";
                n.forEach((e => {
                    let [t, n] = Re(e);
                    void 0 !== n ? s.push(n) : i += 1;
                }));
                let o = s.length ? `(100% - ${s.join(" - ")}) / ${i}` : `100% / ${r}`;
                return n.map(((e, n) => {
                    if (s.length) {
                        let [n, r] = Re(e);
                        return t = (t ? t + " + " : "") + (void 0 !== r ? r : o), `${n} 0 calc(${t})`;
                    }
                    return `${e} 0 ${100 / r * (n + 1)}%`;
                })).join(",");
            },
            calc: () => e => te(D(e)),
            hex: () => e => parseInt(D(e)).toString(16),
            svg: O((e => {
                if (void 0 === e) return "";
                return V(Y(D(e()).trim()));
            })),
            "svg-filter": O((e => {
                if (void 0 === e) return "";
                let t = l("filter-");
                return V(Y(D(e()).trim()).replace(/<filter([\s>])/, `<filter id="${t}"$1`), t);
            })),
            var: () => e => `var(${D(e)})`,
            t: () => e => `var(--${Me.name})`,
            shape: () => ae("shape-function", ((t = "", ...n) => {
                if (!(t = String(t).trim()).length) return "polygon()";
                if ("function" == typeof ze[t]) return ze[t](n); {
                    let r = t,
                        i = n.join(",");
                    return i.length && (r = t + "," + i), Te(function(t) {
                        const n = e(t);
                        let r = "",
                            i = {},
                            s = "",
                            o = "";
                        for (; !n.end();) {
                            let e = n.curr();
                            "/" == e && "*" == n.curr(1) ? Pe(n) : ":" == e ? (s = r, r = "") : ";" == e ? (o = r, s = s.trim(), o = o.trim(), s.length && o.length && (i[s] = o), s = o = r = "") : r += e, n.next();
                        }
                        return s = s.trim(), r = r.trim(), s.length && r.length && (i[s] = r), i;
                    }(r));
                }
            })),
            doodle: () => e => e,
            shaders: () => e => e,
            path: () => e => e
        };

        function u(e) {
            return O(((t, n) => {
                if (!n || !t) return "";
                return function(e, t) {
                    let [n, r = 1] = String(e).split("x");
                    n = M(parseInt(n) || 1, 1, 65536), r = M(parseInt(r) || 1, 1, 65536);
                    let i = n * r,
                        s = [],
                        o = 1;
                    for (let e = 1; e <= r; ++e)
                        for (let r = 1; r <= n; ++r) s.push(t(o++, r, e, i));
                    return s;
                }(D(t()), ((e, t, r, i) => D(n(e, t, r, i)))).join(e);
            }));
        }

        function c(e, t, n) {
            return e[t] || (e[t] = new me), e[t].push(n), n;
        }
        return h = a, p = {
            m: "multiple",
            M: "multiple-with-space",
            r: "rand",
            rn: "nrand",
            ri: "rand-int",
            rni: "nrand-int",
            lr: "last-rand",
            p: "pick",
            pn: "pick-n",
            pd: "pick-d",
            lp: "last-pick",
            rep: "repeat",
            i: "index",
            x: "col",
            y: "row",
            z: "depth",
            I: "size",
            X: "size-col",
            Y: "size-row",
            Z: "size-depth",
            nr: "rn",
            nri: "nri",
            ms: "multiple-with-space",
            s: "size",
            sx: "size-col",
            sy: "size-row",
            sz: "size-depth",
            "size-x": "size-col",
            "size-y": "size-row",
            "size-z": "size-depth",
            multi: "multiple",
            "pick-by-turn": "pick-n",
            "max-row": "size-row",
            "max-col": "size-col",
            stripes: "stripe",
            strip: "stripe"
        }, Object.keys(p).forEach((e => {
            h[e] = h[p[e]];
        })), h;
        var h, p;
    }
    Me.animation = `\n ${Me["animation-duration"]}ms\n ${Me["animation-timing-function"]} ${Me["animation-delay"]} ${Me["animation-iteration-count"]} ${Me["animation-name"]}`;
    let Le = [];

    function Ie(e) {
        if (!Le.length) {
            let e = new Set;
            for (let t in document.head.style) t.startsWith("-") || e.add(t.replace(/[A-Z]/g, "-$&").toLowerCase());
            e.has("grid-gap") || e.add("grid-gap"), Le = Array.from(e);
        }
        return e && e.test ? Le.filter((t => e.test(t))) : Le;
    }

    function Oe(e) {
        let t = new RegExp(`\\-?${e}\\-?`);
        return Ie(t).map((e => e.replace(t, ""))).reduce(((e, t) => (e[t] = t, e)), {});
    }
    const Ue = Oe("webkit"),
        De = Oe("moz");

    function Ne(e, t) {
        return Ue[e] ? `-webkit-${t} ${t}` : De[e] ? `-moz-${t} ${t}` : t;
    }
    const Be = {
            "4a0": [1682, 2378],
            "2a0": [1189, 1682],
            a0: [841, 1189],
            a1: [594, 841],
            a2: [420, 594],
            a3: [297, 420],
            a4: [210, 297],
            a5: [148, 210],
            a6: [105, 148],
            a7: [74, 105],
            a8: [52, 74],
            a9: [37, 52],
            a10: [26, 37],
            b0: [1e3, 1414],
            b1: [707, 1e3],
            b2: [500, 707],
            b3: [353, 500],
            b4: [250, 353],
            b5: [176, 250],
            b6: [125, 176],
            b7: [88, 125],
            b8: [62, 88],
            b9: [44, 62],
            b10: [31, 44],
            b11: [22, 32],
            b12: [16, 22],
            c0: [917, 1297],
            c1: [648, 917],
            c2: [458, 648],
            c3: [324, 458],
            c4: [229, 324],
            c5: [162, 229],
            c6: [114, 162],
            c7: [81, 114],
            c8: [57, 81],
            c9: [40, 57],
            c10: [28, 40],
            c11: [22, 32],
            c12: [16, 22],
            d0: [764, 1064],
            d1: [532, 760],
            d2: [380, 528],
            d3: [264, 376],
            d4: [188, 260],
            d5: [130, 184],
            d6: [92, 126],
            letter: [216, 279],
            legal: [216, 356],
            "junior-legal": [203, 127],
            ledger: [279, 432],
            tabloid: [279, 432],
            executive: [190, 254],
            postcard: [100, 148],
            "business-card": [54, 90],
            poster: [390, 540]
        },
        Fe = {
            portrait: "p",
            pt: "p",
            p: "p",
            landscape: "l",
            ls: "l",
            l: "l"
        };
    var He = {
        "@size"(e, {
            is_special_selector: t
        }) {
            let [n, r = n] = Re(e);
            return Be[n] && ([n, r] = function(e, t) {
                e = String(e).toLowerCase();
                let [n, r] = Be[e] || [];
                return "p" == Fe[t] && ([r, n] = [n, r]), [r, n].map((e => e + "mm"));
            }(n, r)), `\n width:${n};height:${r};${t ? "":`\n --internal-cell-width:${n};--internal-cell-height:${r};`}`;
        },
        "@min-size"(e) {
            let [t, n = t] = Re(e);
            return `min-width:${t};min-height:${n};`;
        },
        "@max-size"(e) {
            let [t, n = t] = Re(e);
            return `max-width:${t};max-height:${n};`;
        },
        "@place-cell": (() => {
            let e = {
                    center: "50%",
                    0: "0%",
                    left: "0%",
                    right: "100%",
                    top: "50%",
                    bottom: "50%"
                },
                t = {
                    center: "50%",
                    0: "0%",
                    top: "0%",
                    bottom: "100%",
                    left: "50%",
                    right: "50%"
                };
            return n => {
                let [r, i = "50%"] = Re(n);
                r = e[r] || r, i = t[i] || i;
                const s = "var(--internal-cell-width, 25%)",
                    o = "var(--internal-cell-height, 25%)";
                return `\n position:absolute;left:${r};top:${i};width:${s};height:${o};margin-left:calc(${s} / -2) !important;margin-top:calc(${o} / -2) !important;grid-area:unset !important;`;
            };
        })(),
        "@grid"(e, t) {
            let [n, ...r] = e.split("/").map((e => e.trim()));
            return r = r.join(" / "), {
                grid: X(n),
                size: r ? this["@size"](r, t) : ""
            };
        },
        "@shape": ae("shape-property", (e => {
            let [t, ...n] = Re(e), r = "clip-path";
            return "function" != typeof ze[t] ? "" : Ne(r, `${r}:${ze[t](...n)};`) + "overflow:hidden;";
        })),
        "@use"(e) {
            if (e.length > 2) return e;
        }
    };

    function We(e, t, n) {
        let r = function(e) {
            return t => String(e).replace(/(\d+)(n)/g, "$1*" + t).replace(/n/g, t);
        }(e);
        for (let e = 0; e <= n; ++e)
            if (te(r(e)) == t) return !0;
    }
    const Xe = {
        even: e => !(e % 2),
        odd: e => !!(e % 2)
    };

    function qe(e) {
        return /^(even|odd)$/.test(e);
    }
    var Ge = Object.getOwnPropertyNames(Math).reduce(((e, t) => (e[t] = () => (...e) => (e = e.map(D), "number" == typeof Math[t] ? Math[t] : Math[t].apply(null, e.map(te))), e)), {});
    const Ve = {
        length: "0px",
        number: 0,
        color: "black",
        url: "url()",
        image: "url()",
        integer: 0,
        angle: "0deg",
        time: "0ms",
        resolution: "0dpi",
        percentage: "0%",
        "length-percentage": "0%",
        "transform-function": "translate(0)",
        "transform-list": "translate(0)",
        "custom-ident": "_"
    };
    let {
        join: Ye,
        make_array: Ze,
        remove_empty_values: Je
    } = n();

    function Ke(e) {
        return /^\:(host|doodle)/.test(e);
    }

    function Qe(e) {
        return /^\:(container|parent)/.test(e);
    }

    function et(e) {
        return Ke(e) || Qe(e);
    }
    class tt {
        constructor(e, t) {
            this.tokens = e, this.rules = {}, this.props = {}, this.keyframes = {}, this.grid = null, this.is_grid_defined = !1, this.coords = [], this.doodles = {}, this.shaders = {}, this.paths = {}, this.reset(), this.Func = Ce(t), this.Selector = function(e) {
                return {
                    at: ({
                        x: e,
                        y: t
                    }) => (n, r) => e == n && t == r,
                    nth: ({
                        count: e,
                        grid: t
                    }) => (...n) => n.some((n => qe(n) ? Xe[n](e) : We(n, e, t.count))),
                    row: ({
                        y: e,
                        grid: t
                    }) => (...n) => n.some((n => qe(n) ? Xe[n](e) : We(n, e, t.y))),
                    col: ({
                        x: e,
                        grid: t
                    }) => (...n) => n.some((n => qe(n) ? Xe[n](e) : We(n, e, t.x))),
                    even: ({
                        count: e,
                        grid: t,
                        y: n
                    }) => r => {
                        if ("cross" === r && Xe.even(t.x)) {
                            let t = Xe.even(n) ? "odd" : "even";
                            return Xe[t](e);
                        }
                        return Xe.even(e);
                    },
                    odd: ({
                        count: e,
                        grid: t,
                        y: n
                    }) => r => {
                        if ("cross" === r && Xe.even(t.x)) {
                            let t = Xe.even(n) ? "even" : "odd";
                            return Xe[t](e);
                        }
                        return Xe.odd(e);
                    },
                    random: () => (t = .5) => (t >= 1 && t <= 0 && (t = .5), e() < t)
                };
            }(t), this.custom_properties = {}, this.uniforms = {}, this.unique_id = Z(t).unique_id;
        }
        reset() {
            this.styles = {
                host: "",
                container: "",
                cells: "",
                keyframes: ""
            }, this.coords = [], this.doodles = {};
            for (let e in this.rules) e.startsWith("#c") && delete this.rules[e];
        }
        add_rule(e, t) {
            let n = this.rules[e];
            n || (n = this.rules[e] = []), n.push.apply(n, Ze(t));
        }
        pick_func(e) {
            return this.Func[e] || Ge[e];
        }
        apply_func(e, t, n) {
            let r = e(...Ze(t)),
                i = [];
            return n.forEach((e => {
                let t = typeof e.value,
                    n = "number" === t || "string" === t;
                if (!e.cluster && n) i.push(...Re(e.value, !0));
                else if ("function" == typeof e) i.push(e);
                else if (!I(e.value)) {
                    let t = D(e.value);
                    i.push(t);
                }
            })), i = Je(i), r(...Ze(i));
        }
        compose_aname(...e) {
            return e.join("-");
        }
        compose_selector({
            x: e,
            y: t,
            z: n
        }, r = "") {
            return `#${U(e, t, n)}${r}`;
        }
        is_composable(e) {
            return ["doodle", "shaders"].includes(e);
        }
        compose_argument(e, t, n = []) {
            let r = e.map((e => {
                if ("text" === e.type) return e.value;
                if ("func" === e.type) {
                    let r = e.name.substr(1),
                        i = this.pick_func(r);
                    if ("function" == typeof i) {
                        if ("t" === r && (this.uniforms.time = !0), this.is_composable(r)) {
                            let n = D((e.arguments[0] || [])[0]);
                            if (!I(n)) switch (r) {
                                case "doodle":
                                    return this.compose_doodle(n);
                                case "shaders":
                                    return this.compose_shaders(n, t);
                            }
                        }
                        t.extra = n, t.position = e.position;
                        let s = e.arguments.map((e => i.lazy ? (...n) => this.compose_argument(e, t, n) : this.compose_argument(e, t, n))),
                            o = this.apply_func(i, t, s);
                        return "path" == r ? this.compose_path(o) : o;
                    }
                }
            }));
            return {
                cluster: e.cluster,
                value: r.length >= 2 ? {
                    value: r.join("")
                } : r[0]
            };
        }
        compose_doodle(e) {
            let t = this.unique_id("doodle");
            return this.doodles[t] = e, "${" + t + "}";
        }
        compose_shaders(e, {
            x: t,
            y: n,
            z: r
        }) {
            let i = this.unique_id("shader");
            return this.shaders[i] = {
                shader: e,
                cell: U(t, n, r)
            }, "${" + i + "}";
        }
        compose_path(e) {
            let t = this.unique_id("path");
            return this.paths[t] = {
                id: t,
                commands: e
            }, "${" + t + "}";
        }
        compose_value(e, t) {
            return Array.isArray(e) ? e.reduce(((e, n) => {
                switch (n.type) {
                    case "text":
                        e += n.value;
                        break;
                    case "func": {
                        let r = n.name.substr(1),
                            i = this.pick_func(r);
                        if ("function" == typeof i)
                            if ("t" === r && (this.uniforms.time = !0), this.is_composable(r)) {
                                let i = D((n.arguments[0] || [])[0]);
                                if (!I(i)) switch (r) {
                                    case "doodle":
                                        e += this.compose_doodle(i);
                                        break;
                                    case "shaders":
                                        e += this.compose_shaders(i, t);
                                }
                            } else {
                                t.position = n.position;
                                let s = n.arguments.map((e => i.lazy ? (...n) => this.compose_argument(e, t, n) : this.compose_argument(e, t))),
                                    o = this.apply_func(i, t, s);
                                I(o) || (e += "path" == r ? this.compose_path(o) : o);
                            }
                    }
                }
                return e;
            }), "") : "";
        }
        compose_rule(e, t, n) {
            let r = Object.assign({}, t),
                i = e.property,
                s = e.value.reduce(((e, t) => {
                    let n = this.compose_value(t, r);
                    return n && e.push(n), e;
                }), []),
                o = s.join(", ");
            if (/^animation(\-name)?$/.test(i)) {
                if (this.props.has_animation = !0, Ke(n)) {
                    let e = Me[i];
                    e && o && (o = e + "," + o);
                }
                if (r.count > 1) {
                    let {
                        count: e
                    } = r;
                    switch (i) {
                        case "animation-name":
                            o = s.map((t => this.compose_aname(t, e))).join(", ");
                            break;
                        case "animation":
                            o = s.map((t => {
                                let n = (t || "").split(/\s+/);
                                return n[0] = this.compose_aname(n[0], e), n.join(" ");
                            })).join(", ");
                    }
                }
            }
            "content" === i && (/["']|^none$|^(var|counter|counters|attr)\(/.test(o) || (o = `'${o}'`)), "transition" === i && (this.props.has_transition = !0);
            let l = `${i}:${o};`;
            if (l = Ne(i, l), "clip-path" === i && (l += ";overflow:hidden;"), "width" !== i && "height" !== i || et(n) || (l += `--internal-cell-${i}:${o};`), "background" === i && o.includes("shader") && (l += "background-size:100% 100%;"), /^\-\-/.test(i) && (this.custom_properties[i] = o), He[i]) {
                let t = He[i](o, {
                    is_special_selector: et(n)
                });
                switch (i) {
                    case "@grid":
                        Ke(n) ? l = t.size || "" : (l = "", this.is_grid_defined || (t = He[i](o, {
                            is_special_selector: !0
                        }), this.add_rule(":host", t.size || ""))), this.grid = r.grid, this.is_grid_defined = !0;
                        break;
                    case "@place-cell":
                        Ke(n) || (l = t);
                        break;
                    case "@use":
                        e.value.length && this.compose(r, e.value), l = "";
                        break;
                    default:
                        l = t;
                }
            }
            return l;
        }
        pre_compose_rule(e, t) {
            let n = Object.assign({}, t),
                r = e.property;
            switch (r) {
                case "@grid": {
                    let t = e.value.reduce(((e, t) => {
                            let r = this.compose_value(t, n);
                            return r && e.push(r), e;
                        }), []).join(", "),
                        i = He[r](t, {});
                    this.grid = i.grid;
                    break;
                }
                case "@use":
                    e.value.length && this.pre_compose(n, e.value);
            }
        }
        pre_compose(e, t) {
            (t || this.tokens).forEach((t => {
                switch (t.type) {
                    case "rule":
                        this.pre_compose_rule(t, e);
                        break;
                    case "pseudo":
                        Ke(t.selector) && (t.styles || []).forEach((t => {
                            this.pre_compose_rule(t, e);
                        }));
                }
            }));
        }
        compose(e, t, n) {
            this.coords.push(e), (t || this.tokens).forEach(((t, r) => {
                if (t.skip) return !1;
                if (n && this.grid) return !1;
                switch (t.type) {
                    case "rule":
                        this.add_rule(this.compose_selector(e), this.compose_rule(t, e));
                        break;
                    case "pseudo": {
                        t.selector.startsWith(":doodle") && (t.selector = t.selector.replace(/^\:+doodle/, ":host"));
                        let n = et(t.selector);
                        n && (t.skip = !0), t.selector.split(",").forEach((r => {
                            let i = t.styles.map((t => this.compose_rule(t, e, r))),
                                s = n ? r : this.compose_selector(e, r);
                            this.add_rule(s, i);
                        }));
                        break;
                    }
                    case "cond": {
                        let n = this.Selector[t.name.substr(1)];
                        if (n) {
                            let r = t.arguments.map((t => this.compose_argument(t, e)));
                            this.apply_func(n, e, r) && this.compose(e, t.styles);
                        }
                        break;
                    }
                    case "keyframes":
                        this.keyframes[t.name] || (this.keyframes[t.name] = e => `\n ${Ye(t.steps.map((t =>`\n ${t.name}{${Ye(t.styles.map((t =>this.compose_rule(t, e))))}}`)))}`);
                }
            }));
        }
        output() {
            Object.keys(this.rules).forEach(((e, t) => {
                if (Qe(e)) this.styles.container += `\n .container{${Ye(this.rules[e])}}`;
                else {
                    let t = Ke(e) ? "host" : "cells",
                        n = Ye(this.rules[e]).trim(),
                        r = "host" === t ? `${e}, .host` : e;
                    this.styles[t] += `${r}{${n}}`;
                }
            }));
            let e = Object.keys(this.keyframes);
            this.uniforms.time && (this.styles.container += `\n:host, .host{animation:${Me.animation};}`, this.styles.keyframes += `\n @keyframes ${Me["animation-name"]}{from{--${Me.name}:0} to{--${Me.name}:${Me["animation-duration"]}}}`), this.coords.forEach(((t, n) => {
                e.forEach((e => {
                    let r = this.compose_aname(e, t.count);
                    var i, s;
                    this.styles.keyframes += `\n ${i = 0 === n, s =`@keyframes ${e}{${this.keyframes[e](t)}}`, i ? "function" == typeof s ? s():s:""} @keyframes ${r}{${this.keyframes[e](t)}}`;
                }));
            }));
            let t = [];
            return Object.keys(this.custom_properties).forEach((e => {
                let n = function(e) {
                    let t = String(e).substr(2).split("-")[0];
                    if (void 0 !== Ve[t]) return {
                        name: e,
                        syntax: `<${t}>|<${t}>+ |<${t}>#`,
                        initialValue: Ve[t],
                        inherits: !1
                    };
                }(e);
                n && t.push(n);
            })), {
                props: this.props,
                styles: this.styles,
                grid: this.grid,
                doodles: this.doodles,
                shaders: this.shaders,
                paths: this.paths,
                definitions: t,
                uniforms: this.uniforms
            };
        }
    }

    function nt(e, t, n) {
        let r = new tt(e, n),
            i = {};
        r.pre_compose({
            x: 1,
            y: 1,
            z: 1,
            count: 1,
            context: {},
            grid: {
                x: 1,
                y: 1,
                z: 1,
                count: 1
            }
        });
        let {
            grid: s
        } = r.output();
        if (s && (t = s), r.reset(), 1 == t.z)
            for (let e = 1, n = 0; e <= t.y; ++e)
                for (let s = 1; s <= t.x; ++s) r.compose({
                    x: s,
                    y: e,
                    z: 1,
                    count: ++n,
                    grid: t,
                    context: i
                });
        else
            for (let e = 1, n = 0; e <= t.z; ++e) r.compose({
                x: 1,
                y: 1,
                z: e,
                count: ++n,
                grid: t,
                context: i
            });
        return r.output();
    }
    var rt = window,
        it = Math,
        st = [],
        ot = 256,
        lt = it.pow(ot, 6),
        at = it.pow(2, 52),
        ut = 2 * at,
        ct = 255;

    function ht(e, t, n) {
        var r = [],
            i = mt(ft((t = 1 == t ? {
                entropy: !0
            } : t || {}).entropy ? [e, gt(st)] : null == e ? function() {
                try {
                    var e;
                    return e = new Uint8Array(ot), (rt.crypto || rt.msCrypto).getRandomValues(e), gt(e);
                } catch (e) {
                    var t = rt.navigator,
                        n = t && t.plugins;
                    return [+new Date, rt, n, rt.screen, gt(st)];
                }
            }() : e, 3), r),
            s = new pt(r),
            o = function() {
                for (var e = s.g(6), t = lt, n = 0; e < at;) e = (e + n) * ot, t *= ot, n = s.g(1);
                for (; e >= ut;) e /= 2, t /= 2, n >>>= 1;
                return (e + n) / t;
            };
        return o.int32 = function() {
            return 0 | s.g(4);
        }, o.quick = function() {
            return s.g(4) / 4294967296;
        }, o.double = o, mt(gt(s.S), st), (t.pass || n || function(e, t, n, r) {
            return r && (r.S && dt(r, s), e.state = function() {
                return dt(s, {});
            }), n ? (it.random = e, t) : e;
        })(o, i, "global" in t ? t.global : this == it, t.state);
    }

    function pt(e) {
        var t, n = e.length,
            r = this,
            i = 0,
            s = r.i = r.j = 0,
            o = r.S = [];
        for (n || (e = [n++]); i < ot;) o[i] = i++;
        for (i = 0; i < ot; i++) o[i] = o[s = ct & s + e[i % n] + (t = o[i])], o[s] = t;
        (r.g = function(e) {
            for (var t, n = 0, i = r.i, s = r.j, o = r.S; e--;) t = o[i = ct & i + 1], n = n * ot + o[ct & (o[i] = o[s = ct & s + t]) + (o[s] = t)];
            return r.i = i, r.j = s, n;
        })(ot);
    }

    function dt(e, t) {
        return t.i = e.i, t.j = e.j, t.S = e.S.slice(), t;
    }

    function ft(e, t) {
        var n, r = [],
            i = typeof e;
        if (t && "object" == i)
            for (n in e) try {
                r.push(ft(e[n], t - 1));
            } catch (e) {}
        return r.length ? r : "string" == i ? e : e + "\0";
    }

    function mt(e, t) {
        for (var n, r = e + "", i = 0; i < r.length;) t[ct & i] = ct & (n ^= 19 * t[ct & i]) + r.charCodeAt(i++);
        return gt(t);
    }

    function gt(e) {
        return String.fromCharCode.apply(0, e);
    }

    function yt(e, t, n) {
        let r = e.createShader(t);
        return e.shaderSource(r, n), e.compileShader(r), r;
    }

    function vt(e, t) {
        return e.includes(t) ? e : t + "\n" + e;
    }
    mt(it.random(), st);

    function _t(e, t, n) {
        let r = document.createElement("canvas"),
            i = window.devicePixelRatio || 1;
        t *= i, n *= i, r.width = t, r.height = n;
        let s = r.getContext("webgl") || r.getContext("exprimental-webgl");
        if (!s) return "";
        let o = vt(e.fragment || "", "uniform vec2 u_resolution;");
        e.textures.forEach((e => {
            let t = `uniform sampler2D ${e.name};`;
            o = vt(o, t);
        }));
        let l = function(e, t, n) {
                let r = yt(e, e.VERTEX_SHADER, t),
                    i = yt(e, e.FRAGMENT_SHADER, n),
                    s = e.createProgram();
                return e.attachShader(s, r), e.attachShader(s, i), e.linkProgram(s), e.getProgramParameter(s, e.LINK_STATUS) || (console.warn("Link failed:" + e.getProgramInfoLog(s)), console.warn("vs info-log:" + e.getShaderInfoLog(r)), console.warn("fs info-log:" + e.getShaderInfoLog(i))), s;
            }(s, e.vertex || "\n attribute vec4 position;void main(){gl_Position = position;}", "\n precision highp float;" + o),
            a = s.getAttribLocation(l, "position"),
            u = s.createBuffer();
        s.bindBuffer(s.ARRAY_BUFFER, u);
        return s.bufferData(s.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1, -1, 1, 1, -1]), s.STATIC_DRAW), s.enableVertexAttribArray(a), s.vertexAttribPointer(a, 2, s.FLOAT, !1, 0, 0), s.viewport(0, 0, s.drawingBufferWidth, s.drawingBufferHeight), s.clearColor(0, 0, 0, 0), s.clear(s.COLOR_BUFFER_BIT), s.useProgram(l), s.uniform2fv(s.getUniformLocation(l, "u_resolution"), [t, n]), e.textures.forEach(((e, t) => {
            ! function(e, t, n) {
                const r = e.createTexture();
                e.activeTexture(e["TEXTURE" + n]), e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !0), e.bindTexture(e.TEXTURE_2D, r), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR);
            }(s, e.value, t), s.uniform1i(s.getUniformLocation(l, e.name), t);
        })), s.drawArrays(s.TRIANGLES, 0, 6), Promise.resolve(r.toDataURL());
    }
    class xt extends HTMLElement {
        constructor() {
            super(), this.doodle = this.attachShadow({
                mode: "open"
            }), this.extra = {
                get_variable: e => function(e, t) {
                    return getComputedStyle(e).getPropertyValue(t).trim().replace(/^\(|\)$/g, "");
                }(this, e)
            };
        }
        connectedCallback(e) {
            /^(complete|interactive|loaded)$/.test(document.readyState) ? this.load(e) : setTimeout((() => this.load(e)));
        }
        update(e) {
            let t = this.get_use();
            e || (e = this.innerHTML), this.innerHTML = e, this.grid_size || (this.grid_size = this.get_grid());
            let {
                x: n,
                y: r,
                z: i
            } = this.grid_size;
            const s = this.generate(P(t + e, this.extra));
            if (!this.shadowRoot.innerHTML) return Object.assign(this.grid_size, s.grid), this.build_grid(s, s.grid);
            if (s.grid) {
                let {
                    x: e,
                    y: t,
                    z: o
                } = s.grid;
                if (n !== e || r !== t || i !== o) return Object.assign(this.grid_size, s.grid), this.build_grid(s, s.grid);
                Object.assign(this.grid_size, s.grid);
            } else {
                let s = this.get_grid(),
                    {
                        x: o,
                        y: l,
                        z: a
                    } = s;
                if (n !== o || r !== l || i !== a) return Object.assign(this.grid_size, s), this.build_grid(this.generate(P(t + e, this.extra)), s);
            }
            let o = this.build_svg_paths(s.paths);
            if (o) {
                let e = this.shadowRoot.querySelector(".svg-defs");
                e && (e.innerHTML = o);
            }
            s.uniforms.time && this.register_uniform_time();
            let l = this.replace(s);
            this.set_content(".style-keyframes", l(s.styles.keyframes)), s.props.has_animation && (this.set_content(".style-cells", ""), this.set_content(".style-container", "")), setTimeout((() => {
                this.set_content(".style-container", l(wt(this.grid_size) + s.styles.host + s.styles.container)), this.set_content(".style-cells", l(s.styles.cells));
            }));
        }
        get grid() {
            return Object.assign({}, this.grid_size);
        }
        set grid(e) {
            this.attr("grid", e), this.connectedCallback(!0);
        }
        get seed() {
            return this._seed_value;
        }
        set seed(e) {
            this.attr("seed", e), this.connectedCallback(!0);
        }
        get use() {
            return this.attr("use");
        }
        set use(e) {
            this.attr("use", e), this.connectedCallback(!0);
        }
        static get observedAttributes() {
            return ["grid", "use", "seed"];
        }
        attributeChangedCallback(e, t, n) {
            if (t == n) return !1;
            ["grid", "use", "seed"].includes(e) && !I(t) && (this[e] = n);
        }
        get_grid() {
            return X(this.attr("grid"));
        }
        get_use() {
            let e = this.attr("use") || "";
            return e && (e = `@use:${e};`), e;
        }
        attr(e, t) {
            return 1 === arguments.length ? this.getAttribute(e) : 2 === arguments.length ? (this.setAttribute(e, t), t) : void 0;
        }
        generate(e) {
            let t = this.get_grid(),
                n = this.attr("seed") || this.attr("data-seed");
            I(n) && (n = Date.now()), n = String(n), this._seed_value = n;
            let r = this.random = ht(n);
            return this.compiled = nt(e, t, r);
        }
        doodle_to_image(e, t, n) {
            "function" == typeof t && (n = t, t = null);
            let r = P(e, this.extra),
                i = X({}),
                s = nt(r, i, this.random),
                o = s.grid ? s.grid : i;
            const {
                keyframes: l,
                host: a,
                container: u,
                cells: c
            } = s.styles;
            let h = this.build_svg_paths(s.paths),
                p = this.replace(s),
                d = kt(o);
            p(`\n<svg ${t && t.width && t.height ?`width="${t.width}" height="${t.height}"`:""} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><foreignObject width="100%" height="100%"><div class="host" xmlns="http://www.w3.org/1999/xhtml"><style>${bt()} ${wt(o)} ${a} ${u} ${c} ${l}</style><svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs class="svg-defs">${h}</defs></svg>${d}</div></foreignObject></svg>`).then((e => {
                let t = `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(e)))}`;
                B() && N(t), n(t);
            }));
        }
        shader_to_image({
            shader: e,
            cell: t
        }, n) {
            let r = function(e) {
                    let t = "",
                        n = "",
                        r = "",
                        i = [],
                        s = {
                            textures: []
                        },
                        o = "",
                        l = [],
                        a = 0;
                    for (; void 0 !== (t = e[a++]);)
                        if ('"' != t && "'" != t || (G(i) == t ? i.pop() : i.push(t)), "{" != t || q(G(i)))
                            if ("}" != t || q(G(i))) /\s/.test(t) && o.length ? (l.push(o), o = "", ("#define" == l[l.length - 3] || "#ifdef" == l[l.length - 2] || "#else" == l[l.length - 1] || "#endif" == l[l.length - 1]) && (n += "\n")) : o += t, n += t;
                            else if (i.pop(), i.length) n += t;
                    else {
                        let e = r.trim(),
                            t = n.trim().replace(/^\(+|\)+$/g, "");
                        e.length && (e.startsWith("texture") ? s.textures.push({
                            name: e,
                            value: t
                        }) : s[e] = t), r = n = "";
                    } else i.length ? n += t : (r = n, n = ""), i.push(t);
                    return void 0 === s.fragment ? {
                        fragment: e,
                        textures: []
                    } : s;
                }(e),
                i = this.doodle.getElementById(t),
                {
                    width: s,
                    height: o
                } = i.getBoundingClientRect(),
                l = window.devicePixelRatio || 1;
            if (r.textures.length) {
                let e = r.textures.map((e => new Promise((t => {
                    this.doodle_to_image(e.value, {
                        width: s,
                        height: o
                    }, (n => {
                        let r = new Image;
                        r.width = s * l, r.height = o * l, r.onload = () => t({
                            name: e.name,
                            value: r
                        }), r.src = n;
                    }));
                }))));
                Promise.all(e).then((e => {
                    r.textures = e, _t(r, s, o).then(n);
                }));
            } else _t(r, s, o).then(n);
        }
        load(e) {
            e || this.hasAttribute("click-to-update") && this.addEventListener("click", (e => this.update()));
            let t = this.get_use();
            if (!this.innerHTML.trim() && !t) return !1;
            let n = P(t + function(e) {
                    let t = document.createElement("textarea");
                    return t.innerHTML = e, t.value;
                }(this.innerHTML), this.extra),
                r = this.generate(n);
            this.grid_size = r.grid ? r.grid : this.get_grid(), this.build_grid(r, this.grid_size);
        }
        replace({
            doodles: e,
            shaders: t,
            paths: n
        }) {
            let r = Object.keys(e),
                i = Object.keys(t),
                s = Object.keys(n);
            return n => {
                if (!r.length && !i.length && !s.length) return Promise.resolve(n);
                let o = [].concat(r.map((t => n.includes(t) ? new Promise((n => {
                    this.doodle_to_image(e[t], (e => n({
                        id: t,
                        value: e
                    })));
                })) : Promise.resolve(""))), i.map((e => n.includes(e) ? new Promise((n => {
                    this.shader_to_image(t[e], (t => n({
                        id: e,
                        value: t
                    })));
                })) : Promise.resolve(""))), s.map((e => n.includes(e) ? Promise.resolve({
                    id: e,
                    value: "#" + e
                }) : Promise.resolve(""))));
                return Promise.all(o).then((e => (n.replaceAll ? e.forEach((({
                    id: e,
                    value: t
                }) => {
                    n = n.replaceAll("${" + e + "}", `url(${t})`);
                })) : e.forEach((({
                    id: e,
                    value: t
                }) => {
                    n = n.replace("${" + e + "}", `url(${t})`);
                })), n)));
            };
        }
        build_grid(e, t) {
            const {
                has_transition: n,
                has_animation: r
            } = e.props;
            let i = n || r;
            const {
                keyframes: s,
                host: o,
                container: l,
                cells: a
            } = e.styles;
            let u = wt(t) + o + l,
                c = i ? "" : a,
                h = this.build_svg_paths(e.paths);
            const {
                uniforms: p
            } = e;
            let d = this.replace(e);
            this.doodle.innerHTML = `\n<style>${bt(p)}</style><style class="style-keyframes">${s}</style><style class="style-container">${u}</style><style class="style-cells">${c}</style><svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs class="svg-defs">${h}</defs></svg>${kt(t)}`, this.set_content(".style-container", d(u)), i ? setTimeout((() => {
                this.set_content(".style-cells", d(a));
            }), 50) : this.set_content(".style-cells", d(a));
            const f = e.definitions;
            if (window.CSS && window.CSS.registerProperty) try {
                p.time && this.register_uniform_time(), f.forEach(CSS.registerProperty);
            } catch (e) {}
        }
        build_svg_paths(e) {
            return Object.keys(e || {}).map((t => `\n<clipPath id="${e[t].id}" clipPathUnits="objectBoundingBox"><path d="${e[t].commands}" /></clipPath>`)).join("");
        }
        register_uniform_time() {
            if (!this.is_uniform_time_registered) {
                try {
                    CSS.registerProperty({
                        name: "--" + Me.name,
                        syntax: "<number>",
                        initialValue: 0,
                        inherits: !0
                    });
                } catch (e) {}
                this.is_uniform_time_registered = !0;
            }
        }
        export ({
            scale: e,
            name: t,
            download: n,
            detail: r
        } = {}) {
            return new Promise(((i, s) => {
                let o = function(e) {
                        let t = {};
                        if (e.computedStyleMap)
                            for (let [n, r] of e.computedStyleMap()) n.startsWith("--") && (t[n] = r[0][0]);
                        else {
                            let n = getComputedStyle(e);
                            for (let e of n) e.startsWith("--") && (t[e] = n.getPropertyValue(e));
                        }
                        return function(e) {
                            let t = [];
                            for (let n in e) t.push(n + ":" + e[n]);
                            return t.join(";");
                        }(t);
                    }(this),
                    l = this.doodle.innerHTML,
                    {
                        width: a,
                        height: u
                    } = this.getBoundingClientRect(),
                    c = a * (e = parseInt(e) || 1),
                    h = u * e,
                    p = `\n<svg xmlns="http://www.w3.org/2000/svg"\n preserveAspectRatio="none"\n viewBox="0 0 ${a} ${u}"\n ${B() ? "":`width="${c}px" height="${h}px"`}><foreignObject width="100%" height="100%"><div\n class="host"\n xmlns="http://www.w3.org/1999/xhtml"\n style="width:${a}px;height:${u}px;"\n><style>.host{${o}}</style>${l}</div></foreignObject></svg>`.replace(/\n\s+|^\s+|\n+/g, " ").trim();
                n || r ? function(e, t, n, r) {
                    return new Promise(((i, s) => {
                        let o = `data:image/svg+xml;utf8,${encodeURIComponent(e)}`;

                        function l() {
                            let e = new Image;
                            e.crossOrigin = "anonymous", e.src = o, e.onload = () => {
                                let l = document.createElement("canvas"),
                                    a = l.getContext("2d"),
                                    u = window.devicePixelRatio || 1;
                                1 != r && (u = 1), l.width = t * u, l.height = n * u, a.drawImage(e, 0, 0, l.width, l.height);
                                try {
                                    l.toBlob((e => {
                                        i({
                                            blob: e,
                                            source: o,
                                            url: URL.createObjectURL(e)
                                        });
                                    }));
                                } catch (e) {
                                    s(e);
                                }
                            };
                        }
                        B ? N(o, l, 200) : l();
                    }));
                }(p, c, h, e).then((({
                    source: e,
                    url: r,
                    blob: s
                }) => {
                    if (i({
                            width: c,
                            height: h,
                            svg: p,
                            blob: s,
                            source: e
                        }), n) {
                        let e = document.createElement("a");
                        e.download = function(e) {
                            return (I(e) ? Date.now() : String(e).replace(/\/.png$/g, "")) + ".png";
                        }(t), e.href = r, e.click();
                    }
                })).catch((e => {
                    s(e);
                })) : i({
                    width: c,
                    height: h,
                    svg: p
                });
            }));
        }
        set_content(e, t) {
            if (t instanceof Promise) t.then((t => {
                this.set_content(e, t);
            }));
            else {
                const n = this.shadowRoot.querySelector(e);
                n && (n.styleSheet ? n.styleSheet.cssText = t : n.innerHTML = t);
            }
        }
    }

    function bt(e = {}) {
        const t = Ie(/grid/).map((e => `${e}:inherit;`)).join("");
        return `\n *{box-sizing:border-box\n} *::after, *::before{box-sizing:inherit\n}:host, .host{display:block;visibility:visible;width:auto;height:auto;--${Me.name}:0\n}:host([hidden]), .host[hidden]{display:none\n} .container{position:relative;width:100%;height:100%;display:grid;${t}} cell:empty{position:relative;line-height:1;display:grid;place-items:center\n} svg{position:absolute;}`;
    }

    function wt({
        x: e,
        y: t
    }) {
        return `\n:host, .host{grid-template-rows:repeat(${t}, 1fr);grid-template-columns:repeat(${e}, 1fr);}`;
    }

    function $t(e, t, n) {
        let r = document.createElement("cell");
        return r.id = U(e, t, n), r;
    }

    function kt({
        x: e,
        y: t,
        z: n
    }) {
        let r = document.createElement("grid"),
            i = document.createDocumentFragment();
        if (1 == n)
            for (let n = 1; n <= t; ++n)
                for (let t = 1; t <= e; ++t) i.appendChild($t(t, n, 1));
        else {
            let e = null;
            for (let t = 1; t <= n; ++t) {
                let n = $t(1, 1, t);
                (e || i).appendChild(n), e = n;
            }
            e = null;
        }
        return r.className = "container", r.appendChild(i), r.outerHTML;
    }
    return customElements.get("css-doodle") || customElements.define("css-doodle", xt),
        function(e, ...t) {
            let n = e.reduce(((e, n, r) => {
                    return e + n + (I(i = t[r]) ? "" : i);
                    var i;
                }), ""),
                r = document.createElement("css-doodle");
            return r.update && r.update(n), r;
        };
}));
1