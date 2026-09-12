import { Appearance } from "@/components/Common/Appearance";
import { Logo } from "@/components/Common/Logo";
import artwork from "/assets/images/bg-image-with-text.png";
import { Footer } from "./Footer";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Logo className="h-8" />
          <Appearance />
        </div>
        <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center outline-none">
          <div className="w-full max-w-115">{children}</div>
        </main>
        <Footer />
      </div>
      <div className="bg-muted relative hidden min-h-svh overflow-hidden lg:block dark:bg-zinc-900">
        <img
          src={artwork}
          alt="login page artwork"
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
      </div>
    </div>
  );
}
