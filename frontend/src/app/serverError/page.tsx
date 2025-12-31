import ErrorPage from "@/components/feedback/errorPage/errorPage"

export default function NotAllowed() {
    return (
        <ErrorPage
            title="Server Error"
            description="Shotly is experiencing technical difficulties. Please inform me about the issue and try again later."
            link={[
                {
                    href: "mailto:yanik.kendler@gmail.com",
                    text: "Contact me",
                },
                {
                    href: "/",
                    text: "Home",
                }
            ]}
        />
    )
}