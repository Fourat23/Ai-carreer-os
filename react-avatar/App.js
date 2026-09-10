"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
function App({ url = '#', alt = 'avatar' }) {
    return (0, jsx_runtime_1.jsx)("img", { src: url, alt: alt });
}
