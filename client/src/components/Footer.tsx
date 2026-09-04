export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p>© {new Date().getFullYear()} Gavel &amp; Key Auctions. All bids are final.</p>
          <p>Built for demo purposes — not a real marketplace.</p>
        </div>
      </div>
    </footer>
  );
}
