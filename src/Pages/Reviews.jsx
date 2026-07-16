import React from "react";
import { FaGoogle, FaFacebookF, FaStar } from "react-icons/fa";
import SEO from "../Components/SEO";

// TODO: swap in your real Google Maps listing URL so the buttons below
// link straight to your live reviews (Google Business Profile > Share > Reviews).
const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/place/O.S+Travel+%26+Tours/@33.7178385,73.0733661,17z";
const FACEBOOK_REVIEWS_URL = "https://www.facebook.com/osconsultants01/reviews";

const Reviews = () => {
  return (
    <div className="w-full bg-white overflow-x-hidden">
      <SEO
        title="Customer Reviews | OS Travels & Tours Islamabad"
        description="Read real customer reviews for OS Travels & Tours on Google and Facebook. See what our visa, Umrah and flight booking customers say about our service in Islamabad, Pakistan."
        keywords={[
          "OS Travels reviews",
          "OS Travels Islamabad reviews",
          "best travel agency reviews Pakistan",
          "visa agency reviews Islamabad",
        ]}
        path="/reviews"
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Reviews" }]}
      />

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="flex justify-center gap-1 text-amber-400 text-2xl mb-4">
          <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          What Our Customers Say
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          We're proud of the trust our customers place in us for their visa applications, Umrah &
          Hajj bookings, flight tickets and hotel reservations. Read our real, up-to-date reviews
          directly on Google and Facebook — we link out instead of pasting quotes here so you
          always see the current, verified rating.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow font-semibold text-gray-800"
          >
            <FaGoogle className="text-xl text-red-500" />
            View Our Google Reviews
          </a>
          <a
            href={FACEBOOK_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow font-semibold text-gray-800"
          >
            <FaFacebookF className="text-xl text-blue-600" />
            View Our Facebook Reviews
          </a>
        </div>

        <div className="bg-slate-50 rounded-xl border border-gray-100 p-8 text-left max-w-2xl mx-auto">
          <h2 className="font-bold text-gray-900 mb-2">Are you a recent customer?</h2>
          <p className="text-gray-600 text-sm">
            If OS Travels & Tours helped with your visa, Umrah package or flight booking, a quick
            Google review helps other travelers find a trustworthy agency — and helps us keep
            improving. Thank you!
          </p>
        </div>
      </section>
    </div>
  );
};

export default Reviews;
