"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
function App({ tags = [] }) {
    return ((0, jsx_runtime_1.jsx)("ul", { children: tags.map((t) => ((0, jsx_runtime_1.jsx)("li", { className: "badge", children: t }, t))) }));
}
