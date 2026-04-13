export interface Change {
    readonly version: string,
    readonly date: string,
    readonly changes: string
}

export const CHANGELOG: Change[] = [
    {
        version: "1.4.2",
        date: "2026-04-13",
        changes: `
        **Features**
            
        - Added this changelog display
        `
    },
    {
        version: "1.4.1",
        date: "2026-04-12",
        changes: `Fixed bug where the dashboard would not load for new users on firefox.`
    },
    {
        version: "1.4.0",
        date: "2026-04-09",
        changes: `Shotly is officially launched!`
    },
    {
        version: "Pre 1.4.0",
        date: "2026-04-09",
        changes: `Under development, core features were added.`
    }
]