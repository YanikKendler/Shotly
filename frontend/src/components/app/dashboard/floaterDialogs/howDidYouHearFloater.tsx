import React, {useState} from "react"
import Radio, {RadioResult} from "@/components/basic/radio/radio"
import {errorNotification} from "@/service/NotificationService"
import {useApolloClient} from "@apollo/client"
import gql from "graphql-tag"

export default function HowDidYouHearFloater({
    hideFloater
}:{
    hideFloater: () => void
}){
    const client = useApolloClient()

    const [howDidYouHearReason, setHowDidYouHearReason] = useState("")
    const [howDidYouHearText, setHowDidYouHearText] = useState("")

    const handleHowDidYouHearReasonChange = (result: RadioResult) => {
        setHowDidYouHearReason(result.value || "")
        if(result.value == "other")
            setHowDidYouHearText(result.otherText)
    }

    const handleHowDidYouHearReasonSubmit = () => {
        let reason = howDidYouHearReason
        if(howDidYouHearReason == "other")
            reason = howDidYouHearText

        client.mutate({
            mutation: gql`
                mutation setHowDidYourHearReason($reason: String!){
                    howDidYourHearReason(reason: $reason) {
                        id
                    }
                }
            `,
            variables: {reason: reason}
        }).then(({errors}) => {
            if(errors){
                console.error(errors)
                errorNotification({
                    title: "Failed to submit feedback",
                })
            }
        })

        hideFloater()
    }

    return (
        <div className="howDidYouHear">
            <h3>How did you hear about Shotly?</h3>
            <Radio
                options={[
                    {value: "friend", label: "A friend"},
                    {value: "work", label: "From work or colleagues"},
                    {value: "reddit", label: "A Reddit post"},
                    {value: "newsletter", label: "A Newsletter"},
                    {value: "search", label: "A search engine (Google, Bing, etc.)"},
                    {value: "ai", label: "An AI (GPT, Gemini, etc.)"},
                ]}
                value={howDidYouHearReason}
                onValueChange={handleHowDidYouHearReasonChange}
                textOption={true}
            />
            <button
                disabled={
                    (howDidYouHearReason == "") ||
                    (howDidYouHearReason == "other" && howDidYouHearText.length < 4)
                }
                onClick={handleHowDidYouHearReasonSubmit}
                className={"main"}
            >
                Send
            </button>
        </div>
    )
}