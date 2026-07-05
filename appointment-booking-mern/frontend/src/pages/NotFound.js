import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="page">
    <div className="container">
      <div className="empty-state">
        <h2>Page not found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          Back home
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
