// =====================NOTE===================== //
// Make sure to sync this with popup > setting.ts //
// TODO: globalize these to share with popup      //
// ---------------------------------------------- //
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
}

function modifyCommentsMenu(inject) {
  // Parameters
  //    - inject: boolean
  const menuId = "layerMy";

  const menu = document.getElementById(menuId);
  const menuAItems = menu.getElementsByTagName("a");

  const commentItem = Array.prototype.find.call(menuAItems, (elem) => {
    return RegExp(/^Comments$/).exec(elem.innerText);
  });
  if (commentItem) {
    if (inject && !commentItem.hasAttribute("cs-modified")) {
      const inCommentItemParent = commentItem.parentElement.cloneNode(true);
      const inId = crypto.randomUUID();
      inCommentItemParent.id = inId;

      const inCommentItem = Array.prototype.find.call(
        inCommentItemParent.children,
        (elem) => {
          return elem.innerText === commentItem.innerText;
        }
      );
      inCommentItem.innerText = "Comments (IN)";
      inCommentItem.href += "#incomming";

      commentItem.setAttribute("cs-modified", commentItem.innerText);
      commentItem.setAttribute("cs-in-comment-id", inId);
      commentItem.innerText = "Comments (OUT)";

      commentItem.parentElement.after(inCommentItemParent);
    }
    if (!inject && commentItem.hasAttribute("cs-modified")) {
      const inId = commentItem.getAttribute("cs-in-comment-id");

      commentItem.innerText = commentItem.getAttribute("cs-modified");
      commentItem.removeAttribute("cs-modified");
      commentItem.removeAttribute("cs-in-comment-id");

      const inCommentItemParent = document.getElementById(inId);
      inCommentItemParent.remove();
    }
  }
}

function injectIncomingComments() {
  // Inject menu item
  modifyCommentsMenu();
  // Inject tab item
}

function modifyDeleteButtons(hide) {
  // Parameters
  //    - hide: boolean
  const classNameQuery = "ico_delete _btnDeleteSeries";
  const deleteButtons = document.getElementsByClassName(classNameQuery);

  for (let i = 0; i < deleteButtons.length; i++) {
    const deleteButton = deleteButtons[i];
    if (hide && deleteButton.style.visibility !== "hidden") {
      deleteButton.style.visibility = "hidden";
    }
    if (!hide && deleteButton.style.visibility === "hidden") {
      deleteButton.style.visibility = "unset";
    }
  }
}

function reorderHeader() {
  // TODO: Fix
  const buttonsTopRight = document.getElementsByClassName("sta");
  if (buttonsTopRight && buttonsTopRight.length !== 0) {
    const lk_creators = document.getElementsByClassName("lk_creators on")[0];
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

function modifyRating(hide) {
  // Parameter
  //      - hide: boolean
  const sideDetail = document.getElementById("_asideDetail");
  if (sideDetail) {
    const grade_area = sideDetail.getElementsByClassName("grade_area");
    if (grade_area) {
      const rating = grade_area[0].children[2];
      if (hide && rating.style.visibility !== "hidden") {
        rating.style.visibility = "hidden";
      }
      if (!hide && rating.style.visibility === "hidden") {
        rating.style.visibility = "unset";
      }
    }
  }
}

function modifySubCount(round) {
  // Parameter
  //      - round: boolean
  const roundThousand = (value) => Math.round(value / 1000);

  const sideDetail = document.getElementById("_asideDetail");
  if (sideDetail) {
    const grade_area = sideDetail.getElementsByClassName("grade_area");
    if (grade_area) {
      let subCounterElement = grade_area[0].children[1].children[1];
      if (round && !subCounterElement.hasAttribute("cs-origId")) {
        var regExpLetters = /[a-zA-Z]/g;
        if (!regExpLetters.test(subCounterElement.innerText)) {
          const subCounter = parseInt(
            subCounterElement.innerText.replaceAll(",", "")
          );
          if (subCounter >= 1000) {
            const origId = crypto.randomUUID();
            const origElement = subCounterElement.cloneNode(true);
            origElement.id = origId;
            origElement.style.display = "none";

            subCounterElement.setAttribute("cs-origId", origId);
            subCounterElement.innerText =
              roundThousand(subCounter).toLocaleString("hi-IN") + "k";
            subCounterElement.after(origElement);
          }
        }
      }
      if (!round && subCounterElement.hasAttribute("cs-origId")) {
        const origId = subCounterElement.getAttribute("cs-origId");
        const origElement = document.getElementById(origId);
        origElement.id = subCounterElement.id;
        origElement.style.display = subCounterElement.style.display;

        subCounterElement.parentElement.insertBefore(
          subCounterElement,
          origElement
        );
        subCounterElement.remove();
      }
    }
  }
}

async function main() {
  const url = document.location.url;

  const reWebtoons = new RegExp(/^https\:\/\/www\.webtoons\.com\/.*$/, "i");
  const reComments = new RegExp(
    /^https\:\/\/www\.webtoons\.com\/.*\/mycomment/,
    "i"
  );
  const reDashboard = new RegExp(
    /^https\:\/\/www\.webtoons\.com\/.*\/challenge\/dashboard/,
    "i"
  );

  if (url.match(reWebtoons)) {
    modifyRating(setting.hideRating);
    modifySubCount(setting.roundSub);
    modifyCommentsMenu(setting.incomingComments);

    if (setting.reorderHeader) {
      reorderHeader();
    }
  }

  if (url.match(reDashboard)) {
    modifyDeleteButtons(setting.hideDelete);
  }

  // if (url.match(reComments)) {
  //   chrome.scripting.executeScript({
  //     target: { tabId },
  //     func: incomingComments,
  //     args: [setting.incomingComments]
  //   });
  // }
}

window.onload = async () => {
  console.log("Window onload");
  await getSetting();
  main();
};

if (chrome.storage) {
  chrome.storage.sync.onChanged.addListener(async () => {
    // TODO: Revert "injected" changes without doing reload()
    await getSetting();
    main();
  });
}
