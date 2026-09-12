import { Link } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 px-5 py-12 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1344px]">
        <div className="flex flex-col gap-8 border-b border-white/15 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <img src="/assets/images/freelancer-logo-light.png" alt="Freelancer" className="h-8 w-auto self-start" />
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-300">
            <a href="#talent" className="hover:text-white">
              Find talent
            </a>
            <a href="#categories" className="hover:text-white">
              Categories
            </a>
            <a href="#how-it-works" className="hover:text-white">
              How it works
            </a>
            <Link to="/login" className="hover:text-white">
              Log in
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-3 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Freelancer. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <MessageSquare className="size-3.5" /> Built for better working relationships.
          </p>
        </div>
      </div>
    </footer>
  );
}
