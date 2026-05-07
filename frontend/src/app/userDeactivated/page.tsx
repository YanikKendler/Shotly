import ErrorPage from "@/components/app/feedback/errorPage/errorPage"

export default function UserDeactivated() {
    return (
        <ErrorPage
            title="Acount Deactivated"
            description="Your account has been purposefully deactivated by an administrator."
            noLink
        />
    )
}