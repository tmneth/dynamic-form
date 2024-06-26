const data = {};
let kidsNum = 1;

sections = [
  "Bendra informacija",
  "Adresas",
  "Šeimyninė padėtis",
  "Išsilavinimas",
  "Aukštasis išsilavinimas",
  "Profesinė padėtis",
  "Nuorodos",
];

// ============== VALIDATION FOR SPECIFIC FIELDS ==============

const isValid = (field) => {
  return getValidationData(field).isValid;
};

const isValidPhone = (val) => {
  const regex = new RegExp(/^(86|\+3706)[0-9]{7}$/);
  return regex.test(val);
};

const isValidEmail = (val) => {
  const regex = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  return regex.test(val);
};

const isValidSsn = (val) => {
  const regex = new RegExp(
    /^[12345]\d{2}(1[012]|0[123456789])(3[01]|[012][123456789])\d{4}$/
  );
  return regex.test(val);
};

// ============== VALIDATION FUNCTIONS ==============

const validateEmail = (field) => {
  const val = field.value.trim();

  if (val === "" && field.required) {
    return {
      isValid: false,
    };
  } else if (val !== "" && !isValidEmail(val)) {
    return {
      isValid: false,
      message: "Įveskite tinkamą el. adresą",
    };
  } else {
    return {
      isValid: true,
    };
  }
};

const validateSsn = (field) => {
  const val = field.value.trim();

  if (val === "" && field.required) {
    return {
      isValid: false,
    };
  } else if (val !== "" && !isValidSsn(val)) {
    return {
      isValid: false,
      message: "Įveskite tinkamą asmens kodą",
    };
  } else {
    return {
      isValid: true,
    };
  }
};

const validateText = (field) => {
  const val = field.value.trim();

  if (val === "" && field.required) {
    return {
      isValid: false,
    };
  } else {
    return {
      isValid: true,
    };
  }
};

const validatePhone = (field) => {
  const val = field.value.trim();

  if (val === "" && field.required) {
    return {
      isValid: false,
    };
  } else if (val !== "" && !isValidPhone(val)) {
    return {
      isValid: false,
      message: "Įveskite tinkamą telefono numerį",
    };
  } else {
    return {
      isValid: true,
    };
  }
};

const validateSelect = (field) => {
  const val = field.value.trim();

  if (val === "" && field.required) {
    return {
      isValid: false,
      message: "Pasirinkite tinkamą variantą",
    };
  } else {
    return {
      isValid: true,
    };
  }
};

const validateDate = (field) => {
  const val = field.value.trim();

  var parts = field.value.split("-");
  var month = parseInt(parts[1], 10);
  var year = parseInt(parts[0], 10);

  var maxDateParts = field.max.split("-");
  var maxYear = parseInt(maxDateParts[0], 10);

  var minDateParts = field.min.split("-");
  var minYear = parseInt(minDateParts[0], 10);

  if (
    (val === "" && field.required) ||
    year < minYear ||
    year > maxYear ||
    month == 0 ||
    month > 12
  ) {
    return {
      isValid: false,
      message: "Pasirinkite tinkamą datą",
    };
  } else {
    return {
      isValid: true,
    };
  }
};

const validateGroup = (fieldset) => {
  const choices = fieldset.querySelectorAll('input[type="radio"]');

  let isRequired = false,
    isChecked = false;

  for (const choice of choices) {
    if (choice.required) {
      isRequired = true;
    }

    if (choice.checked) {
      isChecked = true;
    }
  }

  if (!isChecked && isRequired) {
    return {
      isValid: false,
    };
  } else {
    return {
      isValid: true,
    };
  }
};

const validateChoice = (field) => {
  return validateGroup(field.closest("fieldset"));
};

const getValidationData = (field) => {
  if (field.classList.contains("ssn")) return validateSsn(field);
  switch (field.type) {
    case "text":
    case "textarea":
    case "fieldset":
    case "number":
      return validateText(field);
    case "select-one":
      return validateSelect(field);
    case "radio":
      return validateChoice(field);
    case "tel":
      return validatePhone(field);
    case "email":
      return validateEmail(field);
    case "date":
      return validateDate(field);
    default:
      throw new Error(`The field type is not supported.`);
  }
};

