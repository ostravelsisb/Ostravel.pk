import { useParams, Link, Navigate } from "react-router-dom";
import { FaClock, FaUser, FaCalendarAlt } from "react-icons/fa";
import SEO from "../Components/SEO";
import { getPostBySlug, getRelatedPosts } from "../data/blogPosts";

function ContentBlock({ block, index }) {
  if (block.type === "h2") {
    return (
      <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-3">
        {block.text}
      </h2>
    );
  }
  if (block.type === "p") {
    return (
      <p key={index} className="text-gray-700 leading-relaxed mb-4">
        {block.text}
      </p>
    );
  }
  if (block.type === "list") {
    return (
      <ul key={index} className="list-disc pl-6 space-y-2 mb-4 text-gray-700">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }
  return null;
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const related = getRelatedPosts(post.slug, post.category);

  return (
    <div className="w-full bg-white overflow-x-hidden min-h-screen">
      <SEO
        title={post.title}
        description={post.excerpt}
        keywords={post.tags}
        image={post.image}
        path={`/blog/${post.slug}`}
        type="article"
        datePublished={post.date}
        dateModified={post.date}
        faqs={post.faqs && post.faqs.length > 0 ? post.faqs : null}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title },
        ]}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link> {" / "}
          <Link to="/blog" className="hover:text-blue-600">Blog</Link> {" / "}
          <span className="text-gray-600">{post.category}</span>
        </nav>

        <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-3 py-1 mb-4">
          {post.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
          <span className="flex items-center gap-1.5"><FaUser /> {post.author}</span>
          <span className="flex items-center gap-1.5"><FaCalendarAlt /> {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          <span className="flex items-center gap-1.5"><FaClock /> {post.readTime}</span>
        </div>

        <img
          src={post.image}
          alt={post.title}
          className="w-full h-72 md:h-96 object-cover rounded-2xl mb-8"
        />

        <div>
          {post.content.map((block, i) => (
            <ContentBlock key={i} block={block} index={i} />
          ))}
        </div>

        {post.faqs && post.faqs.length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {post.faqs.map((faq, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600 text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 rounded-2xl p-6 text-center">
          <p className="text-gray-700 mb-3 font-medium">
            Need help with your visa, Umrah package, or travel booking?
          </p>
          <Link
            to="/contact"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Talk to Our Team
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <div className="bg-slate-50 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/blog/${r.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <img src={r.image} alt={r.title} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm">{r.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
