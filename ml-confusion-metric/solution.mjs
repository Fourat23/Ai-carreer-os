export function metrics(cm) {
  return {
    precision: Math.round(cm.tp / (cm.tp + cm.fp) * 100),
    recall: Math.round(cm.tp / (cm.tp + cm.fn) * 100),
  };
}
