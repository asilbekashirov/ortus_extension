import { getActiveTabURL, setAttributes } from "./utils.js";

let root;

const setCredentialsForm = () => {
  const formWrapper = document.createElement("div");
  const userName = document.createElement("input");
  const password = document.createElement("input");
  const saveBtn = document.createElement("button");
  const autoSubmit = document.createElement("input");
  const checkboxLabel = document.createElement("label");

  formWrapper.setAttribute("class", "credentialsWrapper")
  saveBtn.setAttribute("class", "btn")
  setAttributes(userName, {
    "id": "userName",
    "class": "input_text"
  })
  setAttributes(password, {
    "id": "password",
    "class": "input_text"
  })
  setAttributes(autoSubmit, {
    "id": "autoSubmit",
    "type": "checkbox"
  })
  setAttributes(checkboxLabel, {
    "id": "checkboxLabel",
    "for": "autoSubmit"
  })

  saveBtn.innerText = "Save";
  checkboxLabel.innerText = "Auto submit";

  formWrapper.appendChild(userName);
  formWrapper.appendChild(password);
  checkboxLabel.prepend(autoSubmit);
  formWrapper.appendChild(checkboxLabel)
  formWrapper.appendChild(saveBtn);

  root.appendChild(formWrapper)

  saveBtn.addEventListener("click", saveCredentials);
};

const saveCredentials = async () => {
  const userName = document.querySelector("#userName");
  const password = document.querySelector("#password");
  const autoSubmit = document.querySelector("#autoSubmit")

  if (userName.value.trim() && password.value.trim()) {
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id, {
      type: "SAVE_CREDENTIALS",
      value: { 
        userName: userName.value.trim(), 
        password: password.value.trim(),
        autoSubmit: autoSubmit.checked
      },
    });
  }
};

const fillCredentials = async () => {
  const userName = document.querySelector("#userName");
  const password = document.querySelector("#password");
  const autoSubmit = document.querySelector("#autoSubmit")

  chrome.storage.sync.get(["credentials"], (data) => {
    const parsed = data["credentials"] ? JSON.parse(data["credentials"]) : null;
    userName.value = parsed?.userName || "";
    password.value = parsed?.password || "";
    autoSubmit.checked = !!parsed?.autoSubmit
  });
};

document.addEventListener("DOMContentLoaded", () => {
  root = document.querySelector("#root");
  root.innerHTML = "";

  setCredentialsForm();
  fillCredentials();
});
