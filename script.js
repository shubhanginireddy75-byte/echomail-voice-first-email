const synth = window.speechSynthesis;
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const data = {
  threads: [
    {
      title: "Q3 budget approval",
      sender: "Priya",
      summary: "Priya asks you to approve the Q3 budget by Friday.",
      badge: "Needs reply",
      badgeClass: "needs-reply"
    },
    {
      title: "Invoice from Sana & Co",
      sender: "Sana & Co",
      summary: "Invoice attachment: Rs 48,200, due 30 November.",
      badge: "Attachment",
      badgeClass: "attachment"
    },
    {
      title: "Team lunch Friday",
      sender: "Team",
      summary: "FYI: Team lunch is planned for Friday.",
      badge: "FYI",
      badgeClass: "fyi"
    }
  ],
  chapters: [
    ["1", "Kick-off", "Messages 1–6"],
    ["2", "Numbers disputed", "Messages 7–14"],
    ["3", "Decision asked", "Messages 15–24"]
  ]
};

let currentView = "briefingView";
let currentChapter = 0;
let speechTimer = null;
let speechPaused = false;
let dictatedText = "";
let headphonesOnly = false;
let recognition = null;

const $ = (id) => document.getElementById(id);

function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  $(id).classList.remove("hidden");
  currentView = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setStatus(message) {
  $("status").textContent = message;
}

function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2200);
}

function speak(text, options = {}) {
  if (!("speechSynthesis" in window)) {
    toast("Text-to-speech is not supported in this browser.");
    return;
  }
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 1;
  utterance.pitch = options.pitch || 1;
  utterance.onstart = () => setStatus("Playing: " + text);
  utterance.onend = () => setStatus("Ready. You can say “Next”, “Reply”, “Attachments”, or “Help”.");
  synth.speak(utterance);
}

function stopSpeech() {
  synth.cancel();
  setStatus("Audio stopped.");
}

function renderThreads() {
  $("threadList").innerHTML = data.threads.map((t, index) => `
    <article class="thread-card">
      <div>
        <h3>${t.title}</h3>
        <p>${t.summary}</p>
        <span class="badge ${t.badgeClass}">${t.badge}</span>
      </div>
      <button class="open-thread" data-index="${index}" aria-label="Open ${t.title}">Read</button>
    </article>
  `).join("");

  document.querySelectorAll(".open-thread").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = Number(btn.dataset.index);
      if (index === 1) {
        showView("threadView");
        toast("Invoice thread opened.");
      } else {
        showView("threadView");
      }
      speak(data.threads[index].summary);
    });
  });
}

function renderChapters() {
  $("chapterList").innerHTML = data.chapters.map((c, i) => `
    <button class="chapter" data-index="${i}">
      ${c[0]}. ${c[1]} (${c[2]})
    </button>
  `).join("");

  document.querySelectorAll(".chapter").forEach(btn => {
    btn.addEventListener("click", () => jumpToChapter(Number(btn.dataset.index)));
  });
}

function jumpToChapter(index) {
  currentChapter = index;
  const c = data.chapters[index];
  const messages = [
    "The thread starts with the Q3 budget discussion.",
    "Dev disagrees on cost and the numbers are disputed.",
    "Priya asks: Can you approve four lakh rupees by Friday? Confidence high."
  ];
  $("readingText").textContent = messages[index];
  speak(`Chapter ${c[0]}, ${c[1]}. ${messages[index]}`);
}

function readAttachment() {
  if (!headphonesOnly) {
    showView("privacyView");
    return;
  }
  speak("Invoice from Sana and Company. Two pages. Amount forty-eight thousand two hundred rupees. Due thirtieth November. Confidence high.");
}

function startReply() {
  if (!headphonesOnly) {
    $("privacyNotice").classList.remove("hidden");
  } else {
    $("privacyNotice").classList.add("hidden");
  }
  showView("replyView");
  speak("Reply mode. Hold the speak button and dictate your reply. I will read it back before sending.");
}

