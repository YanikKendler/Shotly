import Link from "next/link"

export default function Legal(){
    return (
        <>
            <Link href={"/legal/cookies"}>cookies</Link>
            <Link href={"/legal/privacy"}>privacy</Link>
            <Link href={"/legal/legalNotice"}>legal notice</Link>
            <Link href={"/legal/termsOfUse"}>terms of use</Link>
        </>
    )
}