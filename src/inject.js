function injectMenuItem() {}

export function injectIncomingComments() {
  // Inject menu item
  // Inject tab item
}

export function hideDeleteButtons() {
  const classNameQuery = "ico_delete _btnDeleteSeries";
  const deleteButtons = document.getElementsByClassName(classNameQuery);

  for (let i = 0; i < deleteButtons.length; i++) {
    const deleteButton = deleteButtons[i];
    if (deleteButton.style.visibility !== "hidden") {
      deleteButton.style.visibility = "hidden";
    }
  }
}

export function reorderHeader() {
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

export function hideRating() {
  const sideDetail = document.getElementById("_asideDetail");
  if (sideDetail) {
    const grade_area = sideDetail.getElementsByClassName("grade_area");
    if (grade_area) {
      const rating = grade_area[0].children[2];
      rating.style.visibility = "hidden";
    }
  }
}

export function roundSub() {
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
