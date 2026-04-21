import SimplePage from "@/components/app/simplePage/simplePage"
import Link from "next/link"

export default function freeForStudents(){
    return (
        <SimplePage>
            <title>Shotly | Free for Students</title>
            <h1>Shotly for Students</h1>
            <p>Are you a student? Shotly is available to you completely free of charge!</p>
            <p>
                Shotly was born when I was a student myself and did not want to pay wild amounts for other shotlist tools.
                If you feel that the free-tier is not enough for your needs and you genuinely cannot afford Shotly Pro,
                please reach out to me at <Link className={"inline"} href={"mailto:yanik@shotly.at"}>yanik@shotly.at</Link>
            </p>

            <p>Your email should include the following:</p>

            <ul>
                <li>Your full name</li>
                <li>The name of your school / university</li>
                <li>Any sort of proof that you actually attend said school (a screenshot of your timetable is perfectly fine, as long it shows your name)</li>
                <li>Your expected graduation date</li>
                <li>The email address associated with your existing Shotly account</li>
            </ul>
            <br/>
            <p className="small">
                If you are not a student and actually can't afford 2.99€ a month but need the pro version, please dont try to trick me. Just explain your situation and I'll probably approve your request.
            </p>
        </SimplePage>
    )
}