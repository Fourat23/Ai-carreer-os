"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Display;
const jsx_runtime_1 = require("react/jsx-runtime");
function Display({ value }) {
    return (0, jsx_runtime_1.jsxs)("p", { id: "display", children: ["Choix : ", value] });
}
