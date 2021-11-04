const fs = require('fs');
const path = require('path');

class Url {
    constructor(fullPath) {
        this.fullPath = fullPath;
    }

    static normalize(url) {
        let matchProtocolRegex = /^https?:\/\/w?w?w?\.?/gm;
        let normalizedUrl = url.replace(matchProtocolRegex, '');

        //assuming the protocol was removed.
        //remove the URL path, the string of information that comes after the top level domain name.
        //youtube.com/watch?v=dQw4w9WgXcQ -> youtube.com
        if (normalizedUrl.includes('/')) {
            normalizedUrl = normalizedUrl.substring(0, normalizedUrl.indexOf('/'));
        }

        return normalizedUrl;
    }

    // TODO
    // get fullPath() {}
    // check typeof 'string'

    // TODO
    // get protocol() {}
}

class GoogleLink {
    constructor(resultIndex, resultPage, url) {
        this.resultIndex = resultIndex;
        this.resultPage = resultPage;
        this.url = url;
    }

    set url(url) {
        if (url instanceof Url) this._url = url
        else this._url = new Url(url);
    }

    get url() {
        return this._url;
    }
}

class LinksCollectorService {
    constructor() {
        // TODO add the name of the query searched;
        this.links = [];
    }

    // collector.getLinks({ normalized: true, onlyUrls: true });
    // returns a copy of the object
    getLinks({
        // plainObject = false,
        normalized = false,
        uniqueValues = false,
        sorted = false,
        onlyUrls = false,
    } = {}) {
        let links = this._duplicateLinks(true);

        if (normalized) {
            links = links.map(link => {
                let {resultIndex, resultPage, url} = link;
                return {resultIndex, resultPage, url: Url.normalize(url)};
            });
        }

        if (uniqueValues) {
            const isFirstAppearance = function(value, index, self) {
                let isFirstAppearance = true;
            
                // Check if there is a duplicate behind on the array
                self.slice(0, index).forEach((cloneValue, cloneIndex) => {
                    if(value.url == cloneValue.url)
                        isFirstAppearance = false;
                })
            
                return isFirstAppearance;
            }
            
            links = links.filter(isFirstAppearance);
        }

        if (sorted) {
            links.sort((firstEl, secondEl) => firstEl.url < secondEl.url);
        }

        if (onlyUrls) {
            links = links.map(link => link.url);
        }

        return links;
    }

    saveLink(link) {
        // TODO A bit of typechecking;
        if (link instanceof GoogleLink) {
            this.links.push(link);
        } else if (typeof link == "object" && link.hasOwnProperty('resultIndex') &&
            link.hasOwnProperty('resultPage') && link.hasOwnProperty('url')) {
            let googleLink = new GoogleLink(link.resultIndex, link.resultPage, link.url);
            this.links.push(googleLink);
        } else {
            throw new Error('The given parameter to saveLink() is not a valid Object');
        }
    }

    export(pathToExport = __dirname, {
        // plainObject = false,
        normalized = false,
        uniqueValues = false,
        sorted = false,
        onlyUrls = false,
    } = {}) {
        let links = this.getLinks({ normalized, uniqueValues, sorted, onlyUrls });

        let linksAsJSON = JSON.stringify(links);

        // TODO Add the option to export as plain text or csv
        // TODO rename the file as the linkscollectorservice query
        // TODO add the date when export and the 'minified' string added
        try {
            fs.writeFileSync(path.join(pathToExport, `dummy.json`), linksAsJSON, {flag: 'w'});
        } catch(err) {
            console.error(err);
        }
    }

    _duplicateLinks(plainObject = false) {
        let duplicatedLinks = [];
        let duplicatedLinksObj = JSON.parse(JSON.stringify(this.links));

        for (let {resultIndex, resultPage, _url: { fullPath }} of duplicatedLinksObj) {
            if (plainObject) {
                duplicatedLinks.push({
                    resultIndex: resultIndex,
                    resultPage: resultPage,
                    url: fullPath,
                });
            } else {
                duplicatedLinks.push(new GoogleLink(
                    resultIndex,
                    resultPage,
                    fullPath
                ));
            }
        }

        return duplicatedLinks;
    }
}

// TODO Ver por exportar a medida que se van creando las clases
// por ejemplo: module.exports.URL = class {}
// O algo así
module.exports = {
    Url,
    GoogleLink,
    LinksCollectorService
}