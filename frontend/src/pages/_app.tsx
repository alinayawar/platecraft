import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import AppLayout from '@/components/layout/AppLayout';
import { useEffect } from 'react';

function reportError(payload: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_RUNTIME_ERROR_REPORT_URL;
  if (!url) return;
  let appId = process.env.NEXT_PUBLIC_APP_ID || '';
  if (!appId && typeof window !== 'undefined') {
    const m = window.location.hostname.match(/^preview-([^.]+)/);
    if (m) appId = m[1];
  }
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, user_agent: navigator.userAgent, ...payload }),
  }).catch(() => {});
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    window.onerror = (message, source, lineno, colno, error) => {
      reportError({ message: String(message), stack: error?.stack, url: source });
    };
    window.onunhandledrejection = (e) => {
      reportError({ message: String(e.reason), stack: e.reason?.stack, url: window.location.href });
    };
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      reportError({ message: args.map(String).join(' '), url: window.location.href });
      origError.apply(console, args);
    };
  }, []);

  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}