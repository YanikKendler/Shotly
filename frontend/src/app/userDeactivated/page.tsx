import ErrorPage from "@/components/feedback/errorPage/errorPage"

export default function NotAllowed() {
    return (
        <ErrorPage
            title="Acount Deactivated"
            description="Your account has been specifically deactivated by an administrator."
            noLink
        />
    )
}