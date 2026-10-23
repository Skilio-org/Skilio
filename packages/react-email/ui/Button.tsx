// import { Button } from "@react-email/components"
// import { Button } from "@frontend/src/components/ui/button";

type ButtonProps = React.PropsWithChildren & { href: string }

export const LinkButton = ({ children, href }: ButtonProps) => {

  return (
    <a
      href={href}
      className="bg-yellow-200 text-white rounded-md font-semibold text-sm mt-2 mb-7 inline-block text-center no-underline px-7 py-3.5"
    >
      {children}
    </a>
  )
}
