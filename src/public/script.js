const searchForm = document.getElementById('search-form');
const toggleButton = document.querySelector('.optional-settings__toggle');

function hasValue(input) {
    if (input.value.trim() === "") {
        return false;
    }

    return true;
}

function validateSearch(input) {
    if (!hasValue(input)) {
        return false;
    }

    //Regex for Valid Characters i.e. Alphabets, Numbers and Space.
    const searchRegex = /^[A-Za-z0-9 ]+$/

    const search = input.value.trim();
    if (!searchRegex.test(search)) {
        return false;
    }
    return true;
}

function getParsedSearch(input) {
    return input.value.replaceAll(' ', '-');
}

searchForm.addEventListener('submit', (event) => {
    // stop from submission
    event.preventDefault();

    // validate the form
    let isValidSearch = validateSearch(searchForm.elements["search-form__input"]);
    console.log(isValidSearch);

    // if valid, submit the form.
    if (isValidSearch) {
        const ROUTE = '/api/links/';
        let search = getParsedSearch(searchForm.elements["search-form__input"]);
        
        event.target.action = ROUTE + search;
        console.log(`GET request at ${event.target.action}`);
        searchForm.submit();
    }
})

toggleButton.addEventListener('click', (event) => {
    event.currentTarget.classList.toggle('active');
})