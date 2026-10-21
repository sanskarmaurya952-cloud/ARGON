import { useEffect } from "react";
import { HashRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { Component, type ReactNode } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import SearchPage from "./pages/SearchPage";
import MedicineDetail from "./pages/MedicineDetail";
import ScanPage from "./pages/ScanPage";
import KendrasPage from "./pages/KendrasPage";
import MyListPage from "./pages/MyListPage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";
import AppProvider from "./components/AppProvider";
import { ShieldAlert, RefreshCw } from "lucide-react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

/* Global error boundary — never show a white screen to a patient */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
          <ShieldAlert size={44} className="text-terracotta-500" />
          <h1 className="font-display mt-4 text-2xl font-semibold text-pine-950">Something broke on our side</h1>
          <p className="mt-2 text-sm text-pine-600">Your saved list is safe on this device. Please reload — or search directly from the home page.</p>
          <pre className="mt-3 max-w-full overflow-auto rounded-xl bg-cream-200 p-3 text-left text-[0.68rem] text-pine-700">{this.state.error.message}</pre>
          <button onClick={() => { this.setState({ error: null }); window.location.assign("#/"); window.location.reload(); }} className="focus-ring mt-5 flex h-13 items-center gap-2 rounded-2xl bg-pine-800 px-6 py-3.5 font-bold text-cream-50">
            <RefreshCw size={17} /> Reload AIMAN
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <p className="font-display text-7xl font-semibold text-pine-200">404</p>
      <h1 className="font-display mt-2 text-2xl font-semibold text-pine-950">Page not found</h1>
      <p className="mt-2 text-sm text-pine-600">The page you were looking for doesn’t exist — but your next medicine dose is waiting on the search page.</p>
      <Link to="/" className="focus-ring mt-5 inline-flex h-13 items-center rounded-2xl bg-pine-800 px-6 py-3.5 font-bold text-cream-50">Go home</Link>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-cream-100">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-pine-900 focus:px-4 focus:py-3 focus:text-cream-50">
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/medicine/:id" element={<MedicineDetail />} />
                <Route path="/scan" element={<ScanPage />} />
                <Route path="/kendras" element={<KendrasPage />} />
                <Route path="/my-list" element={<MyListPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AppProvider>
  );
}
