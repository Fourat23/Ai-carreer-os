"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
function App({ items = [] }) {
    return (0, jsx_runtime_1.jsx)("ul", { children: items.map((x) => (0, jsx_runtime_1.jsx)("li", { className: "row", children: x }, x)) });
}
