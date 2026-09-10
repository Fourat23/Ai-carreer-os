"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MenuItem;
const jsx_runtime_1 = require("react/jsx-runtime");
function MenuItem({ label, onSelect }) {
    return (0, jsx_runtime_1.jsx)("button", { className: "menu-item", onClick: () => onSelect(label), children: label });
}
