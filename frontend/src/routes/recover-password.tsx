import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import {
  createFileRoute,
  Link as RouterLink,
  redirect,
} from "@tanstack/react-router"
import { ArrowLeft, ArrowRight, Mail } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { LoginService } from "@/client"

import { AuthLayout } from "@/components/Common/AuthLayout"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"

import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"

import { handleError } from "@/utils"

/* =========================================================
   VALIDATION
   ========================================================= */

const formSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
})

type FormData = z.infer<typeof formSchema>

/* =========================================================
   ROUTE
   ========================================================= */

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,

  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/dashboard",
      })
    }
  },

  head: () => ({
    meta: [
      {
        title: "Recover password | Freelancer",
      },
      {
        name: "description",
        content:
          "Recover access to your Freelancer account by requesting a password reset link.",
      },
    ],
  }),
})

/* =========================================================
   RECOVER PASSWORD
   ========================================================= */

function RecoverPassword() {
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),

    mode: "onBlur",

    defaultValues: {
      email: "",
    },
  })

  /* =======================================================
     API
     ======================================================= */

  const recoverPassword = async (data: FormData) => {
    await LoginService.recoverPassword({
      path: {
        email: data.email,
      },
    })
  }

  const mutation = useMutation({
    mutationFn: recoverPassword,

    onSuccess: () => {
      showSuccessToast("Password recovery email sent successfully.")

      form.reset()
    },

    onError: handleError.bind(showErrorToast),
  })

  /* =======================================================
     SUBMIT
     ======================================================= */

  const onSubmit = (data: FormData) => {
    if (mutation.isPending) return

    mutation.mutate(data)
  }

  return (
    <AuthLayout>
      <div className="mx-auto w-full max-w-[460px]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
            className="w-full"
          >
            {/* =================================================
                BACK TO LOGIN
                ================================================= */}

            <RouterLink
              to="/login"
              className="
                mb-8
                inline-flex
                items-center
                gap-2
                rounded-md
                text-sm
                font-medium
                text-muted-foreground
                transition-colors
                hover:text-foreground
                focus-visible:outline-none
                focus-visible:ring-[3px]
                focus-visible:ring-ring/30
              "
            >
              <ArrowLeft className="size-4" />
              Back to login
            </RouterLink>

            {/* =================================================
                HEADER
                ================================================= */}

            <div className="mb-8">
              {/* <div
                className="
                  mb-5
                  flex
                  size-12
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-primary/20
                  bg-accent
                  text-accent-foreground
                  shadow-sm
                "
              >
                <Mail className="size-5" />
              </div> */}

              <h1
                className="
                  font-display
                  text-[42px]
                  font-bold
                  leading-[0.98]
                  tracking-[-0.045em]
                  text-foreground
                  sm:text-[46px]
                "
              >
                Forgot your <br />
                password?
              </h1>

              <p
                className="
                  mt-4
                  max-w-[400px]
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                No problem. Enter the email address associated with your account
                and we'll send you a link to reset your password.
              </p>
            </div>

            {/* =================================================
                EMAIL
                ================================================= */}

            <div className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel
                      className="
                        text-[13px]
                        font-medium
                        text-foreground
                      "
                    >
                      Email address
                    </FormLabel>

                    <FormControl>
                      <div className="relative">
                        <Mail
                          className="
                            pointer-events-none
                            absolute
                            left-4
                            top-1/2
                            size-4
                            -translate-y-1/2
                            text-muted-foreground
                          "
                        />

                        <Input
                          data-testid="email-input"
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          disabled={mutation.isPending}
                          className="
                            h-12
                            rounded-xl
                            border-input
                            bg-card
                            pl-11
                            pr-4
                            text-sm
                            text-foreground
                            shadow-none
                            transition-[border-color,box-shadow,background-color]
                            placeholder:text-muted-foreground/65
                            hover:border-foreground/20
                            focus-visible:border-primary/50
                            focus-visible:ring-[3px]
                            focus-visible:ring-ring/25
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                          {...field}
                        />
                      </div>
                    </FormControl>

                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* =================================================
                  SUBMIT
                  ================================================= */}

              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                disabled={mutation.isPending}
                className="
                  h-12
                  w-full
                  gap-2
                  rounded-xl
                  bg-primary
                  text-sm
                  font-semibold
                  text-primary-foreground
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-px
                  hover:bg-primary/90
                  hover:shadow-md
                  active:translate-y-0
                  active:bg-primary/85
                  focus-visible:ring-[3px]
                  focus-visible:ring-ring/30
                  disabled:pointer-events-none
                  disabled:opacity-60
                "
              >
                Send recovery link
                {!mutation.isPending && <ArrowRight className="size-4" />}
              </LoadingButton>
            </div>

            {/* =================================================
                FOOTER
                ================================================= */}

            <div
              className="
                mt-7
                border-t
                border-border/70
                pt-6
                text-center
                text-sm
                text-muted-foreground
              "
            >
              Remember your password?{" "}
              <RouterLink
                to="/login"
                className="
                  font-medium
                  text-foreground
                  underline
                  decoration-border
                  underline-offset-4
                  transition-colors
                  hover:text-primary
                  hover:decoration-primary/40
                "
              >
                Log in
              </RouterLink>
            </div>
          </form>
        </Form>
      </div>
    </AuthLayout>
  )
}
