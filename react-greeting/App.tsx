export default function App({ name = 'le monde' }: { name?: string }) {
  return <h1>Bonjour, {name} !</h1>;
}
