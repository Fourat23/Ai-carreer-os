"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStack = runStack;
function runStack(ops) {
    const stack = [];
    for (const op of ops) {
        if (op.startsWith('push '))
            stack.push(Number(op.slice(5)));
        else if (op === 'pop')
            stack.pop();
    }
    return stack;
}
