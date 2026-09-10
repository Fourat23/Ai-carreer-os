import Avatar from './Avatar';
import Bio from './Bio';

export default function App({ name = 'Ada', bio = '' }: { name?: string; bio?: string }) {
  return (
    <article className="profile">
      <Avatar name={name} />
      <Bio bio={bio} />
    </article>
  );
}
