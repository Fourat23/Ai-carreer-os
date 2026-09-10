export function joinLoans(loans, books) {
  const titleById = new Map(books.map((b) => [b.id, b.title]));
  return loans.map((l) => ({ id: l.id, title: titleById.has(l.bookId) ? titleById.get(l.bookId) : null }));
}
