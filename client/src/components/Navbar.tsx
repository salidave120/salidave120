import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition hover:text-amber-600 ${isActive ? "text-amber-600" : "text-slate-600"}`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
            🔨
          </span>
          Gavel &amp; Key
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/listings" className={navLinkClass} end>
            All Auctions
          </NavLink>
          <NavLink to="/listings?category=car" className={navLinkClass}>
            Cars
          </NavLink>
          <NavLink to="/listings?category=house" className={navLinkClass}>
            Houses
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/listings/new"
                className="hidden rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 sm:inline-block"
              >
                Create Listing
              </Link>
              <div className="hidden text-sm text-slate-600 sm:block">Hi, {user.name.split(" ")[0]}</div>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
