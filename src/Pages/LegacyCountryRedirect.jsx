import { useParams, Navigate } from "react-router-dom";

// Old URL structure was /countries/:country. Keep it alive as a permanent
// redirect to the new SEO-friendly /visa/:country so old links, bookmarks,
// and any indexed Google results don't 404 — they land on the new slug.
export default function LegacyCountryRedirect() {
  const { country } = useParams();
  return <Navigate to={`/visa/${country}`} replace />;
}
