import PersistentDrawer from '@/components/PersistentDrawer';
import { useEffect } from 'react';
import '../app/globals.css';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/BrowserPrint-3.1.250.min.js';
    script.async = true;
    script.id = 'zebra-browserprint';

     // Prevent duplicate script load
    if (!document.getElementById('zebra-browserprint')) {
      document.body.appendChild(script);
    }
  }, []);
  return (
    <PersistentDrawer>
      <Component {...pageProps} />
    </PersistentDrawer>
  );
}
