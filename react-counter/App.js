"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function App({ start = 0 }) {
    const [n, setN] = (0, react_1.useState)(start);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { children: ["Compteur : ", (0, jsx_runtime_1.jsx)("b", { id: "v", children: n })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setN(n + 1), children: "Incr\u00E9menter" })] }));
}
