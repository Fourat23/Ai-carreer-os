"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
function App({ message = '' }) {
    return (0, jsx_runtime_1.jsx)("div", { children: message ? (0, jsx_runtime_1.jsx)("p", { className: "alert", children: message }) : null });
}
