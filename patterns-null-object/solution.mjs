export function choose({ repeatedNullChecks, absenceIsMeaningful }) {
  return (repeatedNullChecks && !absenceIsMeaningful) ? 'null-object' : 'keep-null';
}