const reportError = (field, message = "Užpildykite šį lauką") => {
  let error = document.getElementById(`${field.id}`).parentElement.children[2];
  error.textContent = `${message}`;
  return false;
};

const reportSuccess = (field, fields) => {
  if (field.classList.contains("invalid")) {
    let error = document.getElementById(`${field.id}`).parentElement
      .children[2];
    error.textContent = "";
    field.classList.remove("invalid");
  }

  if (field.id === "user-ssn") {
    fields["Lytis"] = getUserGender(field.value);
    fields["Gimimo data"] = getUserBirthDate(field.value);
  }

  if (field.type === "select-one") {
    fields[field.name] = field.options[field.selectedIndex].text;
  } else if (field.type === "radio") {
    if (field.checked) {
      fields[field.name] = field.value;
    }
  } else {
    fields[field.name] = field.value;
  }

  return true;
};

const reportValidity = (field, fields) => {
  const validation = getValidationData(field, fields);
  if (!validation.isValid && validation.message) {
    return reportError(field, validation.message);
  } else if (!validation.isValid) {
    return reportError(field);
  } else {
    return reportSuccess(field, fields);
  }
};

// ============== SOCIAL SECURITY NUMBER DATA RETRIEVAL ==============

const getUserGender = (userID) => {
  let genderInd = parseInt(userID[0]);
  let userGender = "";

  if ([1, 3, 5].includes(genderInd)) userGender = "vyras";
  else if ([2, 4, 6].includes(genderInd)) userGender = "moteris";

  setUserGender(userGender);

  return userGender;
};

const getUserBirthDate = (userID) => {
  let genderInd = parseInt(userID[0]);

  let year = userID.slice(1, 3);
  let month = userID.slice(3, 5);
  let day = userID.slice(5, 7);

  if ([1, 2].includes(genderInd)) year = 18 + year;
  else if ([3, 4].includes(genderInd)) year = 19 + year;
  else if ([4, 5].includes(genderInd)) year = 20 + year;

  return year + "-" + month + "-" + day;
};

// ============== MULTISTEP FORM IMPLEMENTATION ==============

let currentTab = 0;
showTab(currentTab);

function showTab(n) {
  let formSections = document.getElementsByClassName("data-group");
  if (n === formSections.length) return;
  formSections[n].style.display = "flex";

  if (n < formSections.length - 1) {
    document.getElementsByClassName("group-heading")[n].innerHTML = `
    <div class="group-num">${currentTab + 1}</div>  
    ${sections[currentTab]}
      `;
  }
  document.getElementById("nextBtn").style.display = "inline";
  document.getElementById("nextBtn").innerHTML = "Kitas";
  document.getElementById("nextBtn").type = "button";

  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }

  if (n == formSections.length - 1) {
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("nextBtn").type = "submit";
  } else if (n == formSections.length - 2) {
    document.getElementById("nextBtn").innerHTML = "Patvirtinti";
  }

  fixStepIndicator(n);
}

function nextPrev(n) {
  var x = document.getElementsByClassName("data-group");

  if (n == 1 && !validateForm()) return false;

  x[currentTab].style.display = "none";

  currentTab = currentTab + n;

  if (currentTab >= x.length) {
    document.getElementById("regForm").submit();
    return false;
  }

  showTab(currentTab);
}

