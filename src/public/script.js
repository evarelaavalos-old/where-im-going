const form = document.getElementById('form');

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
    return input.value.replace(' ', '-');
}

form.addEventListener('submit', (event) => {
    // stop from submission
    event.preventDefault();

    // validate the form
    let isValidSearch = validateSearch(form.elements["search"]);
    console.log(isValidSearch);

    // if valid, submit the form.
    if (isValidSearch) {
        let search = getParsedSearch(form.elements["search"]);
        
        event.target.action += search;
        console.log(`GET request at ${event.target.action}`);
        form.submit();
    }
})