"use strict";

// =====================NOTE===================== //
// Make sure to sync this with popup > setting.ts //
// TODO: globalize these to share with popup      //
const STORAGE_SETTING_NAME = "cs_settings";

let setting = {
    incomingComments: true,
    authToken: false,
    hideDelete: true,
    reorderHeader: false,
    hideRating: false,
    roundSub: false,
};
// ============================================== //

async function getSetting() {
    const parseItem = (item) => {
        console.log(`Parseing item: ${item.key} (value=${item.value})`);
        if (
            "key" in item &&
            "value" in item &&
            Object.keys(setting).includes(item.key)
        ) {
            setting[item.key] = item.value;
        }
    };

    if (chrome.storage) {
        console.log("Getting setting from chrome");
        await chrome.storage.sync.get(STORAGE_SETTING_NAME).then((items) => {
            if (STORAGE_SETTING_NAME in items) {
                items[STORAGE_SETTING_NAME].forEach(parseItem);
            }
        });
    } else {
        // perhaps check localStorage
        console.log("Getting setting from localStorage");
        const stored = localStorage.getItem(STORAGE_SETTING_NAME);
        if (stored) {
            const storedJson = JSON.parse(stored);
            if (Array.isArray(storedJson)) {
                storedJson.forEach(parseItem);
            }
        }
    }

    console.log(setting);
}

function injectIncomingComments() {
    // TODO: implement this
}

function hideDeleteButtons() {
    const classNameQuery = "ico_delete _btnDeleteSeries";
    const deleteButtons = document.getElementsByClassName(classNameQuery);

    for (let i = 0; i < deleteButtons.length; i++) {
        const deleteButton = deleteButtons[i];
        if (deleteButton.style.visibility !== "hidden") {
            deleteButton.style.visibility = "hidden";
        }
    }
}

function reorderHeader() {
    const buttonsTopRight = document.getElementsByClassName("sta");
    if (buttonsTopRight && buttonsTopRight.length !== 0) {
        const lk_creators =
            document.getElementsByClassName("lk_creators on")[0];
        const btnLoginInfo = document.getElementById("btnLoginInfo");
        const btnLogin = document.getElementById("btnLogin");
        btnLoginInfo.style.marginLeft = "4px";
        const btnPublish = document.getElementById("btnPublish");
        btnPublish.style.marginLeft = "4px";
        const btnSearch = document.getElementsByClassName(
            "btn_search _btnSearch"
        )[0];
        const span = document.getElementsByClassName("bar");

        const elements = document.createDocumentFragment();
        elements.appendChild(btnSearch);
        elements.appendChild(span[0]);
        elements.appendChild(btnLoginInfo);
        elements.appendChild(btnLogin);
        elements.appendChild(btnPublish);
        elements.appendChild(span[1]);
        elements.appendChild(lk_creators);

        buttonsTopRight[0].appendChild(elements);

        const searchArea = document.getElementsByClassName(
            "search_area _searchArea"
        )[0];
        searchArea.style.left = "-290px";

        const loginbox = document.getElementById("layerMy");
        //loginbox.style.left = "-250px";
        loginbox.style.right = "250px";
    }
}

function hideRating() {
    const sideDetail = document.getElementById("_asideDetail");
    if (sideDetail) {
        const grade_area = sideDetail.getElementsByClassName("grade_area");
        if (grade_area) {
            const rating = grade_area[0].children[2];
            rating.style.visibility = "hidden";
        }
    }
}

function roundSub() {
    const roundThousand = (value) => Math.round(value / 1000);

    const sideDetail = document.getElementById("_asideDetail");
    if (sideDetail) {
        const grade_area = sideDetail.getElementsByClassName("grade_area");
        if (grade_area) {
            const subCounterElement = grade_area[0].children[1].children[1];
            var regExpLetters = /[a-zA-Z]/g;
            if (!regExpLetters.test(subCounterElement.innerText)) {
                const subCounter = parseInt(
                    subCounterElement.innerText.replaceAll(",", "")
                );
                if (subCounter >= 1000)
                    subCounterElement.innerText =
                        roundThousand(subCounter).toLocaleString("hi-IN") + "k";
            }
        }
    }
}

// Main Function for applying extension changes
async function extendWebtoons() {
    const currUrl = document.location.href;

    const reWebtoons = new RegExp(
        /^https\:\/\/www\.webtoons\.com\/.*$/, 
        "i"
    );
    const reComments = new RegExp(
        /^https\:\/\/www\.webtoons\.com\/.*\/mycomment/,
        "i"
    );
    const reDashboard = new RegExp(
        /^https\:\/\/www\.webtoons\.com\/.*\/challenge\/dashboard/,
        "i"
    );

    if (currUrl.match(reWebtoons)) {
        if (setting.reorderHeader) {
            reorderHeader();
        }
        if (setting.hideRating) {
            hideRating();
        }
        if (setting.roundSub) {
            roundSub();
        }
    }

    if (currUrl.match(reDashboard) && setting.hideDelete) {
        hideDeleteButtons();
    }

    if (currUrl.match(reComments) && setting.incomingComments) {
        injectIncomingComments();
    }
}

window.onload = async () => {
    console.log("Window onload");
    await getSetting();
    await extendWebtoons();
};

if (chrome.storage) {
    chrome.storage.sync.onChanged.addListener(async () => {
        // TODO: Revert "injected" changes without doing reload()
        await getSetting();
        window.location.reload();
        await extendWebtoons();
    });
}
