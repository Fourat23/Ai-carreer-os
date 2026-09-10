export function diagnose(system) {
  if (system.duplicateProcessing) return 'idempotent-consumer';
  if (system.singleInstance) return 'remove-spof';
  if (system.retriesFloodingDownDependency) return 'circuit-breaker';
  if (system.readsSaturateDb) return 'add-read-replica';
  if (system.repeatedExpensiveReads) return 'add-cache';
  if (system.cpuSaturatedSingleInstance) return 'scale-horizontal';
  return 'scale-horizontal';
}
