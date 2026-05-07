import ErrorPage from "@/components/app/feedback/errorPage/errorPage"

export default function notFound(){
    return <ErrorPage
        title="404"
        description="Page not found"
    />
}