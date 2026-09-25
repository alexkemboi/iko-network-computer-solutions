import React, { Suspense, lazy, useEffect } from "react";
import "./portal.css";
import { AuthProvider, useAuth, canAccess } from "./AuthContext";
import { ToastProvider } from "./ui";
import { useHashRoute } from "./useHashRoute";
import AuthPage from "./AuthPage";
import DashboardLayout from "./DashboardLayout";

// Pages load on demand so the public website bundle stays light.
const Overview = lazy(() => import("./pages/Overview"));
const Orders = lazy(() => import("./pages/Orders"));
const Payments = lazy(() => import("./pages/Payments"));
const Enquiries = lazy(() => import("./pages/Enquiries"));
const BulkSms = lazy(() => import("./pages/BulkSms"));
const BulkPayments = lazy(() => import("./pages/BulkPayments"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Users = lazy(() => import("./pages/Users"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));

const ALL = ["admin", "staff", "customer"];
const STAFF = ["admin", "staff"];
const ADMIN = ["admin"];

const ROUTES = [
  { path: "/app", roles: ALL, title: "Overview", render: (p) => <Overview {...p} /> },
  { path: "/app/orders", roles: ALL, title: "Orders", render: (p) => <Orders {...p} /> },
  { path: "/app/payments", roles: ALL, title: "Payments", render: (p) => <Payments {...p} /> },
  { path: "/app/profile", roles: ALL, title: "My profile", render: (p) => <Profile {...p} /> },
  { path: "/app/enquiries", roles: STAFF, title: "Enquiries", render: (p) => <Enquiries {...p} /> },
  { path: "/app/sms", roles: STAFF, title: "Bulk SMS", render: (p) => <BulkSms {...p} /> },
  { path: "/app/products", roles: STAFF, title: "Products", render: (p) => <Catalog key="product" kind="product" {...p} /> },
  { path: "/app/services", roles: STAFF, title: "Services", render: (p) => <Catalog key="service" kind="service" {...p} /> },
  { path: "/app/payouts", roles: ADMIN, title: "Bulk Payments", render: (p) => <BulkPayments {...p} /> },
  { path: "/app/users", roles: ADMIN, title: "Users", render: (p) => <Users {...p} /> },
  { path: "/app/settings", roles: ADMIN, title: "Settings", render: (p) => <Settings {...p} /> },
];

const Splash = () => (
  <div className="px-splash" role="status">
    <span className="ix-spinner" aria-hidden="true" />
    <span>Loading…</span>
  </div>
);

const Redirect = ({ to, navigate }) => {
  useEffect(() => navigate(to, { replace: true }), [to, navigate]);
  return <Splash />;
};

const Router = () => {
  const { user, loading } = useAuth();
  const [{ path, query }, navigate] = useHashRoute();
  const route = ROUTES.find((r) => r.path === path);

  useEffect(() => {
    document.title = `${route ? route.title : path === "/signup" ? "Create account" : "Log in"} · IKONEX Portal`;
  }, [route, path]);

  if (loading) return <Splash />;

  if (path === "/login" || path === "/signup") {
    if (user) return <Redirect to={query.get("next") || "/app"} navigate={navigate} />;
    return <AuthPage mode={path.slice(1)} navigate={navigate} next={query.get("next")} />;
  }

  if (!user) return <Redirect to={`/login?next=${encodeURIComponent(path)}`} navigate={navigate} />;
  if (!route) return <Redirect to="/app" navigate={navigate} />;

  const allowed = canAccess(user, route.roles);
  return (
    <DashboardLayout path={path} navigate={navigate}>
      <Suspense fallback={<div className="px-skeleton px-skeleton--block" />}>
        {allowed ? (
          route.render({ query, navigate })
        ) : (
          <div className="px-empty px-empty--page">
            <h1>No access</h1>
            <p className="px-muted">Your account doesn't have permission to open {route.title}. Ask an administrator if you need it.</p>
            <button type="button" className="ix-btn ix-btn--primary" onClick={() => navigate("/app")}>Go to overview</button>
          </div>
        )}
      </Suspense>
    </DashboardLayout>
  );
};

const Portal = () => (
  <AuthProvider>
    <ToastProvider>
      <div className="px-root">
        <Router />
      </div>
    </ToastProvider>
  </AuthProvider>
);

export default Portal;
