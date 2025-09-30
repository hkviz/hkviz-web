<p align="center">
    <a href="https://www.hkviz.org">
        <img width="128" height="128" src="logo/logo_glow.svg">
    </a>
</p>

# HKViz web

A site for visualizing gameplays of [Hollow Knight](https://www.hollowknight.com), like seeing the path one has taken in playthrough, to which boss one had the most difficulties, where one has spent the most time, and more.

The mod for recording data is contained in the [hkviz-mod repository](https://github.com/hkviz/hkviz-mod).

Visit [hkviz.org](https://www.hkviz.org/) to see the site in action:

-   🎥 to record analytics for your own gameplays visit the [install guide](https://www.hkviz.org/guide/install).
-   🌐 to analyze public gameplays of other players explore [public gameplays](https://www.hkviz.org/run).
-   📜 and lastly there is the [visualization guide](https://www.hkviz.org/guide/analytics) that explains the
    different visualizations and how to interpret them.

## I have Ideas/Feedback for visualizations

Feel free to [open an issue](https://github.com/hkviz/hkviz-web/issues) on this repository, write @olivergrack on discord or contact me via [support@hkviz.org](mailto:support@hkviz.org).

## For developers

To set this project up locally:

-   First copy the `.env.example` file in the root directly, and name it `.env`, and fill it with connection information for
    -   a turso database (where user accounts, and run metadata is stored)
    -   a r2/s3 bucket (where analytics files are stored)
    -   auth providers (discord, google, ...). Can be left empty if you are testing with the email login
-   If needed [install pnpm](https://pnpm.io/installation)
-   Install dependencies using `pnpm install`.
-   Start the project locally using `pnpm dev`

### Project structure

These are some key folders of the project:

-   `src/lib/hk-data`: Contains extracted data from Hollow Knight. (Not licensed under MIT)
-   `src/lib/parser`: Parsing the recording files created by the mod
-   `src/lib/viz`: Components for visualizing the data
-   `src/server/db`: Database connection and schema
-   `src/server/[run|account|...]`: Server functions and additional logic for handling requests and database interactions
-   `src/routes`: standard solid start folder for routes

### License

This project will largely be MIT licensed, with the exception of the `hk-data` folder, containing assets from Hollow Knight.
Currently, this separation is not yet finished. Therefore, licenses are still missing.
