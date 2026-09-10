export function choosePagination({ changesDuringBrowsing, largeVolume }) {
  return (changesDuringBrowsing || largeVolume) ? 'cursor' : 'offset';
}
