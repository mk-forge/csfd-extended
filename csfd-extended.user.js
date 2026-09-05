// ==UserScript==
// @name         ČSFD Extended
// @version      2.9.1
// @description  Extends ČSFD title pages with additional useful information.
// @author       Jakub Rychecký <jakub@rychecky.cz>
// @contributor  MK
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// @license      WTFPL 2
// @include      *csfd.cz/film/*
// @include      *csfd.sk/film/*
// @namespace CSFD-E
// ==/UserScript==
/******/ (() => { // webpackBootstrap
    /******/ 	'use strict';
    var __webpack_exports__ = {};
    /* eslint-env jquery */

    let titleName = document.getElementsByTagName('h1')[0].textContent.trim();
    let titleInfoElement = document.getElementsByClassName('origin')[0];
    let titleInfo = titleInfoElement ? titleInfoElement.textContent.replace(/\s+/g, ' ').trim() : '';
    let plotAdded = false;

    function showAllPlots() {
        let moreBtn = document.querySelector('.plot-preview-more');
        if (moreBtn && moreBtn.textContent == 'více') {
            moreBtn.click();
        }
    }

    function onPageLoad() {
        let adWrapper = document.querySelector('.ad-wrapper');
        if (adWrapper) adWrapper.remove();

        setTimeout(showAllPlots, 200);

        let observer = new MutationObserver(function(mutations) {
            let moreBtn = document.querySelector('.plot-preview-more');
            if (moreBtn && moreBtn.textContent.trim() == 'více') {
                showAllPlots();
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 5000);

        document.addEventListener('click', function(e) {
            if (e.target.id == 'all-plots' || e.target.closest('#all-plots')) {
                setTimeout(showAllPlots, 200);
            }
        });
    }

    if (document.readyState == 'complete') {
        onPageLoad();
    } else {
        window.addEventListener('load', onPageLoad);
    }

    class Csfd {
        constructor(csfdPage) {
            this.csfdPage = csfdPage
        }

        isLoggedIn() {
            return this.csfdPage.find('.my-rating').length > 0;
        }

        getCurrentUserRatingDate() {
            let ratingDateInText = this.csfdPage.find('.current-user-rating > span').attr('title');
            if (ratingDateInText == undefined) return null;

            return ratingDateInText.match(/.+(\d{2}\.\d{2}\.\d{4})$/)[1];
        }

        isMarkedAsWantToWatch() {
            let controlPanelText = this.csfdPage.find('.control-panel').text();
            return controlPanelText.includes('Upravit ve Chci vidět') || controlPanelText.includes('Upraviť v Chcem vidieť');
        }

        getOpenGraphTitle() {
            return $('meta[property="og:title"]').attr('content');
        }
    }

    class Toolbar {
        constructor(csfd) {
            this.csfd = csfd;
            this.initializeToolbar();
        }

        initializeToolbar() {
            let self = this;
            let aside = document.querySelector('.aside-movie-profile');
            let filmRating = aside.querySelector('.film-rating');
            let buttonContainer = document.createElement('div');
            buttonContainer.className = 'csfd-toolbar-buttons';
            buttonContainer.style.cssText = 'display: flex; flex-direction: column; gap: 8px; margin-top: 15px;';
            aside.insertBefore(buttonContainer, filmRating.nextSibling);

            let index = encodeURIComponent(this.csfd.getOpenGraphTitle().indexOf('|'));
            let encodedOpenGraphTitle = encodeURIComponent(this.csfd.getOpenGraphTitle().substring(0, index).replace(/\s*\(\d{4}\)\s*/g, '').trim());

            let diacriticsMap = {
                'ě': 'e', 'š': 's', 'č': 'c', 'ř': 'r', 'ž': 'z',
                'ý': 'y', 'á': 'a', 'í': 'i', 'é': 'e', 'ú': 'u',
                'ů': 'u', 'ó': 'o', 'ď': 'd', 'ť': 't', 'ň': 'n',
                'Ě': 'E', 'Š': 'S', 'Č': 'C', 'Ř': 'R', 'Ž': 'Z',
                'Ý': 'Y', 'Á': 'A', 'Í': 'I', 'É': 'E', 'Ú': 'U',
                'Ů': 'U', 'Ó': 'O', 'Ď': 'D', 'Ť': 'T', 'Ň': 'N'
            };

            let title = this.csfd.getOpenGraphTitle().split('|')[0].replace(/\s*\(\d{4}\)\s*/g, '').trim();
            let titleWithoutDiacritics = title.replace(/[ěščřžýáíéúůóďťňĚŠČŘŽÝÁÍÉÚŮÓĎŤŇ]/g, char => diacriticsMap[char]);
            let titleWithDashes = titleWithoutDiacritics.replace(/\s+/g, "-").replace(/[()]/g, "");
            let encodedOpenGraphTitleWithDashes = encodeURIComponent(titleWithDashes);

            function getEnglishTitle() {
                let englishTitle = '';
                let foundIRE = false, foundNZ = false, foundCAN = false, foundAU = false, foundVB = false, foundUSA = false;
                let filmNamesContainer = document.querySelector('.film-names');
                let flags = filmNamesContainer ? [...filmNamesContainer.getElementsByClassName('flag')] : [];
                let count = 0;

                for (let flag of flags) {
                    if (flag.nextSibling && flag.nextSibling.nextSibling && ['(pracovní název)', '(festivalový název)', '(neoficiální název)'].includes(flag.nextSibling.nextSibling.innerText)) {
                        count++;
                        continue;
                    }

                    let imageSrc = flag.src;
                    let titleNode = flag.nextSibling;

                    if (imageSrc.includes('162751322_bd9240.svg')) {
                        englishTitle = titleNode.textContent.trim().replace('’', '\'');
                        foundIRE = true;
                    } else if (imageSrc.includes('162751397_37070c.svg')) {
                        englishTitle = titleNode.textContent.trim().replace('’', '\'');
                        foundNZ = true;
                    } else if (imageSrc.includes('162751233_bfc3e7.svg')) {
                        englishTitle = titleNode.textContent.trim().replace('’', '\'');
                        foundCAN = true;
                    } else if (imageSrc.includes('162751426_c463ce.svg')) {
                        englishTitle = titleNode.textContent.trim().replace('’', '\'');
                        foundAU = true;
                    } else if (imageSrc.includes('162751395_38cf6e.svg')) {
                        englishTitle = titleNode.textContent.trim().replace('’', '\'');
                        foundVB = true;
                    } else if (imageSrc.includes('162751232_6f9adb.svg')) {
                        englishTitle = titleNode.textContent.trim().replace('’', '\'');
                        foundUSA = true;
                        break;
                    }
                }

                if (count == flags.length) return document.getElementsByTagName('h1')[0].textContent.trim().replace('’', '\'');

                if (foundUSA) return englishTitle;
                if (foundVB) return englishTitle;
                if (foundAU) return englishTitle;
                if (foundCAN) return englishTitle;
                if (foundNZ) return englishTitle;
                if (foundIRE) return englishTitle;

                return document.getElementsByTagName('h1')[0].textContent.trim().replace('’', '\'');
            }

            // Correction for names sent to OMDb API
            function titleCheck() {
                // Movies
                return (titleName == 'Hunger Games: Balada o ptácích a hadech' && titleInfo == 'USA 2023 157 min') ? 'The Hunger Games: The Ballad of Songbirds & Snakes'
                : (titleName == '' && titleInfo == '') ? ''

                // Shows
                : (titleName == 'The Haunting' && titleInfo == 'USA (2018–2020) 17 h 55 min (Minutáž: 43–71 min)') ? 'The Haunting of Hill House'
                : (titleName == '' && titleInfo == '') ? ''
                : getEnglishTitle();
            }

            // Correction for years sent to OMDb API
            let years = {
                'Teorie chaosu': { year: 2007, info: 'USA 2008 86 min' },
                '': { year: 0, info: '' }
            };

            let yearText = document.getElementsByClassName('origin')[0].innerText;
            let originalYear = parseInt(yearText.match(/\d+/), 10);
            let fixedYear = originalYear;

            let yearEntry = years[titleName];
            if (yearEntry && yearEntry.info == titleInfo) {
                fixedYear = yearEntry.year;
            }

            async function fetchMovieData() {
                let url = 'https://www.omdbapi.com/?t=' + encodeURIComponent(titleCheck()) + '&y=' + fixedYear + '&apikey=PUT YOUR API KEY HERE';
                let shortData = null;
                let fullData = null;

                try {
                    let shortResponse = await $.getJSON(url + '&plot=short');
                    if (shortResponse.Plot && shortResponse.Plot != 'N/A') {
                        shortData = shortResponse;
                        let fullResponse = await $.getJSON(url + '&plot=full');
                        if (fullResponse.Plot && fullResponse.Plot != 'N/A') {
                            fullData = fullResponse;
                        }
                    }
                } catch (error) {
                    return;
                }

                if (shortData) {
                    renderMovieData(shortData);
                    if (fullData && shortData.Plot != fullData.Plot) {
                        setupPlotToggle(shortData, fullData);
                    }
                }
            }

            function setupPlotToggle(shortData, fullData) {
                let plotMode = 'short';
                let cachedPlotData = { short: shortData, full: fullData };

                let plotButton = self.createButton('Dlouhý obsah', 'plot', '#');
                plotButton.attr('href', '#');
                plotButton.css('justify-content', 'center');
                plotButton.on('click', function(e) {
                    e.preventDefault();
                    let newMode = plotMode == 'short' ? 'full' : 'short';
                    plotMode = newMode;
                    $(this).html('<i class="icon icon-folder" style="margin-right: 2px;"></i><span>' + (newMode == 'full' ? 'Krátký obsah' : 'Dlouhý obsah') + '</span>');
                    updatePlotText(cachedPlotData[newMode].Plot);
                });

                let headerAction = document.querySelector('.box-header-action');
                if (headerAction) {
                    headerAction.append(plotButton[0]);
                } else {
                    $('.updated-box-header:contains("Obsahy")').append(plotButton);
                }
            }

            function renderMovieData(response) {
                let existingImdb = document.getElementById('imdb');
                if (existingImdb) existingImdb.remove();

                let lineBreak = document.querySelector('.plot-full > br');
                if (lineBreak) lineBreak.remove();

                let plotBox = document.createElement('div');
                let newLineBreak = document.createElement('br');
                let plot = response.Plot;
                let byImdb = ' (IMDb)';
                plotBox.id = 'imdb';
                let bodyPlots = document.getElementsByClassName('body--plots')[0];
                bodyPlots.prepend(plotBox);
                document.getElementById('imdb').prepend(plot + byImdb);
                document.getElementById('imdb').style.fontStyle = 'italic';
                document.getElementsByClassName('plot-full')[0].prepend(newLineBreak);

                if (plot != 'N/A' && plot != 'undefined') {
                    if (!plotAdded) {
                        let counts = document.getElementsByClassName('count');
                        for (let i = 0; i < counts.length; i++) {
                            let header = counts[i].parentNode;
                            if (header && header.textContent.trim().startsWith("Obsahy")) {
                                let match = counts[i].innerText.match(/\d+/);
                                if (match) {
                                    let count = parseInt(match[0], 10);
                                    counts[i].innerText = `(${count + 1})`;
                                    plotAdded = true;
                                }
                                break;
                            }
                        }
                    }
                } else {
                    bodyPlots.removeChild(plotBox);
                    document.getElementsByClassName('plot-full')[0].removeChild(newLineBreak);
                }

                let originElement = document.getElementsByClassName('origin')[0];
                if (!originElement.getAttribute('data-original-text')) {
                    originElement.setAttribute('data-original-text', originElement.innerText);
                }

                let currentText = originElement.getAttribute('data-original-text');
                let formattedText = currentText;

                let match = currentText.match(/^([A-Za-zá-žÁ-Ž\/\s]+?)\s+((?:\d{4}(?:–\d{4})?|\(\d{4}–\d{4}\)))\s+(.+)$/);
                if (match) {
                    formattedText = match[1].trim() + ', ' + match[2].trim() + ', ' + match[3].trim();
                } else {
                    formattedText = currentText.replace(/([A-Za-zá-žÁ-Ž\/\s]+?)\s+(\d{4})\s+(\d+\s*min)/, '$1, $2, $3');
                }

                if (response.Rated && response.Rated != 'N/A') {
                    let originalHTML = originElement.innerHTML;
                    let newHTML = originalHTML + ' <span class="bullet"></span> MPAA: ' + response.Rated;
                    originElement.innerHTML = newHTML;
                }

                let ratingContainer = document.getElementById('csfd-extended-ratings');
                if (ratingContainer) ratingContainer.innerHTML = '';

                function createRatingButton(id, rating, backgroundColor) {
                    if (isNaN(parseFloat(rating))) return;

                    let csfdRatingContainer = document.getElementsByClassName('film-rating-average')[1];
                    let csfdWidth = csfdRatingContainer.offsetWidth;

                    if (!ratingContainer) {
                        ratingContainer = document.createElement('div');
                        ratingContainer.id = 'csfd-extended-ratings';
                        csfdRatingContainer.parentNode.insertBefore(ratingContainer, csfdRatingContainer.nextSibling);
                    }

                    let button = document.createElement('button');
                    button.id = id;
                    button.innerText = rating;
                    button.style.cssText = `
                        background: ${backgroundColor};
                        color: white;
                        width: ${csfdWidth}px;
                        height: auto;
                        padding: 30px 0;
                        font-size: 42px;
                        font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                        font-weight: bold;
                        cursor: default;
                        user-select: text;
                        display: block;
                        box-sizing: border-box;
                    `;

                    ratingContainer.appendChild(button);
                }

                try {
                    if (response.imdbRating) createRatingButton('imdbRating', response.imdbRating * 10 + '%', '#F5C518');

                    let rtRating = response.Ratings.find((rating) => rating.Source == 'Rotten Tomatoes');
                    if (rtRating && rtRating.Value) createRatingButton('rtRating', rtRating.Value, '#FA320A');

                    if (response.Metascore) createRatingButton('mcRating', response.Metascore + '%', 'black');
                } catch (error) {
                }
            }

            function isSeries() {
                let typeElement = document.querySelector('.type');
                if (!typeElement) return false;
                let nonSeriesTypes = ['(pracovní název)', '(festivalový název)', '(neoficiální název)', '(TV film)'];
                return !nonSeriesTypes.includes(typeElement.innerText);
            }

            let genres = document.getElementsByClassName('genres')[0].innerText;

            function updatePlotText(plot) {
                let existingImdb = document.getElementById('imdb');
                if (existingImdb) existingImdb.remove();

                let lineBreak = document.querySelector('.plot-full > br');
                if (lineBreak) lineBreak.remove();

                let plotBox = document.createElement('div');
                let newLineBreak = document.createElement('br');
                let byImdb = ' (IMDb)';
                plotBox.id = 'imdb';
                document.getElementsByClassName('body--plots')[0].prepend(plotBox);
                document.getElementById('imdb').prepend(plot + byImdb);
                document.getElementById('imdb').style.fontStyle = 'italic';
                document.getElementsByClassName('plot-full')[0].prepend(newLineBreak);
            }

            let buttons = [];

            if (genres.includes('Horor') && !isSeries()) {
                buttons.push(this.createButton('Reel Scary', 'horror', 'https://www.reelscary.com/movies?utf8=%E2%9C%93&q=' + titleCheck()));
            }

            buttons.push(
                this.createButton('Trailer', 'trailer', 'https://www.youtube.com/results?search_query=' + encodedOpenGraphTitle + ' Trailer'),
                this.createButton('DabingForum', 'dabingforum', 'https://dabingforum.cz/search.php?keywords=' + encodeURIComponent(titleName))
            );

            $(buttonContainer).append(buttons);

            fetchMovieData();
        }

        createButton(name, style, url) {
            let backgroundColor = '';
            let iconClass = 'icon-globe-circle';

            if (style == 'horror') backgroundColor = '#000000';
            else if (style == 'trailer') backgroundColor = '#ff0033';
            else if (style == 'dabingforum') backgroundColor = '#0b7bbd';
            else if (style == 'plot') {
                backgroundColor = '#8C92AC';
                iconClass = 'icon-folder';
            }

            let button = $('<a>').attr('href', url).addClass('button button-big').css({
                'background-color': backgroundColor,
                'color': '#FFFFFF',
                'padding': '8px',
                'display': 'inline-flex',
                'align-items': 'center',
                'gap': '8px',
                'text-decoration': 'none',
                'border-radius': '6px',
                'font-size': '14px',
                'width': '150px',
                'min-width': '150px'
            }).html(`<i class='icon ${iconClass}' style='margin-right: 2px;'></i>${name}`);

            button.hover((e) => {
                $(e.target).css({
                    'opacity': 1.0,
                });
            }, (e) => {
                $(e.target).css({
                    'opacity': 0.95,
                });
            });
            button.trigger('mouseleave');
            return button;
        }
    }

    class UserRating {
        constructor(csfd) {
            this.csfd = csfd;
            this.initializeUserRating();
        }

        initializeUserRating() {
            let currentUserRatingDate = this.csfd.getCurrentUserRatingDate();
            if (currentUserRatingDate == null) return;

            let currentUserRatingBoxTitle = this.csfd.csfdPage.find('.my-rating h3');
            if (currentUserRatingBoxTitle.length == 0) return;

            currentUserRatingBoxTitle.text('Hodnoceno ' + currentUserRatingDate);
        }
    }

    class WantToWatch {
        constructor(csfd) {
            this.csfd = csfd;
            this.initializeWantToWatch();
        }

        initializeWantToWatch() {
            if (!this.csfd.isMarkedAsWantToWatch()) {
                return;
            }
            let wantToWatch = $('<a>').attr('href', '?name=watchlist&do=modalWindow')
            .css({
                'background': '#BA034F',
                'border-top': '1px solid #D2D2D2',
                'color': '#FFFFFF',
                'display': 'block',
                'opacity': 0.8,
                'padding': '5px',
                'text-align': 'center',
            })
            .html('👁️ Chci vidět');
            wantToWatch.hover((e) => {
                $(e.target).animate({
                    'opacity': 1.0,
                });
            }, (e) => {
                $(e.target).animate({
                    'opacity': 0.8,
                });
            },
                             );
            this.csfd.csfdPage.find('.tabs.tabs-rating.rating-fan-switch').prepend(wantToWatch);
        }
    }

    class ImageFloatingPreview {
        constructor(csfd) {
            this.csfd = csfd;
            this.initializeImageFloatingPreview();
        }

        initializeImageFloatingPreview() {
            this.popup = $('<img>')
                .css({
                'box-shadow': '5px 5px 14px 8px rgba(0,0,0,0.75)',
                'z-index': 999,
            });
            $('body').append(this.popup);
            $('.creators a').bind('mouseenter', (e) => {
                let creatorUrl = $(e.target).attr('href');
                this.hoverCreatorLink(creatorUrl);
                this.refreshPopupPosition(e.pageX, e.pageY);
            }).bind('mousemove', (e) => this.refreshPopupPosition(e.pageX, e.pageY)).bind('mouseleave', () => this.abort());
        }

        showPopup(imageUrl) {
            this.popup.attr('src', imageUrl);
            this.popup.show();
        }

        hidePopup() {
            this.popup.attr('src', '');
            this.popup.hide();
        }

        refreshPopupPosition(x, y) {
            this.popup.css({
                'position': 'absolute',
                'left': x + 15,
                'top': y + 15,
            })
        }

        abort() {
            this.currentRequest.abort();
            this.hidePopup();
        }

        hoverCreatorLink(url) {
            this.currentRequest = $.ajax({
                method: 'GET',
                url: url,
            });
            this.currentRequest.done((response) => {
                if (typeof response == 'object' && 'redirect' in response) {
                    this.hoverCreatorLink(response.redirect);
                    return;
                }

                let creatorImageUrl = $(response).find('.creator-profile-content>figure img').attr('src');
                if (creatorImageUrl != undefined) this.showPopup(creatorImageUrl);
            });
        }
    }

    let csfd = new Csfd($('div.page-content'));
    let userRating = new UserRating(csfd);
    let wantToWatch = new WantToWatch(csfd);
    let toolbar = new Toolbar(csfd);
    let imageFloatingPreview = new ImageFloatingPreview(csfd);
})();