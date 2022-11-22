const data = {};

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

// https://regex101.com/library/YnB0aB
const isValidId = (val) => {
  let genderInd = parseInt(val[0]);

  if (![1, 2, 3, 4, 5, 6].includes(genderInd) || val.length !== 11)
    return false;

  return true;
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

const validateId = (field) => {
  const val = field.value.trim();

  if (val === "" && field.required) {
    return {
      isValid: false,
    };
  } else if (val !== "" && !isValidId(val)) {
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

  if (val === "" && field.required) {
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
  const choices = fieldset.querySelectorAll(
    'input[type="radio"], input[type="checkbox"]'
  );

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
      message: "Please make a selection.",
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
  if (field.classList.contains("ssn")) return validateId(field);
  console.log(field.classList.contains("ssn"));
  switch (field.type) {
    case "text":
    case "textarea":
      return validateText(field);
    case "select-one":
      return validateSelect(field);
    case "number":
      return validateText(field);
    case "fieldset":
      return validateText(field);
    case "radio":
    case "checkbox":
      return validateChoice(field);
    case "tel":
      return validatePhone(field);
    case "email":
      return validateEmail(field);
    case "date":
      return validateDate(field);
    default:
      throw new Error(
        `The provided field type '${field.tagName}:${field.type}' is not supported in this form.`
      );
  }
};

function reportError(field, message = "Užpildykite šį lauką") {
  let error = document.getElementById(`${field.id}`).parentElement.children[2]; //we're assuming error msg span goes after label, hence it has id of 1
  error.textContent = `${message}`;
  return false; // invalid
}

function reportSuccess(field, fields) {
  if (field.classList.contains("invalid")) {
    let error = document.getElementById(`${field.id}`).parentElement
      .children[2];
    error.textContent = "";
    field.classList.remove("invalid");
  }

  if (field.id === "user-ssn") {
    fields["lytis"] = getUserGender(field.value);
    fields["brithdate"] = getUserBirthDate(field.value);
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

  return true; // valid
}

function reportValidity(field, fields) {
  const validation = getValidationData(field, fields);
  if (!validation.isValid && validation.message) {
    return reportError(field, validation.message);
  } else if (!validation.isValid) {
    return reportError(field);
  } else {
    return reportSuccess(field, fields);
  }
}

// ============== PERSONAL ID DATA RETRIEVAL ==============
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

var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
  if (n == 8) {
    return;
  }
  document.getElementById("nextBtn").style.display = "inline";
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("data-group");
  x[n].style.display = "flex";
  // ... and fix the Previous/Next buttons:
  document.getElementById("nextBtn").type = "button";
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  console.log(currentTab);
  if (n == 7) {
    document.getElementById("nextBtn").type = "submit";
    document.getElementById("nextBtn").style.display = "none";
  } else if (n == 6) {
    document.getElementById("nextBtn").innerHTML = "Submit";
    fixStepIndicator(n);
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
    fixStepIndicator(n);
  }
  // ... and run a function that displays the correct step indicator:
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("data-group");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    //...the form gets submitted:
    document.getElementById("regForm").submit();
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function validateForm() {
  // This function deals with validation of the form fields
  var x,
    y,
    i,
    valid = true;
  x = document.getElementsByClassName("data-group");
  y = x[currentTab].querySelectorAll("input, SELECT, textarea");

  // A loop that checks every input field in the current tab:
  let fields = {};

  for (i = 0; i < y.length; i++) {
    // If a field is empty...
    if (!reportValidity(y[i], fields)) {
      // add an "invalid" class to the field:
      y[i].className += " invalid";
      // and set the current valid status to false:
      valid = false;
    }
  }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    data[sections[currentTab]] = fields;
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i,
    x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class to the current step:
  x[n].className += " active";
}

// ============== OPTIONAL FIELDS (EDUCATION & WORK) ==============

let formDetails = {};

function showEducationFields() {
  if (document.getElementById("user-education-data"))
    document.getElementById("user-education-data").remove();

  var educationSection = document.createElement("div");
  educationSection.id = `user-education-data`;
  educationSection.classList.add("hidden-wrapper");

  educationSection.innerHTML = `
      <div class="input-group">
        <div class="input-wrapper">
          <label for="degree-type" class="req-input"
            >Studijų pakopa</label
          >
          <select
            name="Studijų pakopa"
            aria-labelledby="degree-type"
            id="degree-type"
            type="text"
            class="data-input"
            required
          >
            <option value="primary">Bakalaurantūra</option>
            <option value="secondary">Magistrantūra</option>
            <option value="professional">Meno aspirantūra</option>
            <option value="higher">Rezidentūra</option>
            <option value="highest">Doktorantūra</option>
          </select>
          <span class="error-message"></span>
        </div>
        <div class="input-wrapper">
          <label for="course" class="req-input">Kursas</label>
          <input name="Kursas" id="course" type="number" class="data-input" required />
          <span class="error-message"></span>
        </div>
      </div>
      <div class="input-group">
        <div class="input-wrapper">
          <label for="uni-name">Mokslo įstaiga</label>
          <input name="Mokslo įstaiga" id="uni-name" type="text" class="data-input" required />
          <span class="error-message"></span>
        </div>
        <div class="input-wrapper">
          <label for="uni-qualification" class="req-input">Kvalifikacija</label>
          <input name="Kvalifikacija" id="uni-qualification" type="text" class="data-input" required />
          <span class="error-message"></span>
        </div>
      </div>
      <div class="input-group">
        <div class="input-wrapper">
          <label for="education-start-year" class="req-input">Pradžios metai</label>
          <input name="Pradžios metai" id="education-start-year" type="date" class="data-input" required />
          <span class="error-message"></span>
        </div>
        <div class="input-wrapper">
          <label for="education-end-year" class="req-input"
            >Užbaigimo metai</label
          >
          <input name="Užbaigimo metai" id="education-end-year" type="date" class="data-input" required />
          <span class="error-message"></span>
        </div>
      </div>
  `;
  //append _div to button
  document
    .getElementById("optional-uni-section")
    .parentElement.appendChild(educationSection);
}
function hideEducationFields() {
  document.getElementById("user-education-data").remove();
}

function showWorkFields() {
  if (document.getElementById("user-work-experience"))
    document.getElementById("user-work-experience").remove();

  document.getElementById("unemployment-reasons").style.display = "none";

  var div = document.createElement("div");
  div.id = `user-work-experience`;
  div.classList.add("hidden-wrapper");
  div.innerHTML = `
  <div class="input-group">
  <div class="input-wrapper">
  <label for="business-name" class="req-input">Darbo įstaiga</label>
  <input name="Kvalifikacija" id="business-name" type="text" class="data-input" required />
  <span class="error-message"></span>
  </div>
  <div class="input-wrapper">
    <label for="work-experience" class="req-input">Darbo patirtis</label>
    <select
      name="Darbo patirtis"
      id="work-experience"
      aria-labelledby="degree-type"
      type="text"
      class="data-input"
      required
    >
      <option value="primary">0-2 metai</option>
      <option value="secondary">2-5 metai</option>
      <option value="professional">5-7 metai</option>
      <option value="higher">7-9 metai</option>
      <option value="highest">9+ metai</option>
    </select>
  </div>
</div>

<div class="input-group">
  <div class="input-wrapper">
    <label for="job-type">Darbo pobūdis</label>
    <select
      name="Darbo pobūdis"
      id="job-type"
      type="text"
      class="data-input"
      required
    >
      <option value="primary">Vadovas</option>
      <option value="secondary">Specialistas</option>
      <option value="professional">Individuali veikla</option>
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
      <option value="primary">Teisė</option>
      <option value="secondary">Viešasis sektorius</option>
      <option value="professional">Sveikatos apsauga</option>
      <option value="primary">Farmacija</option>
      <option value="secondary">Pramonė / Gamyba</option>
      <option value="professional">IT</option>
      <option value="primary">Prekyba</option>
      <option value="secondary">Krašto apsauga</option>
      <option value="professional">Vidaus reikalų sistema</option>
      <option value="primary">Klientų aptarnavimas ir paslaugos</option>
      <option value="secondary">Transportas</option>
      <option value="professional">Kultūra ir pramogos</option>
      <option value="professional">Švietimas / Studijos</option>
    </select>
    <span class="error-message"></span>
  </div>
</div>
<div class="input-wrapper">
  <label for="job-responsibilities" class="req-input">Darbo pareigos</label>
  <textarea name="Darbo pareigos" id="job-responsibilities" required></textarea>
  <span class="error-message"></span>
</div>
  `;
  //append _div to button
  document
    .getElementById("optional-work-section")
    .parentElement.appendChild(div);
}
function hideWorkFields() {
  document.getElementById("user-work-experience").remove();
  document.getElementById("unemployment-reasons").style.display = "block";
}

let kidsNum = 1;

const appendKid = () => {
  if (kidsNum === 1) {
    document.getElementById("remove-kid").style.display = "block";
    heading = document.createElement("h3");
    heading.id = "kids-heading";
    heading.innerHTML = `Vaikai`;
    document.getElementById("maritial-status").appendChild(heading);
  }

  var div = document.createElement("div");
  div.id = `kid-${kidsNum}`;
  console.log(kidsNum);
  div.innerHTML = `
  <div class="input-group hidden-entry">
  <div class="input-wrapper">
    <label for=kid${kidsNum}-first-name class="req-input">Vardas</label>
    <input name="${kidsNum}) vaiko vardas" id=kid${kidsNum}-first-name type="text" class="data-input" required />
    <span class="error-message"></span>
  </div>
  <div class="input-wrapper">
    <label for=kid${kidsNum}-last-name class="req-input">Pavardė</label>
    <input name="${kidsNum}) vaiko pavardė" id=kid${kidsNum}-last-name type="text" class="data-input" required />
    <span class="error-message"></span>
  </div>
</div>`;
  //append _div to button
  document.getElementById("maritial-status").appendChild(div);

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

function setUserGender(userGender) {
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
}

function getPartner() {
  let statusSelect = document.getElementById("marstatus");
  var selectedMarStatus =
    statusSelect.options[statusSelect.selectedIndex].value;

  if (selectedMarStatus === "vedęs" || selectedMarStatus === "ištekėjusi") {
    var div = document.createElement("div");
    div.id = "partner-details";
    div.innerHTML = `
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
    document.getElementById("maritial-status").appendChild(div);
  } else if (document.getElementById("partner-details")) {
    document.getElementById("partner-details").remove();
  }
}

// ============== HANDLE FORM SUBMIT ==============

function handleSubmit(event) {
  event.preventDefault();

  document.getElementById("json").textContent = JSON.stringify(
    data,
    undefined,
    2
  );

  console.log(data);
}

const form = document.querySelector("form");
form.addEventListener("submit", handleSubmit);
