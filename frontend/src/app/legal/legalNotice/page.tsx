import Link from "next/link"

export default function LegalNotice() {
    return (
        <>
            <h1>Legal Notice</h1>
            <p><strong>Media owner and operator of the website:</strong></p>
            <p>
                Yanik Kendler<br/>
                Pfennigmayrstraße 8<br/>
                4641 Steinhaus<br/>
                Austria
            </p>
            <p>Email: <Link className={"inline"} href="mailto:yanik.kendler@gmail.com">yanik.kendler@gmail.com</Link></p>
            <p>
                <strong>Activity:</strong>
                Provision of the "Shotly" web application for creating and managing shot lists
                for film and video productions.
            </p>
            <p>
                <strong>Note:</strong>
                This website is operated by a private individual without a registered business.
            </p>
            <p>
                <strong>EU Commission platform for online dispute resolution: </strong>
                <Link className={"inline"} href="https://ec.europa.eu/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/odr</Link>
            </p>
            <p><strong>Responsible for content:</strong> Yanik Kendler</p>
        </>
    )
}