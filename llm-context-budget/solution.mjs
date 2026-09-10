export function answerBudget(usage) {
  return Math.max(0, usage.limit - usage.promptTokens);
}
