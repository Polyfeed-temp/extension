
export function setChromeLocalStorage({ key, value }: { [key: string]: any }) {
    chrome.storage.local.set({ [key]: value }, () => {
        console.log("LocalStorage updated with " + key);
    });

}

export function getChromeLocalStorage(key: string) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[key]);
            }
        });
    });
}
