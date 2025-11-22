import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Home, Upload } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-card border-b border-border shadow-md animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-accent-foreground font-black text-lg">🔍</span>
          </div>
          <span className="font-black text-lg text-foreground hidden sm:inline">
            Doxing Dot Life
          </span>
          <span className="font-black text-lg text-foreground sm:hidden">
            DDL
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-accent transition-colors"
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-foreground" />
          )}
        </button>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="absolute top-16 left-0 right-0 bg-card border-b border-border md:hidden animate-slideInDown p-4 space-y-3 shadow-lg">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 text-foreground font-semibold hover:bg-muted rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
            <Link
              to="/uppostpanel"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 w-full px-4 py-3 text-foreground font-semibold hover:bg-muted rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Post
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
