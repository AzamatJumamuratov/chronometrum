"use strict"

fullResizeDocument();
window.addEventListener('resize', fullResizeDocument);

let timer_before = document.getElementById('timer_before');
let timer_after = document.getElementById('timer_after');
timer_after.style.display = 'none';


let hours_input = document.getElementById('hours_input');
let minutes_input = document.getElementById('minutes_input');
let seconds_input = document.getElementById('seconds_input');

const userAgent = navigator.userAgent;
let isMobile = /mobile/i.test(userAgent);


hours_input.onchange = function (event) {
  this.value = FormatNumberToString00(clampValues(+this.value, 99));
}

minutes_input.onchange = function (event) {
  this.value = FormatNumberToString00(clampValues(+this.value, 59));
}

seconds_input.onchange = function (event) {
  this.value = FormatNumberToString00(clampValues(+this.value, 59));
}

if (!isMobile) {

  hours_input.oninput = function (event) {
    this.value = FormatNumberToString00(clampValues(+this.value, 99));
  }

  minutes_input.oninput = function (event) {
    this.value = FormatNumberToString00(clampValues(+this.value, 59));
  }

  seconds_input.oninput = function (event) {
    this.value = FormatNumberToString00(clampValues(+this.value, 59));
  }
}

let key = 'templates';
let maxTemplates = 5;
let storageString = localStorage.getItem(key);
let arrayOfTemplates = [];
if (storageString) {
  storageString = storageString.slice(1, storageString.length - 1);
  arrayOfTemplates = storageString.split(',');
}
arrayOfTemplates = arrayOfTemplates.map(value => Number(value));
let templatesSet = new Set(arrayOfTemplates);

if (templatesSet.size != 0) {
  for (let elem of templatesSet) {
    let time = new GetTimeObjectFromValue(elem);
    let iterableArray = [];
    iterableArray.push(time.hours);
    iterableArray.push(time.minutes);
    iterableArray.push(time.seconds);
    AddNewTemplate(iterableArray);
  }
}




let newTemplateButton = document.getElementById('new');

let newtemplateInputs = document.querySelectorAll('.new_input_holder input');


for (let input of newtemplateInputs) {
  input.onchange = function (event) {
    this.value = FormatNumberToString00(clampValues(+this.value, this.dataset.maxvalue));
  }

  if(!isMobile){
    input.oninput = function (event) {
      this.value = FormatNumberToString00(clampValues(+this.value, this.dataset.maxvalue));
    }
  }
}


newTemplateButton.onclick = function (event) {

  newTemplateButton.style.display = 'none';
  let newTamplate = newTemplateButton.nextElementSibling;
  newTamplate.style.display = 'flex';
}


let saveButton = document.getElementById('save');

saveButton.onclick = function (event) {
  if (templatesSet.size == maxTemplates) return;

  let time = GetTimeFromHMS(newtemplateInputs[0].value, newtemplateInputs[1].value, newtemplateInputs[2].value);
  if (time == 0 || templatesSet.has(time)) return;
  AddNewTemplate(newtemplateInputs);
  templatesSet.add(time);
  newTemplateButton.style.display = 'block';
  let newTamplate = newTemplateButton.nextElementSibling;
  newTamplate.style.display = 'none';
}

let StopNewTemplateButton = document.getElementById('stop_new_template');

StopNewTemplateButton.onclick = function (event) {
  newTemplateButton.style.display = 'block';
  let newTamplate = newTemplateButton.nextElementSibling;
  newTamplate.style.display = 'none';
}

let timer;

let PlayButton = document.getElementById('play');

PlayButton.onclick = function (event) {
  let time = GetTimeFromHMS(hours_input.value, minutes_input.value, seconds_input.value);
  if (time == 0) return;

  timer = time;

  StartTimer(timer);
}

let PauseButton = document.getElementById('pause');

PauseButton.onclick = function (event) {
  PauseStartTimer();
}


let StopButton = document.getElementById('stop');



let hoursSpan = document.getElementById('hours_value');
let minutesSpan = document.getElementById('minutes_value');
let secondsSpan = document.getElementById('seconds_value');





StopButton.onclick = function (event) {
  let time = new GetTimeObjectFromValue(timer);

  hours_input.value = FormatNumberToString00(clampValues(time.hours, 99));
  minutes_input.value = FormatNumberToString00(clampValues(time.minutes, 59));
  seconds_input.value = FormatNumberToString00(clampValues(time.seconds, 59));
  StopTimerMode();
}


let intervalId;
let paused = false;

let blinkIntervalId;
let blink = false;

function StartTimer(time) {
  console.clear();
  console.log('starting timer with time :' + time);

  timer_before.style.display = 'none';
  timer_after.style.display = '';

  UpdateVisualTimer(time);

  intervalId = setInterval(UpdateTimer, 1000);
}

function StopTimerMode() {
  console.log('stoppingTimer');
  clearInterval(intervalId);
  intervalId = null;
  paused = false;
  timer = null;
  let img = PauseButton.querySelector('img');
  img.src = "./chronometrum/sources/icons/pause_icon.svg";
  timer_before.style.display = '';
  timer_after.style.display = 'none';
}

