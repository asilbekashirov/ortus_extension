const normalizeSubjectLinks = () => {
  const semesters = document.querySelector(".moodle-courses");
  const subjectDivs = semesters?.querySelectorAll("div");

  if (subjectDivs) {
    const openSection = Array.from(subjectDivs).find((child) => {
      return child.style.display === "block";
    });

    if (openSection) {
      [...openSection.children].map((child) => {
        const link = child.querySelector("a");

        const courseItem = document.createElement("a");
        courseItem.setAttribute("class", "courseItem");
        courseItem.href = link.href;
        courseItem.innerText = link.innerText;

        const courseItemLogo = document.createElement("div");
        courseItemLogo.innerHTML = subjectIcon;

        courseItem.prepend(courseItemLogo);

        child.remove();

        openSection.appendChild(courseItem);
      });
    }
  }
};

const normalizeNavBar = () => {
  const navbar = document.querySelector("ul#portalNavigationTabGroupsList");
  const topBar = document.querySelector("#portalPageBar");
  const scheduleTab = document.createElement("li");
  const scheduleTabLink = document.createElement("a");
  const scheduleTabSpan = document.createElement("span");

  setAttributes(scheduleTabLink, {
    href: "/f/u108l1s329/normal/render.uP",
    title: "Schedule",
  });
  setAttributes(scheduleTabSpan, {
    class: "portal-tabGroup-label",
  });
  scheduleTabSpan.innerText = "Schedule";

  scheduleTabLink.appendChild(scheduleTabSpan);
  scheduleTab.appendChild(scheduleTabLink);

  if (navbar && navbar.children) {
    [...navbar.children].map((navItem, index) => {
      if (index > 1) {
        navbar.removeChild(navItem);
      }
    });

    navbar.appendChild(scheduleTab);
  }

  if (topBar) {
    setAttributes(topBar, {
      "class": "newPortalPageBar py"
    })
  }
};

const handleLoginPage = () => {
  const loginForm = document.querySelector("#rtuid");

  if (loginForm) {
    const userName = loginForm.querySelector("#IDToken1");
    const password = loginForm.querySelector("#IDToken2");
    const submitBtn = document.querySelector("input[type=submit]");

    chrome.storage.sync.get(["credentials"], (data) => {
      const parsed = data["credentials"]
        ? JSON.parse(data["credentials"])
        : null;
      userName.value = parsed?.userName || "";
      password.value = parsed?.password || "";

      if (parsed?.autoSubmit) {
        submitBtn.click();
      }
    });
  }
};

function setAttributes(target, attributes) {
  for (const key in attributes) {
    target.setAttribute(key, attributes[key]);
  }
}
const subjectIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
	<path fill="#a0041e" d="M35 26a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V6.313C1 4.104 6.791 0 9 0h20.625C32.719 0 35 2.312 35 5.375z" />
	<path fill="#ccd6dd" d="M33 30a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V6c0-4.119-.021-4 5-4h21a4 4 0 0 1 4 4z" />
	<path fill="#e1e8ed" d="M31 31a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h24a3 3 0 0 1 3 3z" />
	<path fill="#be1931" d="M31 32a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4h21a4 4 0 0 1 4 4z" />
	<path fill="#dd2e44" d="M29 32a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4h19.335C27.544 8 29 9.456 29 11.665z" />
	<path fill="#a0041e" d="M6 6C4.312 6 4.269 4.078 5 3.25C5.832 2.309 7.125 2 9.438 2H11V0H8.281C4.312 0 1 2.5 1 5.375V32a4 4 0 0 0 4 4h2V6z" />
</svg>`;

const replaceBanner = () => {
  const bannerContainer = document.querySelector("#portalPageHeaderInner");
  const ortusLogo = document.querySelector("#portalLogo > a");
  const tabsParent = document.querySelector("#portalNavigation");

  if (bannerContainer && ortusLogo && tabsParent) {
    ortusLogo.remove();
    const newBannerLink = chrome.runtime.getURL("assets/rtu_banner.jpeg");
    bannerContainer.style.backgroundImage = `url(${newBannerLink})`;
    bannerContainer.style.backgroundPosition = "top";
    bannerContainer.style.backgroundSize = "cover";
    const tabs = tabsParent.querySelector("#portalNavigationTabGroup")
    tabs.setAttribute("class", "newPortalPageBar")
    bannerContainer.appendChild(tabs)
  }
};

const normalizeMainLayout = () => {
  const mainContainer = document.querySelector("#portalPageBodyLayout")
  let learningCourses = mainContainer?.lastChild?.firstChild

  if (mainContainer) {
    mainContainer.innerHTML = ""

    const newContainer = document.createElement("div")
    newContainer.setAttribute("class", "newMainContainer");
  
    newContainer.appendChild(learningCourses)
    mainContainer.appendChild(newContainer)
  }
}

(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value } = obj;

    if (type === "LOGIN_PAGE") {
      handleLoginPage();
    } else if (type === "SAVE_CREDENTIALS") {
      handleCredentialsSave(value);
    } else if (type === "MAIN_PAGE") {
      handleMainPage();
    } else if (type === "FETCHING_SCHEDULE") {
      normalizeSchedule()
      // setTimeout(() => {
      //   normalizeSchedule()
      // }, 1000)
    }
  });

  const normalizeSchedule = () => {
    const calendar = document.querySelector("#calendar");
    const thisYear = new Date().getFullYear()
    const todayText = document.querySelector(".week-info-day").innerText.split(',')[1].trim() + `, ${thisYear}`

    if (calendar && todayText) {
      const subjects = calendar.querySelectorAll("tr.fc-list-day")
      const calendarScrollContent = calendar.querySelector(".fc-scroller.fc-scroller-liquid")

      if (subjects && calendarScrollContent) {
        const foundDay = Array.from(subjects).find(s => new Date(s.innerText.split(/\r?\n/)[0]).getTime() >= new Date(todayText).getTime())
        Array.from(subjects).map(s => s.setAttribute("id", "subject_day_text"))

        if (foundDay) {
          calendarScrollContent.scrollBy({
            top: foundDay.getBoundingClientRect().top - calendarScrollContent.getBoundingClientRect().top,
            behavior: 'smooth',
          })
          
          const textNode = foundDay.querySelector("a.fc-list-day-text")
          if (textNode) {
            textNode.innerText = `${textNode.innerText} - Upcoming`
          }
        }

        const daysLeft = Array.from(subjects).filter(s => new Date(s.innerText.split(/\r?\n/)[0]).getTime() >= new Date(todayText).getTime()).length

        const extraInfo = document.createElement("div")
        extraInfo.innerText = `${daysLeft + 1} day(s) to go this month (╥﹏╥) (crying)`
        extraInfo.setAttribute("id", "extra-info")
        calendar.prepend(extraInfo)

      }
    }
  }

  const handleCredentialsSave = async (params) => {
    chrome.storage.sync.set({
      credentials: JSON.stringify(params),
    });
  };

  const handleMainPage = () => {
    normalizeNavBar();
    normalizeSubjectLinks();
    normalizeMainLayout();
    replaceBanner();
  };
  handleMainPage();

  handleLoginPage();
})();
