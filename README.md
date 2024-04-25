<p align="center">
    <a href="https://www.hkviz.org">
        <img width="128" height="128" src="logo/logo_glow.svg">
    </a>
</p>

# HKViz web

A site for visualizing player-behavior for [Hollow Knight](https://www.hollowknight.com), like seeing the path one has taken in playthrough, to which boss one had the most difficulties, where one has spent the most time, and more.

The mod for recording player behavior is contained in the [hkviz-mod repository](https://github.com/hkviz/hkviz-mod).

Visit [hkviz.org](https://www.hkviz.org/) to get started recording your own gameplay.

## I have Ideas/Feedback for visualizations

Feel free to [open an issue](https://github.com/hkviz/hkviz-web/issues) on this repository, write @olivergrack on discord or contact me via [support@hkviz.org](mailto:support@hkviz.org).

## How to use

To get started recording your own gameplay analytics visit [hkviz.org](https://www.hkviz.org).

You can also view gameplays from other players, if they send you a link and have set their gameplay to 'public' or 'unlisted' or by visting the
[public gameplays page](https://www.hkviz.org/run).

## For developers

To set this project up locally:

-   First copy the .env.example file in the root directly, and fill it with connection information for
    -   a mysql database (where user accounts, and run metadata is stored)
    -   a r2/s3 bucket (where analytics files are stored)
    -   auth providers (discord, google, ...). Can be left empty if you are testing with the email login
-   Start the project locally using `npm run dev`
