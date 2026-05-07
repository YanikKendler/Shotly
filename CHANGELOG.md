# Changelog

## 1.5.0 - 07.05.2026

**Features**

- Added changelog dialog on dashboard
- Added `/changelog` page
- Added sorting to exports
- Added "Hide headings" export setting
- Option to invert export filters "include" -> "exclude"
- Added option to block users and prevent them from sending invites
- Added shotlist archive

**Updates**

- Local caching for shots per scene, shots are loaded from cache after first visit, updated through websocket
- Updated sync payload with custom DTOs to avoid sending uneeded data
- Added `feedbackNotification`s to more user interactions
- Refactored and split pages into individual components and use hooks

**Bugs**
- Export preview will now adjust to light-mode
- Url will now always reflect the correct shotlist options tab

**Other**

- Added CHANGELOG.md

## 1.4.2 - 20.04.2026

Fixed Bug where logins coming from the `/pro` page would redirect to `/dashboard` instead of back to `/pro`

## 1.4.1 - 12.04.2026

Fixed Bug where new users on Firefox would see error page because the templates were null due to an syntax error with re-fetching data.

## 1.4.0 - 09.04.2026

Official App launch.

## Pre 1.4.0

Under development, added all core features.