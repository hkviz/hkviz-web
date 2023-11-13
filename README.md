# HKViz web

> [!IMPORTANT]  
> This site is still work in progress. It can not be used yet. A first release should follow late 2023 or early 2024.

A site for visualizing player-behavior for Hollow Knight, like seeing the complete path one has taken in playthrough or seeing to which boss one has died the most.

The mod for recording player behavior is contained in the [hkviz-mod repository](https://github.com/hkviz/hkviz-mod).

Checkout [hkviz.vercel.app](https://hkviz.vercel.app/) for more infos.

## I have Ideas/Feedback for visualizations

Feel free to open a issue on this repository or write @olivergrack on discord.

## How to use

Not at all at the moment. A first version should hopefully be released in the coming months.

## For developers

To set this project up locally:

-   First copy the .env.example file in the root directly, and fill it with connection information for
    -   a mysql database
    -   a r2 bucket.
    -   auth providers (discord, ...)
-   Start the project locally using `npm run dev`

### Used inside this project

This project has been created with [T3](https://create.t3.gg/). Which has some getting started infos for many of the following technologies.
It contains

-   [Next.js](https://nextjs.org)
-   [NextAuth.js](https://next-auth.js.org)
-   [Drizzle](https://orm.drizzle.team/)
-   [Tailwind CSS](https://tailwindcss.com)
-   [tRPC](https://trpc.io)
-   [R2](https://www.cloudflare.com/developer-platform/r2/)
