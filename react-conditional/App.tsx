export default function App({ message = '' }: { message?: string }) {
  return <div>{message ? <p className="alert">{message}</p> : null}</div>;
}
