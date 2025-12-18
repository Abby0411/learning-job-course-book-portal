import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("userEmail") || ""
  );

  return (
    <div className="min-h-screen bg-gray-50">
    <AppNavbar
      token={token}
      userEmail={userEmail}
      setToken={setToken}
      setUserEmail={setUserEmail}
    />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/items/:id"
        element={<ItemDetailsPage />}
      />
      <Route
        path="/login"
        element={<LoginPage setToken={setToken} setUserEmail={setUserEmail} />}
      />
      <Route
        path="/account"
        element={<AccountPage token={token} userEmail={userEmail} />}
      />
      <Route
        path="/add-item"
        element={<AddItemPage token={token} />}
      />
    </Routes>
  </div>
  );
}

function AppNavbar({ token, userEmail, setToken, setUserEmail }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    setUserEmail("");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
            J
          </div>
          <span className="font-semibold text-lg text-gray-800">
            Job / Course / Book Portal
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <span className="hidden sm:block text-gray-500">
            Powered by your MERN backend
          </span>
          {token ? (
            <>
              <span className="text-gray-600 hidden sm:block">
                  {userEmail}
              </span>
              <Link
                to="/add-item"
                className="px-3 py-1 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Add item
              </Link>
              <Link
                to="/account"
                className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                My account
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-lg border text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function HomePage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = async (overridePage) => {
    const currentPage = overridePage || page;
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (category) params.append("category", category);
      params.append("page", currentPage);

      const res = await fetch(`${API_BASE}/items?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load items");
      }

      setItems(data.items || []);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load items. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pages) return;
    setPage(newPage);
    fetchItems(newPage);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Find jobs, courses, and books in one place
        </h1>
        <p className="text-gray-600">
          Use the search and filters below. Results come directly from your Node + MongoDB API.
        </p>
      </section>

      <section className="mb-6">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          <input
            type="text"
            placeholder="Search React jobs, ML courses, Python books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All types</option>
            <option value="job">Jobs</option>
            <option value="course">Courses</option>
            <option value="book">Books</option>
          </select>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </section>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading items...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">No results found. Try changing search or category.</p>
      ) : (
        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <article
              key={item._id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col"
            >
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 mb-2 uppercase tracking-wide">
                {(item.type || "item").toUpperCase()}
              </span>

              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {item.title}
              </h3>

              <p className="text-sm text-gray-500 mb-1">
                {item.location || item.provider || item.author}
              </p>

              {item.salary && (
                <p className="text-sm font-medium text-emerald-600 mb-2">
                  {item.salary}
                </p>
              )}

              <p className="text-sm text-gray-600 flex-1 mb-3">
                {item.description}
              </p>

              <Link
                to={`/items/${item._id}`}
                className="self-start text-sm text-blue-600 font-medium hover:text-blue-700"
              >
                  View details →
              </Link>
              
            </article>
          ))}
        </section>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 text-gray-700 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pages}
            className="px-3 py-1 text-sm rounded-lg border border-gray-300 text-gray-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}

function LoginPage({ setToken, setUserEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      setToken(data.token);
      setUserEmail(data.user.email);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.user.email);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Login</h1>
      <p className="text-sm text-gray-600 mb-6">
        Use the same email and password you created from the backend seeder.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}

function AccountPage({ token, userEmail }) {
  const navigate = useNavigate();

  // simple protection: if no token, send to login
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) {
    return null; // nothing while redirecting
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">My account</h1>
      <p className="text-sm text-gray-600 mb-6">
        Basic information about your logged-in user.
      </p>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Email
          </p>
          <p className="text-sm text-gray-900">{userEmail}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Status
          </p>
          <p className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            Logged in
          </p>
        </div>
      </section>
    </main>
  );
}

function AddItemPage({ token }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("job");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Protect route: if no token, redirect to login
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  if (!token) {
    return null; // nothing while redirecting
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          category,
          description,
          location,
          salary,
          link,
          image,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create item");
      }

      setSuccess("Item created successfully.");
      // optional: clear form
      setTitle("");
      setDescription("");
      setLocation("");
      setSalary("");
      setLink("");
      setImage("");

      // optional: go back to home after a short delay
      setTimeout(() => navigate("/"), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Add new item</h1>
      <p className="text-sm text-gray-600 mb-6">
        Create a new job, course, or book entry in your portal.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="job">Job</option>
            <option value="course">Course</option>
            <option value="book">Book</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location / Provider / Author
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salary / price (optional)
          </label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            External link (optional)
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL (optional)
          </label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create item"}
        </button>
      </form>
    </main>
  );
}

import { useParams } from "react-router-dom"; // at top of file, already using from router

function ItemDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [recError, setRecError] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/items/${id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load item");
        }
        setItem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  useEffect(() => {
  const fetchRecommended = async () => {
    try {
      setRecError("");
      // if this is a book, call external-backed endpoint
      const endpoint =
        item?.category === "book"
          ? `${API_BASE}/recommend/books`
          : `${API_BASE}/recommend`; // your existing same-category logic

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load recommendations");
      setRecommended(data.items || []);
    } catch (err) {
      setRecError(err.message);
    }
  };
  if (item) {
    fetchRecommended();
  }
}, [id, item?.category]);



  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-gray-500">Loading item...</p>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-red-600 text-sm">
          {error || "Item not found"}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      <p className="text-xs text-gray-500">
        <Link to="/" className="text-blue-600 hover:text-blue-700">
          ← Back to list
        </Link>
      </p>

      <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 uppercase tracking-wide">
        {(item.category || item.type || "item").toUpperCase()}
      </span>

      <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>

      <p className="text-sm text-gray-500">
        {item.location || item.provider || item.author}
      </p>

      {item.salary && (
        <p className="text-sm font-semibold text-emerald-600">
          {item.salary}
        </p>
      )}

      <p className="text-sm text-gray-700 whitespace-pre-line">
        {item.description}
      </p>

      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center text-sm text-blue-600 font-medium hover:text-blue-700"
        >
          Open external link →
        </a>
      )}
      {recommended.length > 0 && (
      <section className="mt-10 border-t border-gray-100 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Recommended for you
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {recommended.map((rec) => (
            <a
              key={rec._id}
              href={rec.link || "#"}
              target="_blank"
              rel="noreferrer"
              className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
            >
              <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">
                {(rec.category || rec.type || "item").toUpperCase()}
              </p>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {rec.title}
              </p>
              <p className="text-xs text-gray-500 mb-1">
                {rec.author || rec.location || rec.provider}
              </p>
              {rec.salary && (
                <p className="text-xs text-emerald-600 font-medium">
                  {rec.salary}
                </p>
              )}
            </a>
          ))}
        </div>
      </section>
    )}
    </main>
  );
}

export default App;
