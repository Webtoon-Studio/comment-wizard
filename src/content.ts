"use strict";

import "./assets/content.css";
import {
  EpisodeNewestPost,
  INCOM_ONMOUNTED_EVENT_NAME,
  POSTS_FETCHED_EVENT_NAME,
  STORAGE_NEWEST_NAME,
  STORAGE_POSTS_NAME,
  STORAGE_SETTING_NAME,
} from "./global";
import { Post } from "./webtoon";

let setting = {
  incomingComments: true,
  hideDelete: true,
  reorderHeader: false,
  hideRating: false,
  roundSub: false,
};

async function getSetting() {
  const parseItem = (item: any) => {
    console.log(`Parseing item: ${item.key} (value=${item.value})`);
    if (
      "key" in item &&
      "value" in item &&
      Object.keys(setting).includes(item.key)
    ) {
      Object.assign(setting, { [item.key]: item.value });
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

interface ScriptProps {
  path: string;
  type?: "module";
}

function createScript(props: ScriptProps): HTMLScriptElement | null {
  const { path, type = "text/javascript" } = props;

  if (chrome.runtime) {
    const url = chrome.runtime.getURL(path);
    const s = document.createElement("script");
    s.src = url;
    s.type = type === "module" ? type : "";
    return s;
  }
  return null;
}

interface CssProps {
  path: string;
}

function createCss(props: CssProps): HTMLLinkElement | null {
  const { path } = props;

  if (chrome.runtime) {
    const href = chrome.runtime.getURL(path);
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = href;
    return l;
  }
  return null;
}

function modifyCommentsMenu(inject: boolean) {
  const menuId = "layerMy";

  const menu = document.getElementById(menuId);
  if (!menu) {
    console.log("Webttons menu is not found. Perhaps in viewer mode?");
    return;
  }

  const menuAItems = menu.getElementsByTagName("a");

  const commentItem = Array.prototype.find.call(menuAItems, (elem) => {
    console.log(elem);
    return RegExp(/Comments/i).exec(elem.innerText);
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
      inCommentItem.href += "#incoming";

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
      if (!inCommentItemParent) {
        throw new Error(
          `Incoming comment item's parent is not found! (id=${inId})`
        );
      }

      inCommentItemParent.remove();
    }
  } else {
    setTimeout(() => {
      modifyCommentsMenu(inject);
    }, 500);
  }
}

interface ElementProp {
  id: string;
  class: string;
  className: string;
  innerText: string;
  style: { [index: string]: string }; // TODO: Specify more? or Refactor this type?
  onClick: VoidFunction;
  children: HTMLElement[];

  [index: string]: any;
}

function modifyMyComments(inject: boolean) {
  // Function for creating elements recursively
  const createElement = function (
    tag: string,
    props: Partial<ElementProp> = {}
  ) {
    const {
      id,
      class: classProp,
      className,
      innerText,
      style,
      onClick,
      children,
      ...others
    } = props;

    const elem = document.createElement(tag);

    if (id) {
      elem.id = id;
    }
    if (className) {
      elem.className = className;
    }
    if (classProp) {
      elem.className = classProp;
    }
    if (innerText) {
      elem.innerText = innerText;
    }
    if (style) {
      Object.keys(style).forEach((key) => {
        if (typeof style[key] === "string") {
          elem.style.setProperty(key, style[key]);
        }
      });
    }
    if (onClick) {
      if (typeof onClick === "function") {
        elem.onclick = onClick;
      } else {
        throw new Error("invalid 'onClick' prop. Must be a function!");
      }
    }

    Object.keys(others).forEach((otherKey) => {
      elem.setAttribute(otherKey, others[otherKey]);
    });

    if (children && !innerText) {
      if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
          elem.appendChild(children[i]);
        }
      } else {
        throw new Error("invalid 'children' prop. Must be an array!");
      }
    }
    return elem;
  };

  // Function for changing tab
  const handleTabChange = function (index: number) {
    const tabs = document.getElementsByClassName("cs-comment-tab-span");
    const contents = document.getElementsByClassName("cs-comment-tab-content");

    // Change tab
    for (let tabi = 0; tabi < tabs.length; tabi++) {
      const t = tabs.item(tabi);
      if (t) {
        if (tabi === index) {
          // tabs.item(tabi)?.classList.add("current-tab");
          t.setAttribute("data-selected", "true");
        } else {
          // tabs.item(tabi)?.classList.remove("current-tab");
          t.setAttribute("data-selected", "false");
        }
      }
    }

    // Change content
    for (let conti = 0; conti < contents.length; conti++) {
      const content = contents.item(conti) as HTMLDivElement;
      const contentTabId = content?.getAttribute("tab-id");
      if (content && contentTabId) {
        const tabi = parseInt(contentTabId);
        if (tabi === index) {
          content.setAttribute("data-selected", "true");
          // content.style.display = "block";
        } else {
          content.setAttribute("data-selected", "false");
          // content.style.display = "none"
        }
      }
    }
  };

  // Inject css file used for injected react content
  const css = createCss({ path: "assets/content.css" });
  if (css) {
    document.head.appendChild(css);
  }

  const isIncoming = window.location.href.includes("#incoming");

  // Inject Tabs (non-react)
  const content = document.getElementById("content");

  if (!content) {
    throw new Error(
      'Content element not found. Did its id changed from "content"?'
    );
  }

  const isExist = document.getElementById("cs-comment-tabs-root") !== null;
  if (!isExist) {
    const contentTabs = content.children.item(1);
    const commentTabs = createElement("div", {
      id: "cs-comment-tabs-root",
      className: "border-b-2px border-[#eaeaea] bg-white/50",
      children: [
        createElement("ul", {
          id: "cs-comment-tabs-wrapper",
          className: "flex justify-center items-stretch mx-auto gap-[60px]",
          children: [
            ...["outgoing", "incoming"].map((v, i) =>
              createElement("li", {
                id: `cs-comment-tab-${v}`,
                class: "cs-comment-tab text-center",
                children: [
                  createElement("span", {
                    id: `cs-comment-tab-${v}-span`,
                    className: [
                      "cs-comment-tab-span",
                      "block px-[5px] text-[#bbb] font-medium leading-[70px] text-[15px] cursor-pointer",
                      "hover:text-[#000]",
                      "data-[selected=true]:border-b-2 data-[selected=true]:border-black data-[selected=true]:text-[#000]",
                    ].join(" "),
                    "data-selected": isIncoming ? i === 1 : i === 0,
                    onClick: () => handleTabChange(i),
                    innerText: v.toUpperCase(),
                  }),
                ],
              })
            ),
          ],
        }),
      ],
    });

    if (contentTabs) {
      contentTabs.after(commentTabs);
    }
  }

  // Main container for default comments section
  const commentArea = document.getElementById("commentArea");

  if (!commentArea) {
    throw new Error(
      'Comment Area element not found. Did its id change from "commentArea"?'
    );
  }

  // Empty comments section
  //    Should have style.display = 'none'
  const emptyList = document.getElementById("emptyList");
  const isEmpty = emptyList?.style.display !== "none";

  if (!isEmpty) {
    commentArea.classList.add("cs-comment-tab-content");
    commentArea.classList.add("data-[selected=false]:!hidden");
    commentArea.setAttribute("data-selected", isIncoming ? "false" : "true");
    commentArea.setAttribute("tab-id", "0");
  }

  const inCommentRoot = document.createElement("div");
  inCommentRoot.id = "cs-in-comment-root";
  inCommentRoot.classList.add(...(commentArea?.classList || []));
  inCommentRoot.classList.add("cs-comment-tab-content");
  inCommentRoot.classList.add("data-[selected=false]:!hidden");
  inCommentRoot.setAttribute("data-selected", isIncoming ? "true" : "false");
  inCommentRoot.setAttribute("tab-id", "1");

  // Setup event listener
  window.addEventListener(INCOM_ONMOUNTED_EVENT_NAME, () => {
    console.log("inCommentRoot onload?");
    chrome.storage.local
      .get([STORAGE_POSTS_NAME, STORAGE_NEWEST_NAME])
      .then((items) => {
        if (STORAGE_POSTS_NAME in items && STORAGE_NEWEST_NAME in items) {
          window.dispatchEvent(
            new CustomEvent<{ posts: Post[]; newest: EpisodeNewestPost[] }>(
              POSTS_FETCHED_EVENT_NAME,
              {
                detail: {
                  posts: items[STORAGE_POSTS_NAME],
                  newest: items[STORAGE_NEWEST_NAME],
                },
              }
            )
          );
        }
      });
  });

  // Inject incoming commnet root after the default comments section
  commentArea.after(inCommentRoot);

  const script = createScript({
    path: "incom.js",
    type: "module",
  });

  if (script) {
    document.head.append(script);
    console.log("Script is injected.");
  }
}

function modifyDeleteButtons(hide: boolean) {
  const selector = ".ico_delete._btnDeleteSeries";
  const deleteButtons = document.querySelectorAll<HTMLAnchorElement>(selector);

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
    const btnPublish = document.getElementById("btnPublish");
    const btnSearch = document.getElementsByClassName(
      "btn_search _btnSearch"
    )[0];
    const span = document.getElementsByClassName("bar");

    if (!btnLogin || !btnLoginInfo || !btnPublish) {
      throw new Error(
        "Unable to get the following element(s): id = btnLogin || btnLoginInfo || btnPublish"
      );
    }

    btnLoginInfo.style.marginLeft = "4px";
    btnPublish.style.marginLeft = "4px";

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
    )[0] as HTMLDivElement;
    searchArea.style.left = "-290px";

    const loginbox = document.getElementById("layerMy") as HTMLDivElement;
    //loginbox.style.left = "-250px";
    loginbox.style.right = "250px";
  }
}

