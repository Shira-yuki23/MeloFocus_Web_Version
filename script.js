let timerInterval = null;
let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let isRunning = false;
let isBreak = false;
let sessionCount = 1;
let endTime = null;

/* ===============================
   Elements
================================ */
const timerDisplay =document.getElementById("timer");
const startBtn =document.getElementById("startBtn");
const pauseBtn =document.getElementById("pauseBtn");
const resetBtn =document.getElementById("resetBtn");
const focusInput =document.getElementById("focusMinutes");
const breakInput =document.getElementById("breakMinutes");
const modeLabel =document.getElementById("modeLabel");
const sessionLabel =document.getElementById("sessionCount");
const progressCircle =document.getElementById("progressCircle");
const currentTime = document.getElementById("currentTime");
/* ===============================
   SVG Circle Setup
================================ */
const circleRadius = 110;
const circumference =
    2 * Math.PI * circleRadius;
progressCircle.style.strokeDasharray =
    circumference;
/* ===============================
   Update Timer Text
================================ */
function updateTimerDisplay(){
    let minutes =
        Math.floor(remainingSeconds / 60);
    let seconds =
        remainingSeconds % 60;
    timerDisplay.textContent =
        `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
}
/* ===============================
   Update Circle Progress
================================ */
function updateProgress(){
    let progress =
        remainingSeconds / totalSeconds;
    let offset =
        circumference -
        (progress * circumference);
    progressCircle.style.strokeDashoffset =
        offset;
}
/* ===============================
   Start Timer
================================ */
function startTimer() {

    if (isRunning)
        return;

    isRunning = true;

    // Calculate when the timer should finish
    endTime = Date.now() + (remainingSeconds * 1000);

    timerInterval = setInterval(() => {

        remainingSeconds = Math.max(
            0,
            Math.ceil((endTime - Date.now()) / 1000)
        );

        updateTimerDisplay();
        updateProgress();

        if (remainingSeconds <= 0) {

            stopTimer();

            timerFinished();

        }

    }, 250);

}
/* ===============================
   Pause Timer
================================ */
function pauseTimer() {

    clearInterval(timerInterval);

    isRunning = false;

    // Save the remaining time
    remainingSeconds = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
    );

}
/* ===============================
   Reset Timer
================================ */
function resetTimer() {

    stopTimer();

    if (isBreak) {

        totalSeconds =
            Number(breakInput.value) * 60;

    }

    else {

        totalSeconds =
            Number(focusInput.value) * 60;

    }

    remainingSeconds =
        totalSeconds;

    endTime = null;

    updateTimerDisplay();

    updateProgress();

}
/* ===============================
   Stop Timer Helper
================================ */
function stopTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

    isRunning = false;

    endTime = null;

}
/* ===============================
   Timer Finished
================================ */
function timerFinished(){
    if(!isBreak){
        sessionCount++;
        sessionLabel.textContent =
            "#" + sessionCount;

        showNotification(
            "🌸 MeloFocus",
            "Focus session complete! Time for a break."
        );

        showBreakPopup();
    }
    else{
        isBreak = false;
        modeLabel.textContent =
            "FOCUS MODE 🌸";
    
        showNotification(
            "☕ MeloFocus",
            "Break is over! Let's get back to focusing."
        );
        isBreak = false;
        modeLabel.textContent =
            "FOCUS MODE 🌸";

        resetTimer();
    }
}
/* ===============================
   Change Mode
================================ */
function changeToBreak(){
    isBreak = true;
    modeLabel.textContent =
        "BREAK MODE ☕";
    totalSeconds =
        Number(breakInput.value) * 60;
    remainingSeconds =
        totalSeconds;
    updateTimerDisplay();
    updateProgress();
}
/* ===============================
   Live Clock
================================ */
function updateClock(){
    let now =new Date();
    currentTime.textContent =now.toLocaleTimeString();
}
setInterval(updateClock,1000);
updateClock();
/* ===============================
   Button Events
================================ */
startBtn.addEventListener(
    "click",
    startTimer
);
pauseBtn.addEventListener(
    "click",
    pauseTimer
);
resetBtn.addEventListener(
    "click",
    resetTimer
);
/* ===============================
   Initial Load
================================ */
updateTimerDisplay();
updateProgress();


/* ===============================
   Task Variables
================================ */
let tasks = [];
let breakBankMinutes = 0;
let selectedTaskIndex = -1;
/* ===============================
   Task Elements
================================ */
const taskInput =
    document.getElementById("taskInput");
const rewardInput =
    document.getElementById("rewardInput");
const taskList =
    document.getElementById("taskList");
const addTaskBtn =
    document.getElementById("addTaskBtn");
const deleteTaskBtn =
    document.getElementById("deleteTaskBtn");
const breakBankDisplay =
    document.getElementById("breakBank");
/* ===============================
   Task Object
================================ */
class Task{
    constructor(name,reward){
        this.name = name;
        this.reward = reward;
        this.completed = false;
    }
}
/* ===============================
   Add Task
================================ */
function addTask(){
    let name =
        taskInput.value.trim();
    let reward =
        Number(rewardInput.value);
    if(name === "")
        return;
    if(isNaN(reward))
        reward = 0;
    let newTask =
        new Task(
            name,
            reward
        );
    tasks.push(newTask);
    saveData();
    renderTasks();
    taskInput.value = "";
    rewardInput.value = "";
}
/* ===============================
   Render Tasks
=============================== */
function renderTasks() {

    taskList.innerHTML = "";

    tasks.forEach((task, index) => {

        let li = document.createElement("li");

        li.className = "task-item";

        if (index === selectedTaskIndex) {
            li.classList.add("selected");
        }

        li.innerHTML = `
            <input
                type="checkbox"
                ${task.completed ? "checked" : ""}
            >

            <span class="task-name">
                ${task.name}
            </span>

            <span class="reward">
                +${task.reward} min
            </span>
        `;

        // Select task when clicked
        li.addEventListener("click", (e) => {

            if (e.target.tagName !== "INPUT") {

                selectedTaskIndex = index;

                renderTasks();

            }

        });

        let checkbox = li.querySelector("input");

        checkbox.addEventListener("change", () => {

            if (checkbox.checked && !task.completed) {

                task.completed = true;

                breakBankMinutes += task.reward;

            }

            else if (!checkbox.checked && task.completed) {

                task.completed = false;

                breakBankMinutes -= task.reward;

            }

            updateBreakBank();

            saveData();

        });

        taskList.appendChild(li);

    });

}
/* ===============================
   Delete Task
================================ */
function deleteTask() {

    if (selectedTaskIndex === -1)
        return;

    if (tasks[selectedTaskIndex].completed) {

        breakBankMinutes -=
            tasks[selectedTaskIndex].reward;

    }

    tasks.splice(selectedTaskIndex, 1);

    selectedTaskIndex = -1;

    updateBreakBank();

    saveData();

    renderTasks();

}
/* ===============================
   Update Break Bank
================================ */
function updateBreakBank(){
    if(breakBankMinutes < 0){
        breakBankDisplay.textContent =
            `${breakBankMinutes} min ⚠`;
        breakBankDisplay.style.color =
            "red";
    }
    else{
        breakBankDisplay.textContent =
            `${breakBankMinutes} min`;
        breakBankDisplay.style.color =
            "#333";
    }
}
/* ===============================
   Local Storage
================================ */
function saveData(){
    localStorage.setItem(
        "melofocusTasks",
        JSON.stringify(tasks)
    );
    localStorage.setItem(
        "melofocusBreakBank",
        breakBankMinutes
    );
}
/* ===============================
   Load Saved Data
================================ */
function loadData(){
    let savedTasks = localStorage.getItem( "melofocusTasks" );
    if(savedTasks){tasks =JSON.parse(savedTasks);}
    let savedBank =localStorage.getItem("melofocusBreakBank");
    if(savedBank){
        breakBankMinutes = Number(savedBank);
    }
    renderTasks();
    updateBreakBank();
}
/* ===============================
   Button Events
================================ */
addTaskBtn.addEventListener(
    "click",
    addTask
);
deleteTaskBtn.addEventListener(
    "click",
    deleteTask
);
/* ===============================
   Start Saved Data
================================ */
loadData();
/* ===============================
   Popup Elements
================================ */
const popupOverlay = document.getElementById("popupOverlay");
const redeemOverlay = document.getElementById("redeemOverlay");
const takeBreakBtn =document.getElementById("takeBreak");
const skipBreakBtn = document.getElementById("skipBreak");
const redeemBtn =document.getElementById("redeemBtn");
const confirmRedeemBtn = document.getElementById("confirmRedeem");
const cancelRedeemBtn =document.getElementById("cancelRedeem");
const redeemMinutesInput =document.getElementById("redeemMinutes");
/* ===============================
   Show Break Decision Popup
================================ */
function showBreakPopup(){
    popupOverlay.classList.remove("hidden");
}
/* ===============================
   Take Normal Break
================================ */
takeBreakBtn.addEventListener(
    "click",
    () => {

        popupOverlay.classList.add("hidden");

        let minutes = Number(
            prompt("How many minutes would you like your break to be?")
        );

        if (isNaN(minutes) || minutes <= 0) {
            return;
        }

        isBreak = true;

        modeLabel.textContent =
            "BREAK MODE ☕";

        totalSeconds = minutes * 60;

        remainingSeconds = totalSeconds;

        updateTimerDisplay();

        updateProgress();

        startTimer();

    }
);
/* ===============================
   Skip Break
   Earn Break Minutes
================================ */
skipBreakBtn.addEventListener(
    "click",
    ()=>{
        popupOverlay.classList.add("hidden");
        let earned =Number(breakInput.value);
        breakBankMinutes += earned;
        updateBreakBank();
        saveData();
        isBreak = false;
        modeLabel.textContent ="FOCUS MODE 🌸";
        resetTimer();
    }
);
/* ===============================
   Open Redeem Popup
================================ */
redeemBtn.addEventListener(
    "click",
    ()=>{
        redeemOverlay.classList.remove("hidden");
    }
);
/* ===============================
   Cancel Redeem
================================ */
cancelRedeemBtn.addEventListener(
    "click",
    ()=>{
        redeemOverlay.classList.add("hidden");
    }
);

/* ===============================
   Redeem Break
================================ */
confirmRedeemBtn.addEventListener(
    "click",
    ()=>{
        let requested =Number(redeemMinutesInput.value);
        if(requested <= 0) return;
        breakBankMinutes -= requested;
        updateBreakBank();
        saveData();
        redeemOverlay.classList.add("hidden");
        isBreak = true;
        modeLabel.textContent = "BREAK MODE ☕";
        totalSeconds = requested * 60;
        remainingSeconds = totalSeconds;
        updateTimerDisplay();
        updateProgress();
        startTimer();
    }
);

/* ===============================
   Close Popups By Clicking Outside
================================ */
popupOverlay.addEventListener(
    "click",
    (e)=>{
        if(e.target === popupOverlay){
            popupOverlay.classList.add("hidden");
        }
    }
);
redeemOverlay.addEventListener(
    "click",
    (e)=>{
        if(e.target === redeemOverlay){
            redeemOverlay.classList.add("hidden");
        }
    }
);

/* ===============================
   Keyboard Shortcut
================================ */

document.addEventListener(
    "keydown",
    (e)=>{
        if(e.code === "Space"){
            e.preventDefault();
            if(isRunning){pauseTimer(); }
            else{startTimer();}
        }
    }
);
/* ===============================
   Notification Permission
================================ */

if ("Notification" in window) {

    if (Notification.permission !== "granted") {

        Notification.requestPermission();

    }

}
function showNotification(title, message) {

    if (!("Notification" in window))
        return;

    if (Notification.permission === "granted") {

        new Notification(title, {
            body: message,
            icon: "icon64.png" // Optional
        });

    }

}
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js");
    });
}
