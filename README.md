# Shotly
A freemium, open source, no-ai, clean yet powerful shotlist creation tool for filmmakers

## Architecture

Shotly uses NextJS in the frontend with very little additional dependencies, due to the atypical, spreadsheet UI its only using radix primitives wrapped in custom components and no full component library like MUI. Other noteworthy libraries are react-select for searchable dropdowns and lucide for icons.

The backend is a java, quarkus, hibernate panache server that interacts with a postgres db and exposes a graphql API as well as a websocket.

User management is handled by Auth0 and payments run via Stripe.

## Contribution
Shotly is mainly my project, I am not looking to build a huge company around it or recruit full time collaborators. I am hower encouraging you to add to, or improve shotly. These contributions are fully voluntary.

If you dont want to code up a feature yourself just [open a new issue](https://github.com/YanikKendler/Shotly/issues/new) and I will take a look at your suggestion.

### How to
Create a fork of the Shotly repository, create a feature branch, commit your changes with good commit messages, create a pull request with a clear list of all changes.

Refer to the [official github guide](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request-from-a-fork) for details.

There are no solid hard conventions for the style of code, but its important to me that you clearly mark full AI usage in the code by leaving a //AI comment above all ai generate functions. If you generate 2 lines of css with AI that is not noteworthy. If you vibecoded your whole pull request please say so in your message.

If you need help or have questions while coding up a feature dont hesitate to contact me, I will galdly explain anything to you.

### "Weird" code choices
I made some choices in this code that may seem weird or unnecessary, but i had my thoughts behind them.

#### Duplicated code for shot and scene attributes
It would be possible to use the same entity or interface or component for both shot and scene attributes. I did not do that for 2 main reasons.
**potential future changes**
If I ever want to add an attribute type only to the shots or want to store more or different data in only shot attributes, if it were the same objects id have to do massive refactoring or add a "isShot" bolean and have if's everywhere. While it may seem to be the cleaner option, merging scene and shot attributes is not a good idea.
**cleaner edge cases**
Especially in the rendering process its much nicer to have sperate components to reference and style. In the backend its much cleaner to just create a Object and be done with it as well as just switch-casing the object, getting its type and being done with it. All the logic in everything related to shot attributes applies all the time.

#### Not bi-directional quarkus class properties with attributes
Long story short: it breaks the backend.
Long story: I tried this for a straight week and some of the data just would not be displayed even though the relation was there in the db. I also ran into [this](https://stackoverflow.com/questions/79550566/quarkus-hibernate-orm-creates-flawed-associative-table-when-two-entities-with-o) fun issue which I managed to work around. I brought this up to a teacher and they practically told me "quarkus relations just suck" so i removed the bi directional relation and tadaaa. It worked, this does result in way more queries and its really ugly code at times where i have to do a whole lot of where clauses instead of dot notations but i figure quarkus would do the same behind the scenes so it doesnt really matter.