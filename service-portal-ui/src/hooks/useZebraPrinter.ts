import { useEffect, useState } from 'react';

declare global {
  interface Window {
    BrowserPrint: any;
  }
}

type UseZebraPrinterResult = {
  printer: any | null;
  isReady: boolean;
  print: (zpl: string) => void;
};

export const useZebraPrinter = (): UseZebraPrinterResult => {
  const [printer, setPrinter] = useState<any | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAndInit = () => {
      if (window.BrowserPrint) {
        window.BrowserPrint.getDefaultDevice('printer', (device: any) => {
          console.log('printer device : ', device)
          setPrinter(device);
          setIsReady(true);
        }, (err: any) => {
          console.error('No default Zebra printer found', err);
        });
      } else {
        console.warn('BrowserPrint SDK not yet loaded');
      }
    };

    // Delay slightly to allow _app.tsx script to load
    const interval = setInterval(() => {
      if (window.BrowserPrint) {
        checkAndInit();
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const print = (zpl: string) => {
    if (!printer) {
      alert('No printer available.');
      return;
    }

    printer.send(zpl, () => {
      console.log('ZPL sent to printer');
    }, (err: any) => {
      console.error('Failed to print', err);
    });
  };

  return { printer, isReady, print };
};
