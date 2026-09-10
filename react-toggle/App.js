"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function App({ on = false }) {
    const [state, setState] = (0, react_1.useState)(on);
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { id: "s", children: state ? 'Allumé' : 'Éteint' }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setState(!state), children: "Basculer" })] }));
}
