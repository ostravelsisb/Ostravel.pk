import { useState } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaUser } from "react-icons/fa";
import SEO from "../Components/SEO";
import { blogCategories, blogPosts } from "../Data/blogPosts";

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPosts =
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  const allTags = [...new Set(blogPosts.flatMap((p) => p.tags))].slice(0, 20);

  return (
    <div className="w-full bg-white overflow-x-hidden min-h-screen">
      <SEO
        title="Travel & Visa Blog | Guides, Tips & Umrah Advice"
        description="OS Travels & Tours blog: visa guides, Umrah & Hajj package advice, file processing explainers and travel tips for Pakistani citizens traveling abroad."
        keywords={allTags}
        path="/blog"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Blog" }]}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Travel &amp; Visa Blog
          </h1>
          <p className="text-blue-100 max-w-2xl mx-auto text-lg">
            Visa guides, Umrah &amp; Hajj advice, and practical travel tips from the OS Travels &amp; Tours desk.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {blogCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                activeCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Post grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow bg-white"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-3 py-1 mb-3">
                  {post.category}
                </span>
                <h2 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <FaUser /> {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock /> {post.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
