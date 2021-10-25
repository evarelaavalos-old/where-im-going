const fs = require('fs');
const URL_STORAGE_KEY = 'foundedGoogleURL';

class LocalStorage {
    static getItem(fileName) {
        try {
            const data = fs.readFileSync(`${fileName}.txt`, {flag: 'r'});
            return data.toString();
        } catch(err) {
            return undefined;
        }
    }

    static setItem(fileName, data) {
        fs.writeFileSync(`${fileName}.txt`, data, {flag: 'w'});
    }

    static removeItems(fileName) {
        fs.unlinkSync(`${fileName}.txt`);
    }
}

class UrlStorage {
    /**
     * Returns an array of the stored urls.
     * 
     * @return {Array.<string>} urls The stored urls.
     */
    static getUrls({
        normalized = false,
        uniqueValues = false,
        sorted = false,
    } = {}) {
        try {
            let storedUrlsString = LocalStorage.getItem(URL_STORAGE_KEY);
            let storedUrls = !storedUrlsString ? [] : [...storedUrlsString.split(',')];

            if (normalized) {
                storedUrls = storedUrls.map(url => this._normalizeUrl(url));
            }

            if (uniqueValues) {
                storedUrls = [...new Set(storedUrls)];
            }

            if (sorted) {
                storedUrls.sort();
            }

            return storedUrls;
        }
        catch (err) {
            console.error(err);
        }
    }

    /**
     * Store the given URL.
     *
     * @param {string} url The URL to store.
     */
    static saveUrl(url) {
        try {
            let storedUrls = this.getUrls();

            // This one-line have two responsabilites:
            // 1. Check if storedUrls is empty
            // 2. Parse storedUrls to string
            let updatedUrls = storedUrls.length ? storedUrls.toString() : '';

            // Add ',' at the end of the string if it's not empty
            if (updatedUrls) updatedUrls += ',';
            updatedUrls += url;

            LocalStorage.setItem(URL_STORAGE_KEY, updatedUrls);
        }
        catch (err) {
            console.error(err);
        }
    }

    /**
     * Store all the given URLs.
     *
     * @param {Array.<string>} urls The URLs to store.
     */
    static saveUrls(urls) {
        try {
            if (Array.isArray(urls)) {
                let storedUrls = this.getUrls();

                // This one-line have two responsabilites:
                // 1. Check if storedUrls is empty
                // 2. Parse storedUrls to string
                let updatedUrls = storedUrls.length ? storedUrls.toString() : '';

                // Add ',' at the end of the string if it's not empty
                if (updatedUrls) updatedUrls += ',';
                updatedUrls += urls.join();

                LocalStorage.setItem(URL_STORAGE_KEY, updatedUrls);
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    /**
     * Display an alert with the stored URLs.
     */
    static displayUrls({
        normalized = false,
        uniqueValues = false,
        sorted = false,
    } = {}) {
        try {
            let storedUrls = this.getUrls({ normalized, uniqueValues, sorted });

            let storedUrlsString = storedUrls.toString().replaceAll(',', '\n');

            alert(storedUrlsString);
        }
        catch (err) {
            console.error(err);
        }
    }

    /**
     * Remove all the stored URLs.
     */
    static clearUrls() {
        try {
            LocalStorage.removeItem(URL_STORAGE_KEY);
        }
        catch (err) {
            console.error(err);
        }
    }

    static _normalizeUrl(url) {
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
}

module.exports = {
    UrlStorage
};