function modifyRating(hide: boolean) {
  const sideDetail = document.getElementById("_asideDetail");
  if (sideDetail) {
    const grade_area = sideDetail.getElementsByClassName("grade_area");
    if (grade_area) {
      const rating = grade_area[0].children[2];
      if (rating instanceof HTMLLIElement) {
        if (hide && rating.style.visibility !== "hidden") {
          rating.style.visibility = "hidden";
        }
        if (!hide && rating.style.visibility === "hidden") {
          rating.style.visibility = "unset";
        }
      }
    }
  }
}

function modifySubCount(round: boolean) {
  const roundThousand = (value: number) => Math.round(value / 1000);

  const sideDetail = document.getElementById("_asideDetail");
  if (sideDetail) {
    const grade_area = sideDetail.getElementsByClassName("grade_area");
    if (grade_area) {
      let subCounterElement = grade_area[0].children[1]
        .children[1] as HTMLEmbedElement;

      // original innerText is embedded as `cs-orig-text`, if was changed
      let origText = subCounterElement.getAttribute("cs-orig-text");

      // flag is true && original text attribute not found
      if (round && !origText) {
        origText = subCounterElement.innerText;
        var regExpLetters = /[a-zA-Z]/g;
        if (!regExpLetters.test(subCounterElement.innerText)) {
          const subCounter = parseInt(
            subCounterElement.innerText.replace(/,/g, "")
          );
          if (subCounter >= 1000) {
            subCounterElement.setAttribute("cs-orig-text", origText);
            subCounterElement.innerText =
              roundThousand(subCounter).toLocaleString("hi-IN") + "k";
          }
        }
      }
      // flag is false && original text attribute found
      if (!round && origText) {
        subCounterElement.innerText = origText;
        subCounterElement.removeAttribute("cs-orig-text");
      }
    }
  }
}

async function main() {
  const url = document.location.href;

  const reWebtoons = new RegExp(/^https\:\/\/www\.webtoons\.com/, "i");
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

  if (url.match(reComments)) {
    modifyMyComments(setting.incomingComments);
  }
}

window.onload = async () => {
  console.log("Window onload");
  await getSetting();
  main();
};

if (chrome.storage) {
  chrome.storage.local.onChanged.addListener(() => {
    chrome.storage.local
      .get([STORAGE_POSTS_NAME, STORAGE_NEWEST_NAME])
      .then((items) => {
        if (STORAGE_POSTS_NAME in items && STORAGE_NEWEST_NAME in items) {
          console.log("Dispatch event");
          window.dispatchEvent(
            new CustomEvent<{ posts: Post[]; newest: EpisodeNewestPost[] }>(
              POSTS_FETCHED_EVENT_NAME,
              {
                detail: {
                  posts: items[STORAGE_POSTS_NAME],
                  newest: items[STORAGE_NEWEST_NAME],
                },
              }
            )
          );
        }
      });
  });
  chrome.storage.sync.onChanged.addListener(async () => {
    // TODO: Revert "injected" changes without doing reload()
    await getSetting();
    main();
  });
}
