import {ShotlistDto} from "../../../lib/graphql/generated"
import {pdf} from "@react-pdf/renderer"
import PdfExportTemplate from "@/components/app/dialogs/shotlistOptionsDialog/exportTab/pdfExportTemplate"

export interface PdfExportOptions {
    showCheckboxes: boolean //shows empty square cells next to shots
    avoidOrphans: boolean // prevents shots from wrapping to new pages on their own
    repeatSceneHeading: boolean // Repeats the scene heading onto wrapped pages
    repeatAttributeDefinitions: boolean // Repeats the top-level attribute names (Scene, Motive, etc)
    headerText: string // Custom text to show in the header of each page
}

export default function usePdfExport({
    generateFileName,
    pdfExportOptions
}:{
    generateFileName: () => string
    pdfExportOptions: PdfExportOptions
}){
    const exportPdf = async (data: ShotlistDto) => {
        const blob = await pdf(<PdfExportTemplate data={data} options={pdfExportOptions}/>).toBlob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = generateFileName() + ".pdf"
        link.click()
        URL.revokeObjectURL(url)
    }

    return {exportPdf}
}