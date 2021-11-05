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
    constructor(page, index, url) {
        this.page = page;
        this.index = index;
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
            links = links.map(({url, ...otherProperties}) => {
                return {
                    ...otherProperties,
                    url: Url.normalize(url),
                }
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
        if (this._isInstanceOfGoogleLink(link)) {
            this.links.push(new GoogleLink(link.page, link.index, link.url));
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

    _isInstanceOfGoogleLink(object) {
        if (object instanceof GoogleLink) {
            return true;
        }

        if ((typeof object == "object") && object.hasOwnProperty('page')
        && object.hasOwnProperty('index') && object.hasOwnProperty('url')) {
            return true;
        }

        return false;
    }

    _duplicateLinks(plainObject = false) {
        let duplicatedLinks = [];
        let duplicatedLinksObj = JSON.parse(JSON.stringify(this.links));

        for (let { page, index, _url: { fullPath: url } } of duplicatedLinksObj) {
            if (plainObject) {
                duplicatedLinks.push({ page, index, url });
            } else {
                duplicatedLinks.push(new GoogleLink(page, index, url));
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