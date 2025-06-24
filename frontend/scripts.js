// frontend/scripts.js

function toggleMobileMenu() {
  const menu = document.getElementById('menu');
  const toggle = document.querySelector('.mobile-toggle');
  const expanded = toggle.getAttribute('aria-expanded') === 'true';

  toggle.setAttribute('aria-expanded', !expanded);
  menu.classList.toggle('active');
}
// === Hide Header on Scroll ===
let lastScrollTop = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

  if (currentScroll > lastScrollTop && currentScroll > 100) {
    // Scrolling down
    header.classList.add("hide");
  } else {
    // Scrolling up
    header.classList.remove("hide");
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});


document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("chatbot-container");
  const toggleBtn  = document.getElementById("chatbot-toggle");
  const widget     = document.getElementById("chatbot-widget");
  const closeBtn   = document.getElementById("chatbot-close");
  const messages   = document.getElementById("chatbot-messages");
  const form       = document.getElementById("chatbot-form");
  const input      = document.getElementById("chatbot-input");
  const sendBtn    = document.getElementById("chatbot-send");

  const API_BASE = "http://127.0.0.1:8000";
  let sse = null;

  function openChat() {
    container.classList.add("expanded");
    toggleBtn.setAttribute("aria-expanded", "true");
    widget.style.display = "flex";
    input.focus();
  }

  function closeChat() {
    container.classList.remove("expanded");
    toggleBtn.setAttribute("aria-expanded", "false");
    widget.style.display = "none";
    if (sse) sse.close();
    sse = null;
    sendBtn.disabled = false;
  }

  toggleBtn.addEventListener("click", () =>
    container.classList.contains("expanded") ? closeChat() : openChat()
  );
  closeBtn.addEventListener("click", closeChat);

  form.addEventListener("submit", e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    openChat();

    // user message
    const userDiv = document.createElement("div");
    userDiv.className = "message user";
    userDiv.textContent = text;
    messages.appendChild(userDiv);
    messages.scrollTop = messages.scrollHeight;
    input.value = "";

    // bot placeholder
    const botDiv = document.createElement("div");
    botDiv.className = "message bot";
    messages.appendChild(botDiv);
    messages.scrollTop = messages.scrollHeight;

    sendBtn.disabled = true;

    sse = new EventSource(
      `${API_BASE}/chat/stream?message=${encodeURIComponent(text)}`
    );

    sse.onmessage = evt => {
      let data;
      try { data = JSON.parse(evt.data); } catch { return; }

      if (data.reply) {
        botDiv.textContent += data.reply;
        messages.scrollTop = messages.scrollHeight;
      }
    };

    // custom end event
    sse.addEventListener("end", () => {
      sendBtn.disabled = false;
      sse.close();
      sse = null;
    });

    sse.onerror = () => {
      botDiv.textContent += "\n[Connection error]";
      messages.scrollTop = messages.scrollHeight;
      if (sse) sse.close();
      sse = null;
      sendBtn.disabled = false;
    };
  });

  window.addEventListener("beforeunload", () => {
    if (sse) sse.close();
  });
});

	// DOM Content Loaded
	window.addEventListener("DOMContentLoaded", () => {
  	// Update footer year and datetime
  	const dtEl = document.getElementById("currentDateTime");
  	const yrEl = document.getElementById("year");
  	function updateDateTime() {
    	const now = new Date();
    	if (dtEl) dtEl.textContent = now.toLocaleString();
    	if (yrEl) yrEl.textContent = now.getFullYear();
  	}
  	updateDateTime();
  	setInterval(updateDateTime, 60000);

   // Contact Form via EmailJS
  const contactForm = document.getElementById("js-contact-form");
  const statusDiv   = document.getElementById("contact-status");
  if (contactForm && statusDiv) {
    contactForm.addEventListener("submit", async e => {
      e.preventDefault();
      const btn = contactForm.querySelector("button[type='submit']");
      btn.disabled = true;
      statusDiv.textContent = 'Sending…';
      statusDiv.className = '';

      const params = Object.fromEntries(new FormData(contactForm).entries());

      try {
        // Validation
        if (!params.user_name || !params.user_email || !params.subject || !params.message) {
          throw new Error("All fields are required.");
        }

        // 1) Send to site owner - include both user_email and email for template compatibility
        await emailjs.send("service_saxdc56", "template_ezh0s0d", {
          user_name:  params.user_name,
          user_email: params.user_email,
          email:      params.user_email,        // fallback
          subject:    params.subject,
          message:    params.message
        });

        statusDiv.textContent = '✅ Sent successfully!';
        statusDiv.classList.add('success');
        contactForm.reset();
      } catch (err) {
        console.error('EmailJS error:', err);
        if (err.status) console.error('Status:', err.status);
        if (err.text)   console.error('Response:', err.text);
        statusDiv.textContent = '❌ Failed to send. Check logs.';
        statusDiv.classList.add('error');
      } finally {
        btn.disabled = false;
        setTimeout(() => { statusDiv.textContent = ''; statusDiv.className = ''; }, 7000);
      }
    });
  }
});