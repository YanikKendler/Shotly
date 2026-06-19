"use client"

import auth from "@/Auth"
import "./landing.scss"
import Link from "next/link"
import Wordmark from "@/components/icons/wordmark"
import ClapboardDoodle from "@/components/icons/doodles/ClapboardDoodle"
import BrushDoodle from "@/components/icons/doodles/BrushDoodle"
import ShotlistDoodle from "@/components/icons/doodles/ShotlistDoodle"
import CloseUpDoodle from "@/components/icons/doodles/CloseUpDoodle"
import ClipboardDoodle from "@/components/icons/doodles/ClipboardDoodle"
import MediumShotDoodle from "@/components/icons/doodles/MediumShotDoodle"
import ThoughtsDoodle from "@/components/icons/doodles/ThoughtsDoodle"
import CameraDoodle from "@/components/icons/doodles/CameraDoodle"
import ArrowSmallDoodle from "@/components/icons/doodles/ArrowSmallDoodle"
import React, {useEffect, useRef} from "react"
import {
    CalendarCheck,
    Check,
    Columns3Cog,
    Download,
    FileCode,
    Heart,
    Info, Blocks,
    Users, ArrowDown, SquareArrowOutUpRight, Keyboard, MessageSquareText, Cloud
} from "lucide-react"
import Image from "next/image"
import AuthSwitcher from "@/components/utility/authSwitcher/authSwitcher"
import ThemeSwitcher from "@/components/utility/themeSwitcher/themeSwitcher"
import Skeleton from "react-loading-skeleton"
import Config from "@/Config"
import Separator from "@/components/basic/separator/separator"
import SimplePopover from "@/components/basic/popover/simplePopover"
import Analytics from "@/service/Analytics"
import ViewPortSwitcher from "@/components/utility/viewportSwitcher/viewPortSwitcher"
import Utils from "@/utility/Utils"
import TextCycle from "@/components/basic/textCycle/textCycle"

