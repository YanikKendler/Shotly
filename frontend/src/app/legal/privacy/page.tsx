import Link from "next/link"

export default function Privacy(){
    return (
        <>
            <h1>Privacy Policy</h1>
            <h2>1. Controller of Data Processing</h2>
            <p>Yanik Kendler<br/>
                Pfennigmayrstraße 8<br/>
                4641 Steinhaus<br/>
                Austria<br/>
                Email: yanik@shotly.at</p>

            <h2>2. Collection and Processing of Personal Data</h2>
            <p>The following personal data is processed when using Shotly:</p>
            <ul>
                <li>Username</li>
                <li>Email address</li>
                <li>Password (stored in encrypted form)</li>
            </ul>
            <p>
                Authentication and user data management are handled by the service provider <strong>Auth0</strong>
                (Okta Inc.). More information about data processing by Auth0 can be found at: <Link className={"inline"} href="https://auth0.com/privacy" target="_blank" rel="noopener noreferrer">https://auth0.com/privacy</Link>
            </p>

            <h2>3. Purpose and Legal Basis of Data Processing</h2>
            <p>Data is processed for the purpose of providing and using the web application and managing user
                accounts.<br/>
                Legal basis: Art. 6 (1) lit. b GDPR (performance of a contract) and Art. 6 (1) lit. f GDPR (legitimate
                interest).
            </p>

            <h2>4. Hosting and Data Processing</h2>
            <p>
                Shotly is hosted on <strong>Google Cloud Run</strong> (Google LLC). Data processing may occur in data
                centers located in the EU or the USA.<br/>
                A data processing agreement with Google exists pursuant to Art. 28 GDPR and includes standard
                contractual clauses for securing data transfers to third countries.
            </p>

            <h2>5. Cookies & Analytics</h2>
            <p>
                Shotly only uses technically necessary cookies to ensure the basic functionality of the web application
                (e.g., for login and session management). No tracking or marketing cookies are used.
            </p>

            <h2>6. Storage Duration</h2>
            <p>
                Your data is stored as long as necessary to use the app. When the account is deleted, all personal data
                will be permanently removed.
            </p>

            <h2>7. Rights of Data Subjects</h2>
            <p>
                You have the right to access, rectify, delete, restrict processing, and data portability. You may also
                withdraw consent at any time.
            </p>
            <p>
                For complaints or questions: <Link className={"inline"} href="mailto:yanik@shotly.at">yanik@shotly.at</Link>
            </p>

            <h2>8. Contact for Data Protection Issues</h2>
            <p>
                Email: <Link className={"inline"} href="mailto:yanik@shotly.at">yanik@shotly.at</Link>
            </p>
        </>
    )
}