import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-28 text-center">
      <p className="text-6xl font-semibold text-app-green">404</p>
      <p className="mt-3 text-lg font-medium text-app-text">Page not found</p>
      <p className="mt-1 text-sm text-app-text-light">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block px-6 py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
