export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-6">🌿</div>
      <h1 className="text-3xl font-bold text-green-900 mb-4">
        Explore TikiZia Itinerary Generator
      </h1>
      <p className="text-stone-600 max-w-md mb-8">
        This tool is available after purchase. Check your email for your personal
        access link, or visit our website to get started.
      </p>
      <a
        href="https://exploretikizia.com"
        className="bg-green-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        Visit Explore TikiZia →
      </a>
    </main>
  );
}
