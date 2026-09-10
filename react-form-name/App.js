"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function App({ value = '' }) {
    const [name, setName] = (0, react_1.useState)(value);
    return ((0, jsx_runtime_1.jsxs)("form", { children: [(0, jsx_runtime_1.jsxs)("label", { children: ["Nom : ", (0, jsx_runtime_1.jsx)("input", { id: "n", value: name, onChange: (e) => setName(e.target.value) })] }), (0, jsx_runtime_1.jsxs)("p", { id: "g", children: ["Bonjour, ", name, " !"] })] }));
}
