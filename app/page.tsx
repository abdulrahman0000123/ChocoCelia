import { Hero } from "./components/Hero";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <Hero />
      
      {/* Featured Section Placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-8 font-serif">Our Favorites</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-chocolate-900 p-6 rounded-2xl shadow-sm border border-chocolate-100 dark:border-chocolate-800 h-64 flex items-center justify-center text-chocolate-300 dark:text-chocolate-500">
              Product Placeholder {i}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
