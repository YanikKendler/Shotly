"use client"

import Auth from "@/Auth"
import "./landing.scss"
import Link from "next/link"
import Wordmark from "@/components/wordmark"
import React, {useEffect, useRef} from "react"
import {
    BookText, CalendarCheck,
    Check,
    Columns3Cog,
    Download,
    FileCode,
    Heart,
    Info, Blocks,
    Users
} from "lucide-react"
import Image from "next/image"
import AuthSwitcher from "@/components/utility/authSwitcher/authSwitcher"
import ThemeSwitcher from "@/components/utility/themeSwitcher/themeSwitcher"
import Skeleton from "react-loading-skeleton"
import Config from "@/Config"
import Separator from "@/components/separator/separator"
import SimplePopover from "@/components/popover/simplePopover"
import {td} from "@/service/Analytics"
import ViewPortSwitcher from "@/components/utility/viewportSwitcher/viewPortSwitcher"

export default function Landing() {
    const pageRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    function scaleImageOnScroll() {
        if(!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate how much of the image is within the viewport
        const visibleTop = Math.max(0, rect.top);

        const ratioVisible = 1-visibleTop/windowHeight

        // Map the visible ratio to a scale range (e.g., 1 to 1.5)
        const minScale = 1;
        const maxScale = 1.1;
        const scale = minScale + (maxScale - minScale) * ratioVisible;

        imageRef.current.style.transform = `scale(${scale}) translateY(-${5*ratioVisible}rem)`;
    }

    useEffect(() => {
        const url = new URL(window.location.href)

        //reset tour local storage on call
        if(url.searchParams.get("rtl") == "1"){
            localStorage.setItem(Config.localStorageKey.shotlistTourCompleted,"false")
            localStorage.setItem(Config.localStorageKey.dashboardTourCompleted,"false")
            localStorage.setItem(Config.localStorageKey.templateTourCompleted,"false")
        }

        if(pageRef.current) {
            pageRef.current.addEventListener('scroll', scaleImageOnScroll);
            window.addEventListener('resize', scaleImageOnScroll);
            scaleImageOnScroll(); // Initial call
        }
    }, []);

    return (
        <main className="landing" ref={pageRef}>
            <title>Shotly | Shotlist creation made easy</title>
            <nav>
                <div className="left">
                    <Link
                        href={"https://docs.shotly.at"}
                        target={"_blank"}
                        className={"noPadding"}
                        onClick={() => td.signal("Landing.Nav.Documentation")}
                    >
                        <BookText size={22} />
                        <ViewPortSwitcher under={"Docs"} over={"Documentation"} breakpoint={400}/>
                    </Link>
                </div>
                <div className="center">
                    <Link
                        href={"#hero"}
                        onClick={() => td.signal("Landing.Nav.Home")}
                    >Home</Link>
                    <Link
                        href={"#features"}
                        onClick={() => td.signal("Landing.Nav.Features")}
                    >Features</Link>
                    <Link
                        href={"#pricing"}
                        onClick={() => td.signal("Landing.Nav.Pricing")}
                    >Pricing</Link>
                </div>
                <div className="right">
                    <AuthSwitcher
                        authenticated={
                            <Link
                                className={"main"}
                                href={"/dashboard"}
                                onClick={() => td.signal("Landing.Nav.Dashboard")}
                            >Your Dashboard</Link>
                        }
                        unauthenticated={
                            <>
                                <button
                                    className={"secondary"}
                                    onClick={() => {
                                        td.signal("Landing.Nav.SignUp")
                                        Auth.register()
                                    }}
                                >Sign up</button>
                                <button
                                    className={"main"}
                                    onClick={() => {
                                        td.signal("Landing.Nav.LogIn")
                                        Auth.login()
                                    }}
                                >Log in</button>
                            </>
                        }
                    />
                </div>
            </nav>
            <span id="hero"></span>
            <section className="hero">
                <div className="content">
                    <div className="center">
                        <Wordmark/>
                        <p className={"tagline"}>
                            Shotlist creation made easy!
                            <br/>
                            Customize your shots, collaborate with your crew, and export to PDF for the shoot day.
                        </p>
                        <div className="arrowContainer">
                            <AuthSwitcher
                                authenticated={
                                    <Link
                                        href={"/dashboard"}
                                        onClick={() => td.signal("Landing.Hero.Dashboard")}
                                    >To your Dashboard</Link>
                                }
                                hasBeenAuthenticatedBefore={
                                    <button
                                        onClick={() => {
                                            td.signal("Landing.Hero.Dashboard")
                                            Auth.login()
                                        }}
                                    >To your Dashboard</button>
                                }
                                unauthenticated={
                                    <>
                                        <button onClick={() => {
                                            td.signal("Landing.Hero.GetStarted")
                                            Auth.login()
                                        }}>Create your first shotlist</button>
                                        <small>free, no credit card required</small>
                                    </>
                                }
                            />
                            <Image
                                className={"arrow"}
                                src={"/hero-doodles/arrow.svg"}
                                width={80}
                                height={97}
                                alt={"<--"}
                                fetchPriority={"high"}
                            />
                        </div>
                        <div className="beta">Beta</div>
                    </div>
                    <Image className={""} id={"clapboard"} src={"/hero-doodles/doodle-0.svg"} alt={"doodle"} width={128} height={118} fetchPriority={"low"}/>
                    <Image className={"first"} id={"brush"} src={"/hero-doodles/doodle-1.svg"} alt={"doodle"} width={97} height={85} fetchPriority={"low"}/>
                    <Image className={""} id={"shotlist"} src={"/hero-doodles/doodle-2.svg"} alt={"doodle"} width={179} height={111} fetchPriority={"low"}/>
                    <Image className={"third"} id={"close-up"} src={"/hero-doodles/doodle-3.svg"} alt={"doodle"} width={118} height={52} fetchPriority={"low"}/>
                    <Image className={"second"} id={"clipboard"} src={"/hero-doodles/doodle-4.svg"} alt={"doodle"} width={85} height={113} fetchPriority={"low"}/>
                    <Image className={"third"} id={"medium-shot"} src={"/hero-doodles/doodle-5.svg"} alt={"doodle"} width={126} height={37} fetchPriority={"low"}/>
                    <Image className={"second"} id={"thoughts"} src={"/hero-doodles/doodle-6.svg"} alt={"doodle"} width={59} height={52} fetchPriority={"low"}/>
                    <Image className={"first"} id={"camera"} src={"/hero-doodles/doodle-7.svg"} alt={"doodle"} width={120} height={94} fetchPriority={"low"}/></div>
            </section>
            <div className="coverHero">
                <section className="image">
                    <ThemeSwitcher
                        light={
                            <ViewPortSwitcher
                                breakpoint={500}
                                over={
                                    <Image
                                        src={"/landing-shotlist-image/shotlist-light-desktop.webp"}
                                        alt={"Image of a shotlist with its scenes listet in the left sidebar and multiple shots listed on the right"}
                                        width={2095}
                                        height={1396}
                                        ref={imageRef}
                                    />
                                }
                                under={
                                    <Image
                                        src={"/landing-shotlist-image/shotlist-light-mobile.webp"}
                                        alt={"Image of a shotlist with multiple shots listed and floating buttons to open the shotlist options"}
                                        width={580}
                                        height={1069}
                                        ref={imageRef}
                                    />
                                }
                            />
                        }
                        dark={
                            <ViewPortSwitcher
                                breakpoint={500}
                                over={
                                    <Image
                                        src={"/landing-shotlist-image/shotlist-dark-desktop.webp"}
                                        alt={"Image of a shotlist with its scenes listet in the left sidebar and multiple shots listed on the right"}
                                        width={2096}
                                        height={1397}
                                        ref={imageRef}
                                    />
                                }
                                under={
                                    <Image
                                        src={"/landing-shotlist-image/shotlist-dark-mobile.webp"}
                                        alt={"Image of a shotlist with multiple shots listed and floating buttons to open the shotlist options"}
                                        width={583}
                                        height={1071}
                                        ref={imageRef}
                                    />
                                }
                            />
                        }
                        loader={
                            <Skeleton className={"skeleton"}/>
                        }
                    />

                </section>
                <section className="features" id={"features"}>
                    <h2>Why Shotly?</h2>
                    <p className="explainer">
                        Stop fighting broken cells and rigid rows. Forget the nightmare of messy exports
                        and the being unable to filter by scene, location or actor.
                    </p>
                    <p className="extra">
                        Shotly replaces spreadsheet chaos with a workspace that adjusts to your needs.</p>
                    <div className="content">
                        <div className="feature">
                            <div className="icon">
                                <Columns3Cog size={40}/>
                            </div>
                            <h3>Customizable</h3>
                            <p>Select which attributes you want per shot and per scene.</p>
                            <Link
                                href="https://docs.shotly.at/attributes"
                                className={"noPadding"}
                                target={"_blank"}
                                onClick={() => td.signal("Landing.LearnMore.Attributes")}
                            >
                                Learn more
                            </Link>
                        </div>
                        <div className="feature">
                            <div className="icon">
                                <Download size={40}/>
                            </div>
                            <h3>Easy Export</h3>
                            <p>Export to PDF/CSV for print or distribution. Use filters to get only what you need.</p>
                            <Link
                                href="https://docs.shotly.at/shotlist/export"
                                className={"noPadding"}
                                target={"_blank"}
                                onClick={() => td.signal("Landing.Clicked.LearnMore.Export")}
                            >
                                Learn more
                            </Link>
                        </div>
                        <div className="feature">
                            <div className="icon">
                                <svg className="raw" height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 512.001 512.001">
                                    <g>
                                        <g>
                                            <path d="M344.381,143.771C254.765,56.017,102.37,103.776,79.825,227.7c-31.849,4.598-59.138,25.445-72.018,55.076
                                                c-0.016,0.035-0.032,0.07-0.047,0.107c-26.687,61.602,18.784,130.232,85.51,130.232h282.267
                                                c75.246,0,136.463-61.216,136.463-136.462C512,189.241,430.314,123.682,344.381,143.771z M375.537,381.12H93.271
                                                c-69.246,0-84.534-98.263-18.714-119.456c14.753-4.65,43.01-7.348,74.38,21.892c6.464,6.024,16.586,5.667,22.61-0.794
                                                c6.024-6.464,5.668-16.586-0.794-22.61c-17.93-16.712-38.071-27.33-58.484-31.453c22.034-99.077,147.374-131.851,215.247-56.305
                                                c4.189,4.661,10.714,6.451,16.693,4.57c67.272-21.117,135.795,29.374,135.795,99.69
                                                C480.005,334.256,433.141,381.12,375.537,381.12z"/>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                            <h3>Cloud Based</h3>
                            <p>Your Shotlist live in the cloud. Accessible from anywhere at any time.</p>
                        </div>
                        <div className="feature">
                            <div className="icon">
                                <Users size={40}/>
                            </div>
                            <h3>Live Collaboration</h3>
                            <p>Share your shotlist with friends or colleagues and create together.</p>
                            <Link
                                href="https://docs.shotly.at/shotlist/collaboration"
                                className={"noPadding"}
                                target={"_blank"}
                                onClick={() => td.signal("Landing.Clicked.LearnMore.Collaboration")}
                            >
                                Learn more
                            </Link>
                        </div>
                        <div className="feature">
                            <div className="icon">
                                <Blocks size={40}/>
                            </div>
                            <h3>Templates</h3>
                            <p>Save your preferred Attributes and Layouts and reuse them for future Shotlists.</p>
                            <Link
                                href="https://docs.shotly.at/templates"
                                className={"noPadding"}
                                target={"_blank"}
                                onClick={() => td.signal("Landing.Clicked.LearnMore.Templates")}
                            >
                                Learn more
                            </Link>
                        </div>
                        <div className="feature">
                            <div className="icon">
                                <FileCode size={40}/>
                            </div>
                            <h3>Source Available</h3>
                            <p>All the code is public on GitHub - self host your shotlists or add your own features.</p>
                            <Link
                                href="https://github.com/YanikKendler/Shotly/blob/main/README.md##License"
                                className={"noPadding"}
                                target={"_blank"}
                                onClick={() => td.signal("Landing.Clicked.LearnMore.License")}
                            >
                                Learn more
                            </Link>
                        </div>
                    </div>
                </section>
                <section className="pricing" id={"pricing"}>
                    <div className="content">
                        <div className="tier">
                            <div className="top">
                                <p className="name">Basic</p>
                                <div className="price">
                                    <p className={"cost"}>Free forever</p>
                                    <SimplePopover
                                        content={
                                            <>
                                                <p>
                                                Shotly's basic tier will always stay free, and you will always be
                                                able to export your data.
                                                </p>
                                                <p>
                                                Servers cost money though and this app is a lot of work, so if you
                                                end up using Shotly a lot, please consider the pro tier.
                                                </p>
                                            </>
                                        }
                                        className={"noPadding info"}
                                    >
                                        <Info size={20}/>
                                    </SimplePopover>
                                </div>
                            </div>
                            <Separator/>
                            <ul className="features">
                                <li><Check size={20} strokeWidth={3}/>1 free shotlist</li>
                                <li><Check size={20} strokeWidth={3}/>{Config.constant.maxCollaboratorsInFreePlan} collaborators</li>
                                <li><Check size={20} strokeWidth={3}/>unlimited scenes</li>
                                <li><Check size={20} strokeWidth={3}/>unlimited shots</li>
                            </ul>
                            <button
                                className="select secondary"
                                onClick={() => {
                                    td.signal("Landing.Price.Basic")
                                    Auth.login()
                                }}
                            >Get started</button>
                        </div>

                        <div className="tier">
                            <div className="top">
                                <p className="name">Pro</p>
                                <div className="price">
                                    <p className={"cost"}>2.99€</p>
                                    <p className="frequency">/mo</p>
                                </div>
                            </div>
                            <Separator/>
                            <ul className="features">
                                <li className={"bold"}><Check size={20} strokeWidth={3}/>unlimited shotlists</li>
                                <li className={"bold"}><Check size={20} strokeWidth={3}/>unlimited collaborators</li>
                                <li className={"thin"}><Check size={20} strokeWidth={3}/>unlimited scenes</li>
                                <li className={"thin"}><Check size={20} strokeWidth={3}/>unlimited shots</li>
                                <li className={"gray"}><CalendarCheck size={20} strokeWidth={2.5}/>cancel any time</li>
                                <li className={"gray"}><Heart size={20} strokeWidth={3}/>support this project</li>
                            </ul>
                            <button
                                className="select main"
                                onClick={() => {
                                    td.signal("Landing.Price.Pro")
                                    Auth.loginForPro()
                                }}
                            >Go unlimited</button>
                        </div>
                    </div>
                    <Link
                        href="/freeForStudents"
                        className={"freeForStudents"}
                    >Shotly for Students</Link>
                </section>
                <footer>
                    <div className={"credits"}>
                        <Wordmark/>
                        <p className={"createdBy"}>
                            {"created with ♥ by "}
                            <Link
                                href={"https://yanik.kendler.me"}
                                target={"_blank"}
                                className={"noPadding"}
                            >
                                Yanik Kendler
                            </Link>
                        </p>
                        <Link
                            className={"noPadding"}
                            href={"https://github.com/YanikKendler/shotly"}
                            target={"_blank"}
                        >
                            GitHub.com/YanikKendler/Shotly
                        </Link>
                        <p className={"copyright"}>© 2026 Yanik Kendler. Source Available under the PolyForm Noncommercial License.</p>
                    </div>
                    <div>
                        <h3>Legal</h3>
                        <Link className={"noPadding"} href={"/legal/cookies"}>Cookies</Link>
                        <Link className={"noPadding"} href={"/legal/privacy"}>Privacy</Link>
                        <Link className={"noPadding"} href={"/legal/legalNotice"}>Legal notice</Link>
                        <Link className={"noPadding"} href={"/legal/termsOfUse"}>Terms of use</Link>
                    </div>

                    <div>
                        <h3>Support</h3>
                        <Link className={"noPadding"} href={"https://docs.shotly.at"} target={"_blank"}>Documentation</Link>
                        <Link className={"noPadding"} href={"https://github.com/YanikKendler/shotly/issues/new/choose"} target={"_blank"}>Report a Bug</Link>
                        <Link className={"noPadding"} href={"https://github.com/YanikKendler/shotly/issues/new/choose"} target={"_blank"}>Suggest a Feature</Link>
                        <Link className={"noPadding"} href={"/freeForStudents"}>Free for Students</Link>
                    </div>
                </footer>
            </div>
        </main>
    );
}
