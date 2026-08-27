# ČSFD Extended

Tampermonkey script that extends ČSFD title pages with additional useful information.

## Overview

ČSFD gives a solid local perspective on films, but it's often useful to see a title from another angle too. This script adds a few extra details to make browsing a bit more convenient, without leaving the page.

## Features

- IMDb plot with a short/full toggle, and automatic expansion of shortened plots
- MPAA rating
- IMDb, Rotten Tomatoes, and Metascore ratings
- Quick links updated (Trailer, DabingForum, Reel Scary for horror films)
- OMDb API response caching
- Automatic expansion of shortened plots

## Tech stack

- **Language:** JavaScript
- **Library:** jQuery
- **API:** OMDb API
- **Platform:** Tampermonkey

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net) for your browser.
2. Download the latest `csfd-extended.user.js` from [Releases](https://github.com/mk-forge/csfd-extended/releases), or [install it directly](https://github.com/mk-forge/csfd-extended/raw/main/csfd-extended.user.js).
3. Tampermonkey will prompt you to confirm the installation.
4. **Replace `PUT YOUR API KEY HERE` with your own OMDb API key**. You can get one at [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx). The script won't fetch anything without it.

## Screenshots

![ČSFD Extended features 1](./Screenshots/features1.png)
![ČSFD Extended features 2](./Screenshots/features2.png)