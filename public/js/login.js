$(function () {
    //check if already logged in, to prevent needing to re-sign in everytime
  const existing = localStorage.getItem("chat_user");
  if (existing) window.location.href = "/view/chat.html";

  $("#loginForm").on("submit", async function (e) {
    e.preventDefault();

    const payload = {
      username: $("#username").val().trim(),
      password: $("#password").val()
    };

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        showMsg(data.message || "Login failed", "danger");
        return;
      }

      localStorage.setItem("chat_user", JSON.stringify(data.user));

      showMsg("Login successful! Redirecting...", "success");
      setTimeout(() => (window.location.href = "/view/chat.html"), 500);
    } catch (err) {
      showMsg("Network/server error", "danger");
    }
  });

  //sucess or failure message when logging in
  function showMsg(text, type) {
    $("#msg")
      .removeClass("d-none alert-success alert-danger")
      .addClass(`alert-${type}`)
      .text(text);
  }
});
