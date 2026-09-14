import { Appearance } from "@/components/common/appearance";
import { Logo } from "@/components/common/logo";
import artwork from "/assets/images/landing-studio-professional.webp";
import { Footer } from "./footer";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-card grid min-h-svh lg:grid-cols-[1fr_.9fr]">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Logo className="h-8" />
          <Appearance />
        </div>
        <main
          id="main-content"
          tabIndex={-1}
          className="flex flex-1 items-center justify-center py-8 outline-none sm:py-10"
        >
          <div className="w-full max-w-115">{children}</div>
        </main>
        <Footer variant="auth" />
      </div>
      <div className="bg-muted m-5 ml-0 hidden flex-col overflow-hidden rounded-2xl lg:flex">
        <img
          src={artwork}
          alt="Independent professional working at a sunlit studio desk"
          width={1448}
          height={1086}
          className="min-h-0 flex-1 object-cover"
        />
        <div className="bg-brand-50 border-brand-200 border-t p-10 xl:p-12">
          <h2 className="font-display text-4xl font-medium tracking-[-0.04em]">
            Good people.
            <br />
            <span className="text-primary">Great work.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-7">
            A place to find your next collaborator, build your independent career, and do work you care about.
          </p>
        </div>
      </div>
    </div>
  );
}
