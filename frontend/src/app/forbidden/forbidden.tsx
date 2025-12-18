import ErrorPage from "@/components/feedback/errorPage/errorPage"

export default function Forbidden() {
    return (
        <ErrorPage
            title="Forbidden"
            description="You do not have permission to access this page. Please contact the administrator if you believe this is an error."
            link={{
                text: "Back to your dashboard",
                href: "/",
            }}
        />
    )
}