import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import {
	type Body_login_login_access_token as AccessToken,
	LoginService,
	type UserPublic,
	type UserRegister,
	UsersService,
} from "@/client"
import { AUTH_TOKEN_CHANGED_EVENT } from "@/context/websocket-context"
import { handleError } from "@/utils"
import useCustomToast from "./useCustomToast"
import { toast } from "sonner"

const isLoggedIn = () => {
	let valid = localStorage.getItem("access_token") != null
	return valid
	// if (!valid) return valid

	// console.log("Testing access token...")
	// LoginService.testToken()
	// .then((response) => {
	// 	if (response.status != 200) {
	// 		console.log("Access token is invalid, removing it from localStorage")
	// 		localStorage.removeItem("access_token")
	// 		window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
	// 		valid = false;
	// 	}
	// }).catch((err) => {
	// 	console.error("Error testing access token:", err)
	// 	localStorage.removeItem("access_token")
	// 	window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
	// 	valid = false;
	// })
	// return valid;
}

const useAuth = () => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { showErrorToast } = useCustomToast()

	const {
		data: user,
		isPending,
		isFetching,
		error,
		refetch,
	} = useQuery<UserPublic | null, Error>({
		queryKey: ["currentUser"],
		queryFn: async (): Promise<UserPublic | null> => {
			
			try {
				const { data: account } = await UsersService.readUserMe()
				queryClient.setQueryData(["currentUser"], account)
				return account
			} catch (error) {
				toast.error("Failed to fetch user data")
				localStorage.removeItem("access_token")
				queryClient.removeQueries({ queryKey: ["currentUser"] })
				window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
				return null
			}
		},
		enabled: isLoggedIn(),
	})

	const signUpMutation = useMutation({
		mutationFn: (data: UserRegister & { role?: "freelancer" | "client" }) => {
			
			return UsersService.registerUser({
				body: {
					...data,
					active_role: data.active_role ?? data.role ?? "client",
				},
			})
		},
		onSuccess: (_result, data) => {
			const role = data.active_role ?? data.role
			if (role) localStorage.setItem(`account-role:${data.email.trim().toLowerCase()}`, role)
			navigate({ to: "/login" })
		},
		onError: handleError.bind(showErrorToast),
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] })
		},
	})

	const login = async (data: AccessToken) => {		
		try {
			const response = await LoginService.loginAccessToken({
				body: data,
			})
			localStorage.setItem("access_token", response.data.access_token)
			window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
			const { data: account } = await UsersService.readUserMe()
			queryClient.setQueryData(["currentUser"], account)
			return account
		} catch (error) {
			toast.error("Failed to fetch user data")
			localStorage.removeItem("access_token")
			queryClient.removeQueries({ queryKey: ["currentUser"] })
			window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))	
		}
	}

	const loginMutation = useMutation({
		mutationFn: login,
		onSuccess: (account) => {
			const role = account.active_role || localStorage.getItem(`account-role:${account.email.trim().toLowerCase()}`)
			if (account.active_role) {
				localStorage.setItem(`account-role:${account.email.trim().toLowerCase()}`, account.active_role)
			}
			if (account.is_active && !account.is_superuser) {
				navigate({
					to: role === "freelancer" ? "/freelancer-dashboard" : "/dashboard",
				})
			} else if (account.is_superuser) {
				navigate({
					to: "/admin",
				})
			}
		},
		onError: handleError.bind(showErrorToast),
	})

	const logout = () => {
		localStorage.removeItem("access_token")
		window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
		queryClient.clear()
		navigate({ to: "/login" })
	}

	return {
		signUpMutation,
		loginMutation,
		logout,
		user,
		isPending,
		isFetching,
		error,
		refetch,
	}
}

export { isLoggedIn }
export default useAuth
