import { LinkButton } from '../components/ui';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl font-black text-glow">404</p>
      <h1 className="mt-2 text-2xl font-black">We couldn’t find that page</h1>
      <LinkButton to="/" className="mt-6">
        Go home
      </LinkButton>
    </div>
  );
}
