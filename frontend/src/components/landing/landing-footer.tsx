import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/common/logo";

export function LandingFooter() {
  return (
    <footer className="border-border bg-background border-t px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1344px]">
        <div className="border-border flex flex-col gap-8 border-b pb-10 sm:flex-row sm:items-center sm:justify-between">
          <Logo className="h-8 w-auto self-start" />
          <nav aria-label="Footer navigation" className="text-muted-foreground flex flex-wrap gap-x-7 gap-y-3 text-sm">
            <a href="#talent" className="hover:text-foreground">
              Find talent
            </a>
            <a href="#categories" className="hover:text-foreground">
              Categories
            </a>
            <a href="#how-it-works" className="hover:text-foreground">
              How it works
            </a>
            <Link to="/login" className="hover:text-foreground">
              Log in
            </Link>
          </nav>
        </div>
        <div className="text-muted-foreground flex flex-col gap-3 pt-7 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Freelancer. All rights reserved.</p>
          <p>Independent work, clearly presented.</p>
        </div>
      </div>
    </footer>
  );
}
