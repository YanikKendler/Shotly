# Collaboration

To work on the same shotlist with others, invite friends or colleagues using their email address.

!!! info
    Shotlists created by a user in the free tier can only have a **maximum of five collaborators** in addition to the shotlist owner. This means that 6 people can work on one shotlist, but not more. In the pro tier, you can have unlimited collaborators.

## Adding Collaborators

Collaborators can only be added to specific shotlists, one at a time. To **add a collaborator**, click on the collaborators icon in the left sidebar.

Using the input field at the bottom and the `invite` button, you can now add a collaborator using their email. <!-- There is no option to search for a user by their name or parts of their email to prevent the leakage of email addresses. -->

Only valid email addresses can be added as collaborators. You will see an error message if you enter a syntactically valid email that is not linked to an existing Shotly account.

??? Edgecase
    It is technically possible for the same email to be used in two different Shotly accounts by logging in with both "email & password" and "Google" using the same email. In that case, both accounts will be added as a collaborator. In the collaboration tab, all Google logins will be marked with a small "G" icon next to the email address.

## Accepting Collaborations

If your account has been **invited** to collaborate on a shotlist, you will not immediately see that shotlist on your [dashboard](../dashboard.md). You first have to accept the collaboration invite by clicking the inbox icon in the left sidebar. You may need to refresh the request using the button in the top right before you can see new invites.

You can now **accept** or **decline** the request by clicking the checkmark or X icon. Upon accepting, the shotlist will show up both in your sidebar and on your dashboard. If you decline the request, it will disappear, and the shotlist's owner can **resend the request**.

You can also **block** a user from sending you any more collaboration requests in the future by clicking the block icon. Blocked users can be managed via the [account](../account.md#account) dialog.

## Managing Collaborators

Each collaborator can either be a `Viewer` a `Commenter` or an `Editor`. This "Collaboration Type" can be set for each collaborator individually via a dropdown.

|                               | Viewers | Commenters | Editors | Owner |
| ----------------------------- | ------- | ---------- | ------- | ----- |
| Can view shots and scenes     | x | x | x | x |
| Can edit shots and scenes     |   |   | x | x |
| Can add or remove Attributes  |   |   | x | x |
| Can comment on Shots          |   | x | x | x |
| Can export the shotlist       | x | x | x | x |
| Can see or edit collaborators |   |   |   | x |
| Can delete the shotlist       |   |   |   | x |

Collaborators can also be **removed** from a shotlist entirely using the trash bin button.

If a collaborator declined a collaboration request, a new button will appear in the `Collaborators` dialog that allows the shotlist owner to **resend** the collaboration request.

!!! Info
    Collaborators can only be edited by the shotlist owner. No collaborator can see or edit the collaborators.

## Leaving Collaborations

As a Collaborator you can leave any shotlist by opening the modal via the "Collaborators" icon in the left sidebar and clicking the `Leave` button. If you are the shotlist owner, you cannot leave the shotlist.