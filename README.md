<a style="text-align: center; display: block;" href="https://hkviz.olii.dev">
<img src="./logo/logo.svg" alt="HKViz logo text" style="max-width: 150px; border-radius: 15px; box-shadow: 0 0 10px 0 rgba(255, 255, 255, .25);" />
</a>

# HKViz web

A site for visualizing player-behavior for [HollowKnight](https://www.hollowknight.com), like seeing the path one has taken in playthrough, to which boss one has died the most, where one has spent the most time, and more.

The mod for recording player behavior is contained in the [hkviz-mod repository](https://github.com/hkviz/hkviz-mod).

Visit [hkviz.olii.dev](https://hkviz.olii.dev/) to get started recording your own gameplay.

## I have Ideas/Feedback for visualizations

Feel free to [open a issue](https://github.com/hkviz/hkviz-web/issues) on this repository, write @olivergrack on discord or contact me via [hkviz@olii.dev](mailto:hkviz@olii.dev).

## How to use

To get started recording your own gameplay analytics visit [hkviz.olii.dev](https://hkviz.olii.dev). 

You can also view gameplays from other players, if they send you a link and have set their gameplay to 'public' or 'unlisted'.

## For developers

To set this project up locally:

-   First copy the .env.example file in the root directly, and fill it with connection information for
    -   a mysql database (where user accounts, and run metadata is stored)
    -   a r2/s3 bucket (where analytics files are stored)
    -   auth providers (discord, google, ...). Can be left empty if you are testing with the email login
-   Start the project locally using `npm run dev`
