import Link from "next/link"

export default function TermsOfUse(){
    return (
        <>
            <h1>Terms of Use</h1>
            <h2>1. Scope</h2>
            <p>These terms of use apply to the web application "Shotly", operated by Yanik Kendler, Pfennigmayrstraße 8, 4641 Steinhaus, Austria.</p>

            <h2>2. Description of Services</h2>
            <p>Shotly is an online tool for creating and managing shotlists for film and video productions. It is available with a free basic plan and a paid Pro plan.</p>

            <h2>3. Registration and User Account</h2>
            <p>Registration is required to use Shotly. This can be done via email/password or Google login. Users must provide truthful information during registration.</p>

            <h2>4. Prices and Payment Terms</h2>
            <p>The basic version is free. For unlimited access to Shotly (unlimited shotlists and collaborators), a paid Pro membership is required. Prices and conditions are available on the website.</p>

            <h2>5. Right of Withdrawal and Refunds</h2>
            <p>Since these are digital contents available immediately after purchase, the right of withdrawal expires upon user consent according to § 18 FAGG. Refunds are excluded.</p>

            <h2>6. User Content</h2>
            <p>
                Users can create shotlists and add content. They retain ownership of their content but grant Shotly
                a non-exclusive right to technically store and process it within the scope of the app’s
                functionality.
            </p>

            <h2>7. Termination / Deletion of Account</h2>
            <p>Users may delete their accounts at any time. All personal data and content will be permanently deleted upon account deletion.</p>

            <h2>8. Disclaimer</h2>
            <p>Shotly is not liable for data loss, damages, or malfunction of the web application unless caused by gross negligence.</p>

            <h2>9. Applicable Law and Jurisdiction</h2>
            <p>Austrian law applies. Jurisdiction is Wels, Austria.</p>

            <h2>10. Contact</h2>
            <p>For questions regarding these terms, please contact: <Link className={"inline"} href="mailto:yanik@shotly.at">yanik@shotly.at</Link></p>
        </>
    )
}