import { Appearance } from "@/components/Common/Appearance";
import { Footer } from "./Footer";
import logo from "/assets/images/bg-image-with-text.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-end">
          <Appearance />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-s">{children}</div>
        </div>
        <Footer />
      </div>
      <div className="relative hidden min-h-svh overflow-hidden bg-muted lg:block dark:bg-zinc-900">
        <img
          src={logo}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
      </div>
    </div>
  );
}