function validateForm() {
  let x;
  let y;
  let i;
  let valid = true;
  let fields = {};

  x = document.getElementsByClassName("data-group");
  y = x[currentTab].querySelectorAll("input, SELECT, textarea");

  for (i = 0; i < y.length; i++) {
    if (!reportValidity(y[i], fields)) {
      y[i].className += " invalid";
      valid = false;
    }
  }
  if (valid) {
    data[sections[currentTab]] = fields;
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  if (valid && sections[currentTab] === "Šeimyninė padėtis") {
    data[sections[currentTab]]["Vaikų skaičius"] = kidsNum - 1;
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  var i,
    x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  if (x[n]) x[n].className += " active";
}

// ============== OPTIONAL FIELDS (EDUCATION & WORK) ==============

const showEducationFields = () => {
  if (document.getElementById("user-education-data"))
    document.getElementById("user-education-data").remove();

  var educationSection = document.createElement("div");
  educationSection.id = `user-education-data`;
  educationSection.classList.add("hidden-wrapper");

  educationSection.innerHTML = `
  <div class="input-group">
  <div class="input-wrapper">
    <label for="degree-type" class="req-input">Studijų pakopa</label>
    <select
      name="Studijų pakopa"
      id="degree-type"
      class="data-input"
      required
    >
      <option>Bakalaurantūra</option>
      <option>Magistrantūra</option>
      <option>Meno aspirantūra</option>
      <option>Rezidentūra</option>
      <option>Doktorantūra</option>
    </select>
    <span class="error-message"></span>
  </div>
  <div class="input-wrapper">
    <label for="course" class="req-input">Kursas</label>
    <input
      name="Kursas"
      id="course"
      type="number"
      class="data-input"
      required
    />
    <span class="error-message"></span>
  </div>
</div>
<div class="input-group">
  <div class="input-wrapper">
    <label for="uni-name">Mokslo įstaiga</label>
    <input
      name="Mokslo įstaiga"
      id="uni-name"
      type="text"
      class="data-input"
      required
    />
    <span class="error-message"></span>
  </div>
  <div class="input-wrapper">
    <label for="uni-qualification" class="req-input">Kvalifikacija</label>
    <input
      name="Kvalifikacija"
      id="uni-qualification"
      type="text"
      class="data-input"
      required
    />
    <span class="error-message"></span>
  </div>
</div>
<div class="input-group">
  <div class="input-wrapper">
    <label for="education-start-year" class="req-input"
      >Pradžios metai</label
    >
    <input
      min="1950-01-01"
      max="2022-12-31"
      name="Pradžios metai"
      id="education-start-year"
      type="date"
      class="data-input"
      required
    />
    <span class="error-message"></span>
  </div>
  <div class="input-wrapper">
    <label for="education-end-year" class="req-input"
      >Užbaigimo metai</label
    >
    <input
      min="1950-01-01"
      max="2027-12-31"
      name="Užbaigimo metai"
      id="education-end-year"
      type="date"
      class="data-input"
      required
    />
    <span class="error-message"></span>
  </div>
</div>
  `;
  document
    .getElementById("optional-uni-section")
    .parentElement.appendChild(educationSection);
};

const hideEducationFields = () => {
  if (document.getElementById("user-education-data"))
    document.getElementById("user-education-data").remove();
};

const mutateElement = (curId, newName, labelId) => {
  let element = document.getElementById(curId);
  element.name = newName;
  element.value = "";
  element.classList.remove("invalid");
  element.parentElement.children[2].textContent = "";
  document.getElementById(labelId).innerHTML = newName;
};

const showWorkFields = () => {
  if (document.getElementById("user-work-experience"))
    document.getElementById("user-work-experience").remove();

  mutateElement(
    "work-experience-textarea",
    "Darbo pareigos",
    "work-experience-label"
  );

  let userGender =
    data[sections[0]]["Lytis"] === "vyras" ? "Tėvystės" : "Motinystės";

  var workSection = document.createElement("div");
  workSection.id = `user-work-experience`;
  workSection.classList.add("hidden-wrapper");
  workSection.innerHTML = `
  <div class="input-group">
  <div class="input-wrapper">
    <label for="business-name" class="req-input">Darbo įstaiga</label>
    <input
      name="Kvalifikacija"
      id="business-name"
      type="text"
      class="data-input"
      required
    />
    <span class="error-message"></span>
  </div>
  <div class="input-wrapper">
    <label for="work-experience" class="req-input">Darbo patirtis</label>
    <select
      name="Darbo patirtis"
      id="work-experience"
      class="data-input"
      required
    >
      <option>0-2 metai</option>
      <option>2-5 metai</option>
      <option>5-7 metai</option>
      <option>7-9 metai</option>
      <option>9+ metai</option>
    </select>
  </div>
</div>
<div class="input-group">
  <div class="input-wrapper">
    <label for="job-type">Darbo pobūdis</label>
    <select
      name="Darbo pobūdis"
      id="job-type"
      class="data-input"
      required
    >
      <option>Vadovas</option>
      <option>Specialistas</option>
      <option>Individuali veikla</option>
    </select>
    <span class="error-message"></span>
  </div>
  <div class="input-wrapper">
    <label for="occupation-field" class="req-input">Darbo sritis</label>
    <select
      name="Darbo sritis"
      id="occupation-field"
      type="text"
      class="data-input"
      required
    >
      <option>Teisė</option>
      <option>Viešasis sektorius</option>
      <option>Sveikatos apsauga</option>
      <option>Farmacija</option>
      <option>Pramonė / Gamyba</option>
      <option>IT</option>
      <option>Prekyba</option>
      <option>Krašto apsauga</option>
      <option>Vidaus reikalų sistema</option>
      <option>Klientų aptarnavimas ir paslaugos</option>
      <option>Transportas</option>
      <option>Kultūra ir pramogos</option>
      <option>Švietimas / Studijos</option>
    </select>
    <span class="error-message"></span>
  </div>
</div>
<div class="input-group">
  <div class="input-wrapper">
    <label for="leave-start-date"
      >${userGender} atostogų pradžia</label
    >
    <input
      min="1950-01-01"
      max="2022-12-31"
      name="${userGender} atostogų pradžia"
      id="leave-start-date"
      type="date"
      class="data-input"
    />
    <span class="error-message"></span>
  </div>
  <div class="input-wrapper">
    <label for="leave-end-date">${userGender} atostogų pabaiga</label>
    <input
      min="1950-01-01"
      max="2027-12-31"
      name="${userGender} atostogų pabaiga"
      id="leave-end-date"
      type="date"
      class="data-input"
    />
    <span class="error-message"></span>
  </div>
  `;
  document
    .getElementById("optional-work-section")
    .parentElement.appendChild(workSection);
};
const hideWorkFields = () => {
  if (document.getElementById("user-work-experience"))
    document.getElementById("user-work-experience").remove();

  mutateElement(
    "work-experience-textarea",
    "Nedarbo priežastis",
    "work-experience-label"
  );
};

const appendKid = () => {
  if (kidsNum === 1) {
    document.getElementById("remove-kid").style.display = "block";
    heading = document.createElement("h3");
    heading.id = "kids-heading";
    heading.innerHTML = `Vaikai`;
    document.getElementById("maritial-status").appendChild(heading);
  }

  var kidInfoContainer = document.createElement("div");
  kidInfoContainer.id = `kid-${kidsNum}`;
  kidInfoContainer.innerHTML = `
  <div class="input-group hidden-entry">
  <div class="input-wrapper">
    <label for="kid${kidsNum}-first-name" class="req-input">Vardas</label>
    <input
      name="[${kidsNum}] vaiko vardas"
      id="kid${kidsNum}-first-name"
      type="text"
      class="data-input"
      required
    />
    <span class="error-message"></span>
  </div>
  <div class="input-wrapper">
    <label for="kid${kidsNum}-last-name" class="req-input">Pavardė</label>
    <input
      name="[${kidsNum}] vaiko pavardė"
      id="kid${kidsNum}-last-name"
      type="text"
      class="data-input"
      required
    />
    <span class="error-message"></span>
  </div>
</div>

`;

  document.getElementById("maritial-status").appendChild(kidInfoContainer);

  kidsNum++;
};

const removeKid = () => {
  document.getElementById(`kid-${kidsNum - 1}`).remove();
  kidsNum--;
  if (!(kidsNum - 1)) {
    document.getElementById("remove-kid").style.display = "none";
    document.getElementById("kids-heading").remove();
  }
};

const setUserGender = (userGender) => {
  let statusSelect = document.getElementById("marstatus");

  statusSelect.options[0] = new Option(
    `${userGender === "vyras" ? "Nevedęs" : "Netekėjusi"}`,
    `${userGender === "vyras" ? "nevedęs" : "netekėjusi"}`,
    true,
    false
  );
  statusSelect.options[1] = new Option(
    `${userGender === "vyras" ? "Vedęs" : "Ištekėjusi"}`,
    `${userGender === "vyras" ? "vedęs" : "ištekėjusi"}`,
    false,
    false
  );
  statusSelect.options[2] = new Option(
    `${userGender === "vyras" ? "Išsiskyręs" : "Išsiskyrusi"}`,
    `${userGender === "vyras" ? "išsiskyręs" : "išsiskyrusi"}`,
    false,
    false
  );
};

const getPartner = () => {
  if (document.getElementById("partner-details")) {
    document.getElementById("partner-details").remove();
  }

  let statusSelect = document.getElementById("marstatus");
  let selectedMarStatus =
    statusSelect.options[statusSelect.selectedIndex].value;

  if (selectedMarStatus === "vedęs" || selectedMarStatus === "ištekėjusi") {
    var partnerInfoSection = document.createElement("div");
    partnerInfoSection.id = "partner-details";
    partnerInfoSection.innerHTML = `
<div class="hidden-entry">
    <div class="input-wrapper">
    <label for="partner-ssn class="req-input">Partnerio asmens kodas</label>
    <input
      name="Partnerio asmens kodas"
      id="partner-ssn"
      type="number"
      class="data-input ssn"
      maxlength="11"
      required
    />
    <span class="error-message"></span>
  </div>
  <div class="input-group hidden-entry">
  <div class="input-wrapper">
    <label for="partner-first-name" class="req-input">Partnerio vardas</label>
    <input name="Partnerio vardas" id="partner-first-name" type="text" class="data-input" required />
    <span class="error-message"></span>
  </div>
  <div class="input-wrapper">
    <label for="partner-last-name" class="req-input">Partnerio pavardė</label>
    <input name="Partnerio pavardė"  id="partner-last-name" type="text" class="data-input" required />
    <span class="error-message"></span>
  </div>
</div>
</div>
`;
    document.getElementById("maritial-status").appendChild(partnerInfoSection);
  }
};

const getDegreeName = () => {
  let degreeLevel = document.getElementById("most-recent-degree-type");
  let selectedDegree = degreeLevel.options[degreeLevel.selectedIndex].value;

  if (selectedDegree === "doktorantura") {
    document.getElementById("phd-type").disabled = false;
  } else {
    document.getElementById("phd-type").disabled = true;
    document.getElementById("phd-type").value = "no-phd";
  }
};

const getPriorEducation = () => {
  if (document.getElementById("most-recent-degree")) {
    document.getElementById("most-recent-degree").remove();
  }

  let degreeLevel = document.getElementById("degree-level");
  let selectedDegree = degreeLevel.options[degreeLevel.selectedIndex].value;

  if (
    selectedDegree === "profesinis" ||
    selectedDegree === "kolegijinis" ||
    selectedDegree === "universitetinis"
  ) {
    var degreeLevelSection = document.createElement("div");
    degreeLevelSection.id = "most-recent-degree";
    degreeLevelSection.innerHTML = `
    <div class="input-group hidden-entry">
      <div class="input-wrapper">
        <label for="qualification" class="req-input">Kvalifikacija</label>
        <input
          name="Kvalifikacija"
          id="qualification"
          type="text"
          class="data-input"
          required
        />
        <span class="error-message"></span>
      </div>
    </div>
  
`;
    if (selectedDegree === "universitetinis") {
      degreeLevelSection.innerHTML += `
      <div class="input-group hidden-entry">
      <div class="input-wrapper">
        <label for="most-recent-degree-type" class="req-input"
          >Studijų pakopa</label
        >
        <select
          name="Studijų pakopa"
          id="most-recent-degree-type"
          class="data-input"
          onchange="getDegreeName();"
          required
        >
          <option value="bakalaurantura">Bakalaurantūra</option>
          <option value="magistrantura">Magistrantūra</option>
          <option value="meno-asp">Meno aspirantūra</option>
          <option value="rezidentura">Rezidentūra</option>
          <option value="doktorantura">Doktorantūra</option>
        </select>
        <span class="error-message"></span>
      </div>
      <div class="input-wrapper">
        <label for="phd-type">Mokslo laipsnis</label>
        <select
          name="Mokslo laipsnis"
          id="phd-type"
          class="data-input"
          disabled
        >
          <option value="no-phd">Nėra mokslo laipsnio</option>
          <option value="phd">Daktaras</option>
          <option value="habilitation">Habilituotas daktaras</option>
        </select>
        <span class="error-message"></span>
      </div>
    </div>    
      `;
    }
    document
      .getElementById("degree-finishing-date")
      .appendChild(degreeLevelSection);
  }
};

// ============== HANDLE FORM SUBMIT ==============

const handleSubmit = (event) => {
  event.preventDefault();

  document.getElementById("json").textContent = JSON.stringify(
    data,
    undefined,
    2
  );

  console.log(data);
};

const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);
