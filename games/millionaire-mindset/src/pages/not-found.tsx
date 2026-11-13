import { Icon } from '../components/Icon.tsx';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found | Millionaire Mindset';
  }, []);
  return (
    <div className="notfound">
      <div className="notfound__inner">
        <Icon name="ladder" size={48} />
        <h1>Off the ladder</h1>
        <p>That page is not on the board. Let’s get you back to the first question.</p>
        <a className="btn btn--gold btn--xl" href="#/">
          Back home
        </a>
      </div>
    </div>
  );
}
