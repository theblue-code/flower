import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'For My Love',
    description: 'A romantic flower gift experience crafted with Next.js and Framer Motion.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
