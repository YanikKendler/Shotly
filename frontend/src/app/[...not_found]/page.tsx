import ErrorPage from "@/components/feedback/errorPage/errorPage"

export default function notFound(){
    return <ErrorPage
        title="404"
        description="Page not found"
    />
}