"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Item;
const jsx_runtime_1 = require("react/jsx-runtime");
function Item({ label }) {
    return (0, jsx_runtime_1.jsx)("li", { className: "item", children: label });
}
