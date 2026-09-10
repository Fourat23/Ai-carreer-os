"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Avatar;
const jsx_runtime_1 = require("react/jsx-runtime");
function Avatar({ name }) {
    return (0, jsx_runtime_1.jsx)("img", { className: "avatar", src: "#", alt: name });
}
