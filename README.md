# Shotly
A freemium, source available, no-ai, clean yet powerful shotlist creation tool for filmmakers.

To request a feature or report a bug please [open a new issue](https://github.com/YanikKendler/Shotly/issues/new/choose).

If you need help please [read the Documentation](https://docs.shotly.at) or contact [yanik@shotly.at](mailto:yanik@shotly.at).

## Core Features

* **One-click shotlists:** Generate new shotlists instantly without manual setup.
* **Organized by scene:** Select a scene from the sidebar and only the corresponding shots are displayed.
* **Customizable columns:** Add custom text fields or dropdowns to every shot.
* **Flexible scene attributes:** Define and adjust attributes for each scene to fit your project.
* **Templates:** Store shot and scene attributes as templates to reuse across different shotlists.
* **Advanced filtering:** Filter your data in detail to control exactly what is included in your exports.
* **Exports:** Export to print-ready PDF, Excel, or CSV formats.
* **Collaboration:** Share and work on shotlists with other team members in real-time.

## Goals and Non-Goals

### Goals

- Create a comprehensive, simple but powerful shotlist tool
- Provide a free version without any restrictions on core features, except the allowed number of shotlists and collaborators
- Allow exporting of shotlist all the data in a shotlist
- Allow full and permanent deletion of all data

### Non-Goals

- Create a tool for other parts of the filmmaking process, such as scriptwriting
- Automate shotlist creation using AI

## Contribution
Shotly is mainly a personal project, I am not looking to build a huge company around it or recruit full time collaborators. I am hower encouraging you to add to, or improve Shotly. These contributions are fully voluntary.

If you dont want to code up a feature yourself just [open a new issue](https://github.com/YanikKendler/Shotly/issues/new) and I will take a look at your suggestion.

### How to
Create a fork of the Shotly repository, create a feature branch, commit your changes with good commit messages, create a pull request with a clear list of all changes.

Refer to the [official github guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) for details.

There are no solid hard conventions for the style of code, but its important to me that you clearly mark full AI usage in the code by leaving a `//AI` comment above all functions that were mostly AI generated, you will find a few examples in the codebase already. If you generate 2 lines of css with AI that is not noteworthy. If you vibecoded your whole pull request please say so in your message.

If you need help or have questions while coding up a feature dont hesitate to contact me, I will galdly explain anything to you.

### Architecture

Shotly uses NextJS in the frontend with very little additional dependencies, due to the atypical, spreadsheet UI its only using radix primitives wrapped in custom components and no themed component library like MUI. Other noteworthy libraries are react-select for searchable dropdowns and lucide for icons.

The backend is a java quarkus hibernate panache server that interacts with a postgres db and exposes a graphql API as well as a websocket endpoint.

User management is handled by Auth0 and payments run via Stripe.

### "Weird" code choices
I made some choices in this code that may seem weird or unnecessary, but i had my thoughts behind them. (Some are just mistakes tho)

#### Duplicated code for shot and scene attributes
It would be possible to use the same entity or interface or component for both shot and scene attributes. I did not do that for 2 main reasons.

**potential future changes**
If I ever want to add an attribute type only to the shots or want to store more or different data in only shot attributes, if it were the same objects id have to do massive refactoring or add a "isShot" bolean and have if's everywhere. While it may seem to be the cleaner option, merging scene and shot attributes is not wanted.

**cleaner edge cases**
Especially in the rendering process its much nicer to have sperate components to reference and style. In the backend its much cleaner to just create a Object and be done with it as well as just switch-casing the object, getting its type and being done with it. All the logic in everything related to shot attributes applies all the time.

#### Non bi-directional quarkus class properties with attributes
The `ShotAttributeBase` objects referenced by the Scene and others are purposefully not bi directional. This would make the code cleaner and easier but long story short: it breaks the backend.

Long story: I tried this for a straight week and some of the data just would not be displayed even though the relation was there in the db. I also ran into [this](https://stackoverflow.com/questions/79550566/quarkus-hibernate-orm-creates-flawed-associative-table-when-two-entities-with-o) fun issue which I managed to work around. I brought this up to a teacher (was at school at the time) and they practically told me "quarkus relations just suck" so I removed the bi directional relation and tadaaa. It worked, this does result in way more queries and its really ugly code at times where i have to do a whole lot of where clauses instead of dot notations but i figure quarkus would do the same behind the scenes so it doesnt really matter.

## Selft Hosting

While all of Shotly's code is available in this repository, self hosting is at this point _not_ a straight forward process.

Shotly is still in active development and is lacking features and refactoring before I will focus on making it self-host friendly. Generally at the moment it is too rigid and there is no de-coupeling between modules that are revelevant / irrelevant for self hosting. For example Stripes payment integration or telemetry data collection.

## About the License

This project is licensed under the [PolyForm Noncommercial License 1.0.0](./LICENSE.md). For commercial use permissions, please contact [Yanik Kendler](mailto:yanik@shotly.at).

This project was originally released open source under the [MIT License](https://opensource.org/license/mit). To prevent corporations from profiting from this work without contributing back or obtaining explicit permission, I have transitioned the project to the [PolyForm Noncommercial License](https://polyformproject.org/licenses/noncommercial/1.0.0) effective **January 18, 2026**.

**Contributions and Self-Hosting**
\
I encourage anyone to contribute, self-host, or experiment with this project. My primary aim is not to make money off Shotly, but to keep it from being overly capitalized. Please don’t be afraid to dive into the source code just because it is now "source available" rather than technically "open source." If you are a hobbyist, student, or tinkerer, your right to use and modify this code remains important to me.

**Note:** All versions and commits prior to January 18, 2026, remain available under the original MIT License terms.