function beginRecognition() {
  if (!SpeechRecognition) {
    toast("Speech recognition is not supported. Type your reply using the keyboard or use the browser's accessibility tools.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
    setStatus("Listening...");
    $("holdSpeak").textContent = "Listening…";
    speak("Your turn.", { rate: 1.05 });
  };

  recognition.onresult = (event) => {
    dictatedText = event.results[0][0].transcript;
    $("dictationText").textContent = dictatedText;
    $("sendReply").disabled = false;
    setStatus("Read-back ready.");
    speak(`You said: ${dictatedText}. Send, edit or discard?`);
  };

  recognition.onerror = () => {
    setStatus("I could not hear you. Try again.");
    $("holdSpeak").textContent = "Hold to speak";
  };

  recognition.onend = () => {
    $("holdSpeak").textContent = "Hold to speak";
  };

  recognition.start();
}

function sendReply() {
  if (!dictatedText) return;
  $("sendReply").disabled = true;
  speak("Sent to Priya. Say undo within ten seconds.");
  toast("Reply sent. Undo is available for 10 seconds.");
  setTimeout(() => {
    setStatus("Reply sent.");
  }, 800);
}

function handleCommand(command) {
  const c = command.toLowerCase().trim();
  setStatus(`Command: ${c}`);

  if (c.includes("help")) {
    speak("You can say: Next, Back, Summary, Full text, Details, Chapters, Skip to the decision, Attachments, Reply, Stop, Pause, or Headphones only.");
  } else if (c.includes("where am i")) {
    const names = {
      briefingView: "Inbox briefing",
      threadView: "Q3 budget approval thread",
      attachmentView: "Invoice attachment",
      replyView: "Reply by voice",
      privacyView: "Privacy check"
    };
    speak(`You are in ${names[currentView]}.`);
  } else if (c === "next" || c.includes("next chapter")) {
    if (currentView === "threadView") jumpToChapter(Math.min(currentChapter + 1, data.chapters.length - 1));
    else speak("Opening the next thread.");
  } else if (c.includes("back")) {
    if (currentView === "threadView") showView("briefingView");
    else if (currentView !== "briefingView") showView("threadView");
  } else if (c.includes("summary")) {
    speak("Priya wants approval of four lakh rupees by Friday. Dev disagrees on cost. Confidence high.");
  } else if (c.includes("full text")) {
    speak("Priya writes: Please review the Q3 budget and confirm whether we can approve the four lakh rupee amount by Friday. Dev replies that the cost needs another review. Priya asks for a final decision.");
  } else if (c.includes("chapters") || c.includes("decision")) {
    showView("threadView");
    jumpToChapter(2);
  } else if (c.includes("attachment")) {
    showView("attachmentView");
    if (headphonesOnly) readAttachment();
    else speak("One attachment is available. Say Attachments to open it, or enable Headphones only for sensitive audio.");
  } else if (c.includes("reply")) {
    startReply();
  } else if (c.includes("stop") || c.includes("pause")) {
    stopSpeech();
  } else if (c.includes("headphones only")) {
    toggleHeadphones();
  } else {
    speak("I did not understand. Say Help to hear available commands.");
  }
}

function setupRecognition() {
  if (!SpeechRecognition) {
    $("micButton").title = "Speech recognition is not supported in this browser";
    return;
  }

  $("micButton").addEventListener("click", () => {
    const r = new SpeechRecognition();
    r.lang = "en-IN";
    r.interimResults = false;
    r.continuous = false;
    r.onstart = () => setStatus("Listening for a command...");
    r.onresult = e => handleCommand(e.results[0][0].transcript);
    r.onerror = () => setStatus("I could not understand the command. Say Help.");
    r.start();
  });
}

function toggleHeadphones() {
  headphonesOnly = !headphonesOnly;
  $("headphonesToggle").setAttribute("aria-pressed", String(headphonesOnly));
  $("headphonesToggle").textContent = `Headphones only: ${headphonesOnly ? "On" : "Off"}`;
  speak(headphonesOnly ? "Headphones only is on. Sensitive audio can be read." : "Headphones only is off. Sensitive audio will require confirmation.");
}

$("playBriefing").addEventListener("click", () => speak("Good morning. Three threads need you. Biggest: Priya asks you to approve the Q3 budget by Friday."));
$("pauseSpeech").addEventListener("click", () => synth.pause());
$("stopSpeech").addEventListener("click", stopSpeech);
$("backToInbox").addEventListener("click", () => showView("briefingView"));
$("attachmentsBtn").addEventListener("click", () => showView("attachmentView"));
$("backToThread").addEventListener("click", () => showView("threadView"));
$("replyBtn").addEventListener("click", startReply);
$("backFromReply").addEventListener("click", () => showView("threadView"));
$("readAttachment").addEventListener("click", readAttachment);
$("readTable").addEventListener("click", () => {
  if (!headphonesOnly) {
    showView("privacyView");
    return;
  }
  speak("Table row one: invoice amount, forty-eight thousand two hundred rupees. Row two: due date, thirtieth November.");
});
$("back10").addEventListener("click", () => speak("Replaying the previous ten seconds is simulated in this prototype."));
$("pauseThread").addEventListener("click", () => synth.pause());
$("nextChapter").addEventListener("click", () => jumpToChapter(Math.min(currentChapter + 1, data.chapters.length - 1)));
$("holdSpeak").addEventListener("click", beginRecognition);
$("sendReply").addEventListener("click", sendReply);
$("discardReply").addEventListener("click", () => {
  dictatedText = "";
  $("dictationText").textContent = "Nothing dictated yet.";
  $("sendReply").disabled = true;
  speak("Draft discarded.");
});
$("headphonesToggle").addEventListener("click", toggleHeadphones);

$("connectHeadphones").addEventListener("click", () => {
  headphonesOnly = true;
  $("headphonesToggle").setAttribute("aria-pressed", "true");
  $("headphonesToggle").textContent = "Headphones only: On";
  showView("attachmentView");
  speak("Headphones only is enabled. Sensitive audio is now protected.");
});
$("hearSender").addEventListener("click", () => {
  showView("attachmentView");
  speak("The attachment was sent by Sana and Company via Priya Menon.");
});
$("notNow").addEventListener("click", () => showView("threadView"));

$("darkToggle").addEventListener("click", () => document.body.classList.toggle("dark"));
$("contrastToggle").addEventListener("click", () => document.body.classList.toggle("high-contrast"));

$("textDecrease").addEventListener("click", () => {
  const current = parseInt(getComputedStyle(document.documentElement).fontSize);
  document.documentElement.style.setProperty("--font-size", `${Math.max(16, current - 2)}px`);
});
$("textIncrease").addEventListener("click", () => {
  const current = parseInt(getComputedStyle(document.documentElement).fontSize);
  document.documentElement.style.setProperty("--font-size", `${Math.min(28, current + 2)}px`);
});

renderThreads();
renderChapters();
setupRecognition();
speak("EchoMail ready. Three threads need you today.");
