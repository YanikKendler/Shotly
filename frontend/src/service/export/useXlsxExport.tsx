import {ShotlistDto} from "../../../lib/graphql/generated"
import {SceneAttributeParser, ShotAttributeParser} from "@/utility/AttributeParser"
import Utils from "@/utility/Utils"
import * as XLSX from 'xlsx-js-style';

export default function useXlsxExport({
    generateFileName
}:{
    generateFileName: () => string
}){

    //AI
    const exportXLSX = (data: ShotlistDto) => {
        const rows: any[][] = [];

        const sceneValueRowIndices: number[] = [];
        const shotHeaderRowIndices: number[] = [];
        const coloredShotRowIndices: number[] = [];

        // 1. Initial Global Header: Scene Attribute Definitions
        const globalHeader = [
            "Scene",
            ...(data.sceneAttributeDefinitions || []).map(attr => attr?.name || "Unnamed")
        ];
        rows.push(globalHeader);

        // 2. Prepare Shot Attribute Names Row
        const shotAttrNames = [
            "Shot",
            ...(data.shotAttributeDefinitions || []).map(attr => attr?.name || "Unnamed")
        ];

        // 3. Build Data
        (data.scenes || []).forEach((scene) => {
            if (!scene) return;

            // Line 1: Scene values
            const sceneValRow: any[] = [scene.position + 1];
            (scene.attributes || []).forEach((attr) => {
                sceneValRow.push(SceneAttributeParser.toValueString(attr as any, false));
            });
            sceneValueRowIndices.push(rows.length);
            rows.push(sceneValRow);

            // Line 2: Shot attribute names
            shotHeaderRowIndices.push(rows.length);
            rows.push(shotAttrNames);

            // Shots
            (scene.shots || []).forEach((shot, shotIdx) => {
                if (!shot) return;
                const shotRow: any[] = [Utils.numberToShotLetter(shot.position, scene.position)];
                (shot.attributes || []).forEach((attr) => {
                    shotRow.push(ShotAttributeParser.toValueString(attr as any, false));
                });

                if (shotIdx % 2 !== 0) {
                    coloredShotRowIndices.push(rows.length);
                }
                rows.push(shotRow);
            });
        });

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        const range = XLSX.utils.decode_range(worksheet['!ref'] || "A1:A1");

        // 4. Column Sizing
        worksheet['!cols'] = [
            { wch: 6 },
            ...Array(range.e.c).fill({ wch: 30 })
        ];

        // 5. Apply Styles
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: R, c: C });
                if (!worksheet[address]) worksheet[address] = { t: 's', v: '' };

                const isGlobalHeader = R === 0;
                const isSceneValRow = sceneValueRowIndices.includes(R);
                const isShotHeadRow = shotHeaderRowIndices.includes(R);
                const isHeaderBlock = isSceneValRow || isShotHeadRow;
                const isColoredShot = coloredShotRowIndices.includes(R);
                const isFirstCol = (C === 0);

                const lightGridColor = { rgb: "DCDCDC" };
                const darkHeaderGridColor = { rgb: "808080" };

                const style: any = {
                    alignment: {
                        vertical: "center",
                        horizontal: isFirstCol ? "center" : "left",
                        wrapText: true,
                        indent: isFirstCol ? 0 : 1
                    },
                    font: { name: "Arial", sz: 11, bold: false },
                    fill: { fgColor: { rgb: isColoredShot ? "EFEFEF" : "FFFFFF" } },
                    border: {
                        top: { style: "thin", color: lightGridColor },
                        bottom: { style: "thin", color: lightGridColor },
                        left: { style: "thin", color: lightGridColor },
                        right: { style: "thin", color: lightGridColor }
                    }
                };

                // Header Block Logic
                if (isHeaderBlock) {
                    style.fill = { fgColor: { rgb: "C7C7C7" } };

                    // Remove left/right borders from heading as requested
                    style.border.left = { style: "none" };
                    style.border.right = { style: "none" };

                    // Vertical separators within the header use the dark gray
                    style.border.right = { style: "thin", color: darkHeaderGridColor };

                    if (isSceneValRow) {
                        style.font.bold = true; // First line of heading bold
                        style.font.sz = 12;
                        style.border.top = { style: "medium", color: { rgb: "000000" } };
                        // Thin black border between first and second line
                        style.border.bottom = { style: "thin", color: { rgb: "000000" } };
                    }

                    if (isShotHeadRow) {
                        style.border.top = { style: "thin", color: { rgb: "000000" } };
                        style.border.bottom = { style: "medium", color: { rgb: "000000" } };
                    }
                } else if (isGlobalHeader) {
                    // Very first line: No color, bold font
                    style.fill = { fgColor: { rgb: "FFFFFF" } };
                }

                worksheet[address].s = style;
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Shotlist");
        XLSX.writeFile(workbook, `${generateFileName()}.xlsx`);
    }

    return {exportXLSX}
}