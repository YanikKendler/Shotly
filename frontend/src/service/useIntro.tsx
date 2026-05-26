import {renderToStaticMarkup} from "react-dom/server"
import {Check, ChevronLeft, ChevronRight} from "lucide-react"
import {driver, DriveStep} from "driver.js"
import Analytics from "@/service/Analytics"

export default function useIntro({
    steps,
    telemetryLocation,
    onDestroy = () => {}
}:{
    steps: DriveStep[],
    telemetryLocation: string,
    onDestroy?: () => void
}) {
    const driverObj = driver({
        showProgress: true,
        allowClose: true,
        prevBtnText: renderToStaticMarkup(
            <span className="iconContainer">
                <ChevronLeft size={18}/>
                <span className="text">Previous</span>
            </span>
        ),
        nextBtnText: renderToStaticMarkup(
            <span className="iconContainer">
                <span className="text">Next</span>
                <ChevronRight size={18}/>
            </span>
        ),
        doneBtnText: renderToStaticMarkup(
            <span className="iconContainer">
                <span className="text">Done</span>
                <Check size={16} strokeWidth={3}/>
            </span>
        ),
        steps: steps,
        onDestroyStarted: () => {
            if(!driverObj.isLastStep()){
                Analytics.signal(`${telemetryLocation}.IntroClosedEarly`, {
                    step: driverObj.getActiveStep()?.popover?.title ?? driverObj.getActiveIndex()
                })
            }

            driverObj.destroy()
        },
        onDestroyed: onDestroy,
    })

    return {
        show: () => driverObj.drive(),
        cancel: () => driverObj.destroy()
    }
}