import ErrorPage from "@/components/feedback/errorPage/errorPage"

export default function NotAllowed() {
    return (
        <ErrorPage
            title="Server Error"
            description="Shotly is experiencing technical difficulties. I am working to resolve the issue, please try again later."
            link={[
                {
                    href: "/",
                    text: "Dashboard",
                },
                {
                    href: "/",
                    text: "Home",
                }
            ]}
        />
    )
}