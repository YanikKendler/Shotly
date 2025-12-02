import ErrorPage from "@/components/feedback/errorPage/errorPage"

export default function NotAllowed() {
    return (
        <ErrorPage settings={{
            title: "Not Allowed",
            description: "You do not have permission to access this page. Please contact the administrator if you believe this is an error.",
            link: {
                text: "Back to your dashboard",
                href: "/dashboard",
            },
        }}/>
    )
}