function PauseStartTimer() {
  paused = !paused;
  if (paused) console.log("Pausing Timer..");
  else console.log('Playing Timer...');
  if (paused) clearInterval(intervalId);
  else intervalId = setInterval(UpdateTimer, 1000);
  let img = PauseButton.querySelector('img');
  img.src = (paused) ? "./chronometrum/sources/icons/play_icon.svg" : "./chronometrum/sources/icons/pause_icon.svg";
}


function UpdateTimer() {
  if (timer == 0) {
    alert('time is over!');
    console.log('ending timer...');
    if (!isPageInFocus)
      blinkIntervalId = setInterval(blinkTitle, 1000);
    StopTimerMode();
  } else {
    timer--;
    console.log(timer);
  }

  UpdateVisualTimer(timer);
}


let isPageInFocus;

function UpdateVisualTimer(timer_val) {

  let time = new GetTimeObjectFromValue(timer_val);

  hoursSpan.innerHTML = FormatNumberToString00(time.hours);
  minutesSpan.innerHTML = FormatNumberToString00(time.minutes);
  secondsSpan.innerHTML = FormatNumberToString00(time.seconds);

  if (!isPageInFocus)
    document.title = hoursSpan.innerHTML + ":" + minutesSpan.innerHTML + ":" + secondsSpan.innerHTML;
}


function AddNewTemplate(iterableValues) {
  let newItem = document.createElement('div');
  newItem.className = 'item output_container';
  let newDataDiv = document.createElement('div');
  newDataDiv.className = 'data';
  for (let input of iterableValues) {
    let newSpan = document.createElement('span');
    newSpan.className = 'output_value';
    let value = (input.value) ? input.value : FormatNumberToString00(input);
    newSpan.innerHTML = value;
    newDataDiv.append(newSpan);
  }
  newDataDiv.firstElementChild.after(CreateElementWithHTML('span', ':', 'divider'));
  newDataDiv.lastElementChild.before(CreateElementWithHTML('span', ':', 'divider'));

  newItem.append(newDataDiv);

  let newDeleteButton = document.createElement('button');
  newDeleteButton.className = 'functional_btn';
  newDeleteButton.id = 'delete';
  let newDeleteButtonImg = document.createElement('img');
  newDeleteButtonImg.src = "./chronometrum/sources/icons/delete_icon.svg";
  newDeleteButton.append(newDeleteButtonImg);

  newItem.append(newDeleteButton);

  let dataFromItem = newDataDiv.querySelectorAll('span.output_value');

  newDataDiv.onclick = function () {
    hours_input.value = dataFromItem[0].textContent;
    minutes_input.value = dataFromItem[1].textContent;
    seconds_input.value = dataFromItem[2].textContent;
  }

  newDeleteButton.onclick = function () {
    let time = GetTimeFromHMS(dataFromItem[0].textContent, dataFromItem[1].textContent, dataFromItem[2].textContent);
    templatesSet.delete(time);
    newItem.remove();
    UpdateSavedContentHeight();
  }


  document.querySelector('.saved_items').append(newItem);
  UpdateSavedContentHeight();
}

window.addEventListener('focus', function () {
  document.title = 'chronometrum!';
  isPageInFocus = true;
  clearInterval(blinkIntervalId);
});

window.addEventListener('blur', function () {
  isPageInFocus = false;
});


function fullResizeDocument() {
  document.body.style.height = document.documentElement.clientHeight + 'px';

  UpdateSavedContentHeight();
}

function blinkTitle() {
  blink = !blink;
  document.title = (blink) ? "Chronometrum!" : 'Waqit Tamam';
}

function GetTimeObjectFromValue(value) {
  this.hours = Math.floor(value / 3600);
  this.minutes = Math.floor((value - this.hours * 3600) / 60);
  this.seconds = value - this.hours * 3600 - this.minutes * 60;
}

function GetTimeFromHMS(h, m, s) {
  return h * 3600 + m * 60 + +s;
}



function clampValues(value, max) {
  if (isNaN(value)) return 0;
  if (value > max) value = max;
  return value;
}

function FormatNumberToString00(value) {
  return (value < 10) ? '0' + value : value.toString();
}

function UpdateSavedContentHeight() {
  let saved = document.querySelector('.timer_before .saved_container .saved');
  let gap = parseInt(getComputedStyle(saved).gap);

  let childsFullheight = 0;
  for (let child of saved.children) {
    childsFullheight += child.offsetHeight;
    childsFullheight += gap;
  }


  if (childsFullheight > saved.offsetHeight && document.documentElement.scrollWidth > 700) {
    saved.children[0].style.flexDirection = 'row';
  } else {
    saved.children[0].style.flexDirection = 'column';
  }
}



function CreateElementWithHTML(tag, html, className) {
  let elem = document.createElement(tag);
  elem.innerHTML = html;
  if (className != undefined) elem.className = className;
  return elem;
}


window.onunload = function (event) {
  if (templatesSet.size != 0) {
    let Json = JSON.stringify(Array.from(templatesSet));
    localStorage.setItem(key, Json);
  } else {
    localStorage.clear();
  }
}


let functionalBtnWithImg = document.querySelectorAll('button.functional_btn img');
for (let elems of functionalBtnWithImg) {
  elems.addEventListener('dragstart', (event) => event.preventDefault());
}
