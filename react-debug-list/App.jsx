export default function App({ items = [] }) {
  return <ul>{items.map((x) => <li className="row" key={x}>{x}</li>)}</ul>;
}
