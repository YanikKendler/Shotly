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
                Email: <Link className={"inline"} href="mailto:yanik@shotly.at">yanik@shotly.at</Link>
            </p>

            <h2>2. Collection and Processing of Personal Data</h2>
            <p>The following personal data is processed when using Shotly:</p>
            <ul>
                <li>Username</li>
                <li>Email address</li>
                <li>Password (stored in encrypted form)</li>
            </ul>
            <br/>
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

            <h2>5. Cookies</h2>
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

            <h2>8. Use of TelemetryDeck to analyze app usage</h2>

            <p>
                We use the privacy-friendly analytics service TelemetryDeck (provider: TelemetryDeck GmbH,
                Von-der-Tann-Str. 54, 86159 Augsburg, Germany) to analyze usage data. The use is based on Art. 6 para. 1
                lit. b GDPR, as we require reliable and efficient tools for collecting app usage data in order to
                fulfill the contract with you, our customer.
            </p>

            <h3>What data is transferred?</h3>

            <p>
                The data processed by TelemetryDeck is completely anonymized and does not allow any conclusions to be
                drawn about personal information.
            </p>

            <p>The following data is collected, among other things:</p>

            <ul>
                <li>An anonymized, untraceable user ID (per browser used to access the app),</li>
                <li>Actions defined by the app publisher (e.g., "app launched," "settings opened"),</li>
                <li>A rounded timestamp (to the nearest hour),</li>
                <li>Device metadata (e.g., system version, app version, device type),</li>
                <li>Additional metadata defined by the app publisher (e.g., "number of items in the database").</li>
            </ul>

            <h3>What is not stored?</h3>

            <ul>
                <li>No IP addresses (not in logs, not in the database),</li>
                <li>No cookies or tracking technologies,</li>
                <li>No persistent identifiers that could be traced back to individuals.</li>
            </ul>

            <br/>

            <p>
                The source code of the TelemetryDeck SDK is completely open source and available on GitHub:
                <Link className={"inline"} href="https://github.com/TelemetryDeck">https://github.com/TelemetryDeck</Link>
            </p>
            <p>
                Further information on the exact data processing by TelemetryDeck can be found at:
                <Link className={"inline"} href="https://telemetrydeck.com/privacy">https://telemetrydeck.com/privacy</Link>
                and at <Link className={"inline"} href="https://telemetrydeck.com/docs/guides/privacy-faq/">https://telemetrydeck.com/docs/guides/privacy-faq/</Link>
            </p>
            <br/>
            <br/>
            <br/>
        </>
    )
}