export default function Landing() {
    const pageRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const whyShotlyRef = useRef<HTMLDivElement>(null);

    const proTierRef = useRef<HTMLDivElement>(null);
    const basicTierRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if(!pageRef.current) return;

        scaleImageOnScroll()

        if(pageRef.current.scrollTop <= 50)
            pageRef.current.classList.remove("scrolled")
        else
            pageRef.current.classList.add("scrolled")
    }

    const moveDoodlesWithMouse = (event: React.MouseEvent) => {
        const distanceToCenterRatio = Utils.computePositionToCenterRatio({
            x: event.screenX,
            y: event.screenY
        })

        const movementStrength = 0.005

        const maxMovement = {
            x: window.innerWidth * movementStrength,
            y: window.innerHeight * movementStrength
        }

        document.querySelectorAll('.landing .hero svg.doodle').forEach((doodle) => {
            const doodleSvg = doodle as SVGSVGElement

            const rand = () => Math.random()*0.5+0.5

            const offset = {
                x: distanceToCenterRatio.x * maxMovement.x * rand(),
                y: distanceToCenterRatio.y * maxMovement.y * rand()
            }

            doodleSvg.style.transform = `translate(${offset.x}px, ${offset.y}px)`
        })
    }

    const scaleImageOnScroll = () => {
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

    const tiltImageWithMouse = (event: React.MouseEvent, element: HTMLElement | null) => {
        if(!element) return

        tiltElementWithMouse(event, element)

        const distanceToCenterRatio = Utils.computePositionToCenterRatio({
            x: event.clientX,
            y: event.clientY
        }, element)

        const glintElement: HTMLSpanElement | null = element.querySelector(".glint")

        if(!glintElement) return

        glintElement.style.left = (distanceToCenterRatio.x + 1) / 2 * 100 + "%"
        glintElement.style.top = (distanceToCenterRatio.y + 1) / 2 * 100 + "%"
    }

    const tiltElementWithMouse = (event: React.MouseEvent, element: HTMLElement | null, strength = 1) => {
        if(!element) return

        const distanceToCenterRatio = Utils.computePositionToCenterRatio({
            x: event.clientX,
            y: event.clientY
        }, element)

        const angle = {
            x: -distanceToCenterRatio.x,
            y: distanceToCenterRatio.y
        }

        console.log(distanceToCenterRatio)

        element.style.rotate = `${angle.y} ${angle.x} 0 ${distanceToCenterRatio.d * 3 * strength}deg`;
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
            pageRef.current.addEventListener('scroll', handleScroll);
            window.addEventListener('resize', handleScroll);
            handleScroll(); // Initial call
        }
    }, []);

    return (
        <main className="landing" ref={pageRef}>
            <title>Shotly | Shotlist creation made easy</title>
            <nav>
                <div className="left">
                    <Wordmark/>
                    <Separator orientation={"vertical"}/>
                    <Link
                        href={"https://docs.shotly.at"}
                        target={"_blank"}
                        onClick={() => Analytics.signal("Landing.Nav.Documentation")}
                    >
                        {/*<BookText size={22} />*/}
                        <ViewPortSwitcher under={"Docs"} over={"Documentation"} breakpoint={400}/>
                        <SquareArrowOutUpRight size={14}/>
                    </Link>
                </div>
                <div className="center">
                    <Link
                        href={"#hero"}
                        onClick={() => Analytics.signal("Landing.Nav.Home")}
                    >Home</Link>
                    <Link
                        href={"#features"}
                        onClick={() => Analytics.signal("Landing.Nav.Features")}
                    >Features</Link>
                    <Link
                        href={"#pricing"}
                        onClick={() => Analytics.signal("Landing.Nav.Pricing")}
                    >Pricing</Link>
                </div>
                <div className="right">
                    <AuthSwitcher
                        authenticated={
                            <Link
                                className={"main"}
                                href={"/dashboard"}
                                onClick={() => Analytics.signal("Landing.Nav.Dashboard")}
                            >My Dashboard</Link>
                        }
                        unauthenticated={
                            <>
                                <ViewPortSwitcher
                                    over={
                                        <button
                                            className={"secondary"}
                                            onClick={() => {
                                                Analytics.signal("Landing.Nav.SignUp")
                                                auth.register()
                                            }}
                                        >Sign up</button>
                                    }
                                    breakpoint={400}
                                />

                                <button
                                    className={"main"}
                                    onClick={() => {
                                        Analytics.signal("Landing.Nav.LogIn")
                                        auth.login()
                                    }}
                                >Log in</button>
                            </>
                        }
                    />
                </div>
            </nav>
            <span id="hero"></span>
            <section className="hero" onMouseMove={moveDoodlesWithMouse}>
                <div className="content">
                    <div className="center">
                        <h1>
                            The best way <br/>
                            to <TextCycle text={["create", "edit", "share", "export"]} switchInterval={3000} shuffled={false}/> Shotlists.
                        </h1>
                        <p className={"tagline"}>
                            Customize your shots, collaborate with your crew, and export to PDF for the shoot day.
                        </p>
                        <div className="arrowContainer">
                            <AuthSwitcher
                                authenticated={
                                    <Link
                                        href={"/dashboard"}
                                        onClick={() => Analytics.signal("Landing.Hero.Dashboard")}
                                    >My Dashboard</Link>
                                }
                                unauthenticated={
                                    <div>
                                        <button onClick={() => {
                                            Analytics.signal("Landing.Hero.GetStarted")
                                            auth.login()
                                        }}>Create your first shotlist</button>
                                        <small>free, no credit card required</small>
                                    </div>
                                }
                            />
                            {/*<Image
                                className={"arrow"}
                                src={"/hero-doodles/arrow.svg"}
                                width={80}
                                height={97}
                                alt={"<--"}
                                fetchPriority={"high"}
                            />*/}
                            <ArrowSmallDoodle className={"arrow"}/>
                        </div>
                    </div>
                    <ClapboardDoodle className={"doodle"} id={"clapboard"}/>
                    <BrushDoodle className={"doodle first"} id={"brush"}/>
                    <ShotlistDoodle className={"doodle"} id={"shotlist"}/>
                    <CloseUpDoodle className={"doodle third"} id={"close-up"}/>
                    <ClipboardDoodle className={"doodle second"} id={"clipboard"}/>
                    <MediumShotDoodle className={"doodle"} id={"medium-shot"}/>
                    <ThoughtsDoodle className={"doodle second"} id={"thoughts"}/>
                    <CameraDoodle className={"doodle first"} id={"camera"}/></div>
            </section>
            <div className="coverHero">
                <section className="image">
                    <button
                        className={"scroll"}
                        onClick={() => whyShotlyRef.current?.scrollIntoView({ block: "end" })}
                    >
                        <ArrowDown strokeWidth={2.5}/>
                    </button>
                    <div className="imageWrapper"
                         ref={imageRef}
                         onMouseMove={(e) => tiltImageWithMouse(e, imageRef.current)}
                    >
                        <span className="glint"></span>
                        <ThemeSwitcher
                            light={
                                <ViewPortSwitcher
                                    breakpoint={400}
                                    over={
                                        <Image
                                            src={"/landing-shotlist-image/shotlist-light-desktop.webp"}
                                            alt={"Image of a shotlist with its scenes listet in the left sidebar and multiple shots listed on the right"}
                                            width={2095}
                                            height={1396}
                                        />
                                    }
                                    under={
                                        <Image
                                            src={"/landing-shotlist-image/shotlist-light-mobile.webp"}
                                            alt={"Image of a shotlist with multiple shots listed and floating buttons to open the shotlist options"}
                                            width={580}
                                            height={1069}
                                        />
                                    }
                                />
                            }
                            dark={
                                <ViewPortSwitcher
                                    breakpoint={400}
                                    over={
                                        <Image
                                            src={"/landing-shotlist-image/shotlist-dark-desktop.webp"}
                                            alt={"Image of a shotlist with its scenes listet in the left sidebar and multiple shots listed on the right"}
                                            width={2096}
                                            height={1397}
                                        />
                                    }
                                    under={
                                        <Image
                                            src={"/landing-shotlist-image/shotlist-dark-mobile.webp"}
                                            alt={"Image of a shotlist with multiple shots listed and floating buttons to open the shotlist options"}
                                            width={583}
                                            height={1071}
                                        />
                                    }
                                />
                            }
                            loader={
                                <Skeleton className={"skeleton"} style={{width:'100%'}} containerClassName={"skeletonContainer"}/>
                            }
                        />
                    </div>
                </section>
                <section className="features" id={"features"}>
                    <h2 ref={whyShotlyRef}>Why Shotly?</h2>
                    <p className="explainer">
                        Stop fighting broken cells and rigid rows.<br/> Forget the nightmare of messy unfiltered exports.
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
                                onClick={() => Analytics.signal("Landing.LearnMore.Attributes")}
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
                                onClick={() => Analytics.signal("Landing.Clicked.LearnMore.Export")}
                            >
                                Learn more
                            </Link>
                        </div>
                        <div className="feature">
                            <div className="icon">
                                {/*<svg className="raw" height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
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
                                </svg>*/}
                                <Cloud size={40}/>
                            </div>
                            <h3>Cloud Based</h3>
                            <p>Your Shotlist lives in the cloud. Accessible from anywhere at any time.</p>
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
                                onClick={() => Analytics.signal("Landing.Clicked.LearnMore.Collaboration")}
                            >
                                Learn more
                            </Link>
                        </div>
                        <div className="feature">
                            <div className="icon">
                                <Keyboard size={40}/>
                            </div>
                            <h3>Extensive Keybinds</h3>
                            <p>Every core action has a dedicated keybind, allowing you to edit shotlists completely mouse-free.</p>
                            <Link
                                href="https://docs.shotly.at/shotlist/navigation/#keybinds"
                                className={"noPadding"}
                                target={"_blank"}
                                onClick={() => Analytics.signal("Landing.Clicked.LearnMore.Keybinds")}
                            >
                                Learn more
                            </Link>
                        </div>
                        <div className="feature">
                            <div className="icon">
                                <MessageSquareText size={40}/>
                            </div>
                            <h3>Comments</h3>
                            <p>Invite colleagues to comment on individual shots, track feedback, or simply note down your own ideas.</p>
                            <Link
                                href="https://docs.shotly.at/shotlist/comments"
                                className={"noPadding"}
                                target={"_blank"}
                                onClick={() => Analytics.signal("Landing.Clicked.LearnMore.Comments")}
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
                                onClick={() => Analytics.signal("Landing.Clicked.LearnMore.Templates")}
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
                                href="https://github.com/YanikKendler/Shotly"
                                className={"noPadding"}
                                target={"_blank"}
                                onClick={() => Analytics.signal("Landing.Clicked.LearnMore.License")}
                            >
                                Learn more
                            </Link>
                        </div>
                    </div>
                </section>
                <section className="pricing" id={"pricing"}>
                    <div className="content">
                        <div
                            className="tier"
                            ref={basicTierRef}
                            onMouseMove={(e) => tiltElementWithMouse(e, basicTierRef.current, 1.5)}
                        >
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
                                    Analytics.signal("Landing.Price.Basic")
                                    auth.login()
                                }}
                            >Get started</button>
                        </div>

                        <div
                            className="tier"
                            ref={proTierRef}
                            onMouseMove={(e) => tiltElementWithMouse(e, proTierRef.current, 1.5)}
                        >
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
                                    Analytics.signal("Landing.Price.Pro")
                                    auth.login("/pro")
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
                        <Link className={"noPadding"} href={"/src/app/(public)/legal/cookies"}>Cookies</Link>
                        <Link className={"noPadding"} href={"/src/app/(public)/legal/privacy"}>Privacy</Link>
                        <Link className={"noPadding"} href={"/src/app/(public)/legal/legalNotice"}>Legal notice</Link>
                        <Link className={"noPadding"} href={"/src/app/(public)/legal/termsOfUse"}>Terms of use</Link>
                    </div>

                    <div>
                        <h3>Support</h3>
                        <Link className={"noPadding"} href={"https://docs.shotly.at"} target={"_blank"}>Documentation</Link>
                        <Link className={"noPadding"} href={"/freeForStudents"}>Free for Students</Link>
                        <Link className={"noPadding"} href={"/changelog"}>Changelog</Link>
                        <Link className={"noPadding"} href={"https://github.com/YanikKendler/shotly/issues/new/choose"} target={"_blank"}>Report a Bug</Link>
                        <Link className={"noPadding"} href={"https://github.com/YanikKendler/shotly/issues/new/choose"} target={"_blank"}>Suggest a Feature</Link>
                        <Link className={"noPadding"} href={"https://github.com/users/YanikKendler/projects/7/views/4"} target={"_blank"}>Issue tracker</Link>
                    </div>
                </footer>
            </div>
        </main>
    );
}
