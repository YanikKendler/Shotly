export interface Change {
    readonly version: string,
    readonly date: string,
    readonly changes: string
}

export const CHANGELOG: Change[] = [
    {
        version: "1.5.0",
        date: "2026-05-07",
        changes: `
        **Features**
            
        - Added sorting to exports
        - Added option to block users
        - Added shotlist archive
        - Added this changelog display

        **Updates**
        
        - Added local caching for shots - faster shot loading
        - Updated sync payload to be more efficient
        - Added new toast notifications for various actions
        - Refactored the codebase to be less messy
        
        **Bugs**
        
        - Export preview will now adjust to light-mode
        - Url will now reflect the correct shotlist options tab
        `
    },
    {
        version: "1.4.2",
        date: "2026-04-24",
        changes: 'Fixed bug where you were redirected to `/dashboard` after logging in from the `/pro` page'
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
        date: "2025-03-04",
        changes: `Under development, core features were added.`
    }
]