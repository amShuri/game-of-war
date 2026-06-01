export function saveToLocalStorage(name, item) {
    localStorage.setItem(name, JSON.stringify(item))
}

export function loadFromLocalStorage(item) {
    return JSON.parse(localStorage.getItem(item))
}