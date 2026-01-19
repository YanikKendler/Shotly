# Export

Shotlists can be exported via the `Shotlist Options` > `Export` dialog by any [Collaborator](./collaboration.md) who can view the shotlist. Before exporting, the shotlist can be filtered to include only specific shots or scenes.

## Configuration

Currently, the following **Formats** are supported:

- PDF: Exports the table in a standard, print-ready PDF format.
- CSV (full): Exports all the shots with scene headings in between. This makes it technically not a valid CSV file but includes all the data.
- CSV (shots only): Exports only the shots one after the other with no scene information other than a number in front of the shot letter.

Using the **Scenes** filter, you can control which scenes to include in the export. If a scene is not included in the "Scenes" filter, it will never be included, even if a custom filter matches a shot inside.

Using the `Add Filter` button, you can add a **Custom Filter** for any multi-select or single-select attribute. You can then select a list of values that qualify for that filter. If you add a second filter, every shot/scene has to pass both the first and the second filter.

## Example

Assuming scenes have the single-select attribute "Location" and the multi-select attribute "Props," and shots have a single-select attribute called "Size" and another called "Movement."

The shotlist is filled with 3 scenes and a couple of shots each:

![The Export Dialog with all the filters added](../assets/img/export-example-shotlist.webp)

We then add all the following filters: 

![The Export Dialog with all the filters added](../assets/img/export-example-settings.webp)

By setting the "Scenes" filter to "1, 3" - scene 2 and its shots will never be included. Scenes 1 and 3 *could* be included if all other filters pass.

By adding a custom filter for "Location" = "House" and adding a custom filter for "Props" = "Bottle, Gun" - only scenes with "Location" = "House" **and** "Props" = "Bottle" or "Gun" or "Bottle, Gun" will be displayed.

| Scene | Location | Props | Passes |
| ----- | -------- | ----- | ------ |
| 1 | "House" | "Cup, Flashlight" | No |
| 2 | "House" | "Bottle" | No (The Scenes filter does not match) |
| 3 | "House" | "Gun, Flashlight" | Yes |

This means that only shots in scene 3 will be displayed - scenes 1 and 2 are ignored completely.

By adding a custom filter for "Size" = "Medium Shot, Long Shot" and adding a custom filter for "Movement" = "Static" - only shots with "Size" = "Medium Shot" or "Long Shot" **and** "Movement" = "Static" will be displayed.

There are 4 shots in the scene number 3:

| Shot | Size | Movement | Passes |
| ---- | ------ | -------- | ---- |
| A | "Medium Shot" | "Push In" | No |
| B | "Medium Shot" | "Static" | Yes |
| C | "Long Shot" | "Static" | Yes |
| D | "Close Up" | "Push In" | No |

So, in the end: Only scene 3 and its shots B and C will be displayed in the final export.

![The final PDF export](../assets/img/export-example-result.webp)

!!! Note
    If none of the shots in a scene pass the shot filters, the scene will not be displayed, even if it passed all the scene filters.