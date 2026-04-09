# Shotly Admin Dashboard

## Features

Allows users with the admin role to see:
- current active user counts
- list of all users and non personal data
- list of all shotlists
- list of all templates

and edit:
- a users role
- a users revokeProAfter date
- if a user is active

as well as:
- copy id's for use in other locations
- change sort order
- filter shotlists & templates for user

## Code

This is not public facing and will likely never be mentioned anywhere.

Its not intended to ever be used by anyone but me or someone who self-hosts Shotly.

I made this as a personal monitoring tool in literally 2 days (not vibe coded tho because fuck AI).

This is a simple vite + LIT app and mainly a horrible single file dashboard component because im lazy.

It accesses the same main Shotly backend and uses the same Auth0 users, access is only granted if the "Admin" role is present.

It was initially based on the lit starter