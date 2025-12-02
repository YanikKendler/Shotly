"use client"

import Auth from "@/Auth"
import "./landing.scss"
import Link from "next/link"
import Wordmark from "@/components/wordmark"
import React, {useEffect, useRef} from "react"
import {
    BookText, CalendarCheck,
    Check,
    ClockAlert,
    Columns3Cog,
    Download,
    FileCode,
    GripVertical,
    Heart,
    Info,
    Users
} from "lucide-react"
import Image from "next/image"
import {Popover, Separator, Tooltip} from "radix-ui"
import AuthSwitcher from "@/components/utility/authSwitcher/authSwitcher"
import ThemeSwitcher from "@/components/utility/themeSwitcher/themeSwitcher"
import Skeleton from "react-loading-skeleton"

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
            console.log("resetting localstorage")
            localStorage["shotly-shotlist-tour-completed"] = "false"
            localStorage["shotly-dashboard-tour-completed"] = "false"
            localStorage["shotly-template-tour-completed"] = "false"
        }

        if(pageRef.current) {
            pageRef.current.addEventListener('scroll', scaleImageOnScroll);
            window.addEventListener('resize', scaleImageOnScroll);
            scaleImageOnScroll(); // Initial call
        }
    }, []);

    return (
        <main className="landing" ref={pageRef}>
            <nav>
                <div className="left">
                    <Link href={"/"} className={"noPadding"}><BookText size={22} />Documentation</Link>
                </div>
                <div className="center">
                    <Link href={"#hero"}>Home</Link>
                    <Link href={"#features"}>Features</Link>
                    <Link href={"#pricing"}>Pricing</Link>
                </div>
                <div className="right">
                    <AuthSwitcher
                        authenticated={
                            <Link className={"filled"} href={"/dashboard"}>Your Dashboard</Link>
                        }
                        unauthenticated={
                            <>
                                <button className={"outlined"} onClick={() => Auth.register()}>Sign up</button>
                                <button className={"filled"} onClick={() => Auth.login()}>Log in</button>
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
                        <p className={"tagline"}>Shotlist creation made easy!</p>
                        <div className="arrowContainer">
                            <AuthSwitcher
                                authenticated={<Link href={"/dashboard"}>To your Dashboard</Link>}
                                unauthenticated={<button onClick={() => Auth.login()}>Get started for free</button>}
                            />
                            <Image
                                className={"arrow"}
                                src={"/home-doodles/arrow.svg"}
                                width={80}
                                height={97}
                                alt={"<--"}
                                fetchPriority={"low"}
                            />
                        </div>
                        <div className="beta">Beta</div>
                    </div>
                    <Image className={""} id={"clapboard"} src={"/home-doodles/doodle-0.svg"} alt={"doodle"} width={128}
                           height={118} fetchPriority={"low"}/>
                    <Image className={"first"} id={"brush"} src={"/home-doodles/doodle-1.svg"} alt={"doodle"} width={97}
                           height={85} fetchPriority={"low"}/>
                    <Image className={""} id={"shotlist"} src={"/home-doodles/doodle-2.svg"} alt={"doodle"} width={179}
                           height={111} fetchPriority={"low"}/>
                    <Image className={"third"} id={"close-up"} src={"/home-doodles/doodle-3.svg"} alt={"doodle"}
                           width={118} height={52} fetchPriority={"low"}/>
                    <Image className={"second"} id={"clipboard"} src={"/home-doodles/doodle-4.svg"} alt={"doodle"} width={85} height={113} fetchPriority={"low"}/>
                    <Image className={"third"} id={"medium-shot"} src={"/home-doodles/doodle-5.svg"} alt={"doodle"} width={126} height={37} fetchPriority={"low"}/>
                    <Image className={"second"} id={"thoughts"} src={"/home-doodles/doodle-6.svg"} alt={"doodle"} width={59} height={52} fetchPriority={"low"}/>
                    <Image className={"first"} id={"camera"} src={"/home-doodles/doodle-7.svg"} alt={"doodle"} width={120} height={94} fetchPriority={"low"}/></div>
            </section>
            <div className="coverHero">
                <section className="image">
                    <ThemeSwitcher
                        light={
                            <Image
                                src={"/shotlist-light.jpg"}
                                alt={"image of a shotlist with its scenes listet in the left sidebar and multiple shots listed on the right"}
                                width={1681}
                                height={1000}
                                ref={imageRef}
                            />
                        }
                        dark={
                            <Image
                                src={"/shotlist-dark.jpg"}
                                alt={"image of a shotlist with its scenes listet in the left sidebar and multiple shots listed on the right"}
                                width={1643}
                                height={1000}
                                ref={imageRef}
                            />
                        }
                        loader={
                            <Skeleton/>
                        }
                    />

                </section>
                <section className="features" id={"features"}>
                    <div className="content">
                        <div className="feature">
                            <div className="icon">
                                <Columns3Cog size={40}/>
                            </div>
                            <h2>Customizable</h2>
                            <p>Select which attributes you want per shot and per scene.</p>
                        </div>
                        <div className="feature">
                            <div className="icon">
                                <FileCode size={40}/>
                            </div>
                            <h2>Open Source</h2>
                            <p>Self host your shotlists, add your own features or improve shotly.</p>
                        </div>
                        <div className="feature unavailable">
                            <div className="icon">
                                <Users size={40}/>
                            </div>
                            <h2>Live Collaboration</h2>
                            <p>Share your shotlist with colleagues and create together.</p>
                            <Popover.Root>
                                <Popover.Trigger className={"noPadding info"}>
                                    <ClockAlert/>
                                </Popover.Trigger>
                                <Popover.Portal>
                                    <Popover.Content className={"PopoverContent left"} side={"top"}>
                                        <Popover.Arrow/>
                                        <p>
                                            Since Shotly is currently in beta, live collaboration is not yet available.
                                        </p>
                                    </Popover.Content>
                                </Popover.Portal>
                            </Popover.Root>
                        </div>
                        <div className="feature">
                            <div className="icon">
                                <Download size={40}/>
                            </div>
                            <h2>Easy Export</h2>
                            <p>Export to PDF/CSV for print or distribution. Use filters to get only what you need.</p>
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
                                    <Popover.Root>
                                        <Popover.Trigger className={"noPadding info"}>
                                            <Info size={20}/>
                                        </Popover.Trigger>
                                        <Popover.Portal>
                                            <Popover.Content className={"PopoverContent left"} side={"top"}>
                                                <Popover.Arrow/>
                                                <p>
                                                    Shotly's basic tier will always stay free, and you will always be
                                                    able to export your data.
                                                </p>
                                                <p>
                                                    Servers cost money though and this app is a lot of work, so if you
                                                    end up using Shotly a lot, please consider the pro tier.
                                                </p>
                                            </Popover.Content>
                                        </Popover.Portal>
                                    </Popover.Root>
                                </div>
                            </div>
                            <Separator.Root className={"Separator"}/>
                            <ul className="features">
                                <li><Check size={20} strokeWidth={3}/>1 free shotlist</li>
                                <li><Check size={20} strokeWidth={3}/>2 collaborators</li>
                                <li><Check size={20} strokeWidth={3}/>unlimited scenes</li>
                                <li><Check size={20} strokeWidth={3}/>unlimited shots</li>
                            </ul>
                            <button className="select outlined" onClick={() => Auth.login()}>Get started</button>
                        </div>

                        <div className="tier">
                            <div className="top">
                                <p className="name">Pro</p>
                                <div className="price">
                                    <p className={"cost"}>2.99€</p>
                                    <p className="frequency">/mo</p>
                                </div>
                            </div>
                            <Separator.Root className={"Separator"}/>
                            <ul className="features">
                                <li className={"bold"}><Check size={20} strokeWidth={3}/>unlimited shotlist</li>
                                <li className={"bold"}><Check size={20} strokeWidth={3}/>unlimited collaborators</li>
                                <li className={"thin"}><Check size={20} strokeWidth={3}/>unlimited scenes</li>
                                <li className={"thin"}><Check size={20} strokeWidth={3}/>unlimited shots</li>
                                <li className={"gray"}><CalendarCheck size={20} strokeWidth={2.5}/>cancel any time</li>
                                <li className={"gray"}><Heart size={20} strokeWidth={3}/>support this project</li>
                            </ul>
                            <button className="select filled" onClick={() => Auth.loginForPro()}>Choose Pro</button>
                        </div>
                    </div>
                </section>
                <footer>
                    <div className={"credits"}>
                        <Wordmark/>
                        <p className={"createdBy"}>created with ♥ by <Link href={"https://yanik.kendler.me"}
                                                                           target={"_blank"} className={"noPadding"}>Yanik
                            Kendler</Link></p>
                        <Link className={"noPadding"} href={"https://github.com/YanikKendler/shotly"}
                              target={"_blank"}>github.com/YanikKendler/shotly</Link>
                        <p className={"copyright"}>© 2025 Yanik Kendler. Open source under the MIT License.</p>
                    </div>
                    <div>
                        <h3>Legal</h3>
                        <Link className={"noPadding"} href={"./legal/cookies"}>Cookies</Link>
                        <Link className={"noPadding"} href={"./legal/privacy"}>Privacy</Link>
                        <Link className={"noPadding"} href={"./legal/legalNotice"}>Legal notice</Link>
                        <Link className={"noPadding"} href={"./legal/termsOfUse"}>Terms of use</Link>
                    </div>

                    <div>
                        <h3>Support</h3>
                        <Link className={"noPadding"} href={"/"}>Documentation</Link>
                        <Link className={"noPadding"} href={"https://github.com/YanikKendler/shotly/issues/new/choose"}>Report a Bug</Link>
                        <Link className={"noPadding"} href={"https://github.com/YanikKendler/shotly/issues/new/choose"}>Suggest a Feature</Link>
                    </div>
                </footer>
            </div>
        </main>
    );
}
