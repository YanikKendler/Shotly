import Link from "next/link"

export default function Legal(){
    return (
        <>
            <Link href={"/src/app/(public)/legal/cookies"}>cookies</Link>
            <Link href={"/src/app/(public)/legal/privacy"}>privacy</Link>
            <Link href={"/src/app/(public)/legal/legalNotice"}>legal notice</Link>
            <Link href={"/src/app/(public)/legal/termsOfUse"}>terms of use</Link>
        </>
    )
}