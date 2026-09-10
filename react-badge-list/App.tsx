export default function App({ tags = [] as string[] }: { tags?: string[] }) {
  return (
    <ul>
      {tags.map((t) => (
        <li className="badge" key={t}>{t}</li>
      ))}
    </ul>
  );
}
