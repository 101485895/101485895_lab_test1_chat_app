$(function () {
  $("#signupForm").on("submit", async function (e) {
    e.preventDefault();

    const payload = {
      username: $("#username").val().trim(),
      firstname: $("#firstname").val().trim(),
      lastname: $("#lastname").val().trim(),
      password: $("#password").val()
    };

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        showMsg(data.message || "Signup failed", "danger");
        return;
      }

      showMsg("Signup successful! Redirecting to login...", "success");
      setTimeout(() => (window.location.href = "/view/login.html"), 700);
    } catch (err) {
      showMsg("Network/server error", "danger");
    }
  });

  function showMsg(text, type) {
    $("#msg")
      .removeClass("d-none alert-success alert-danger")
      .addClass(`alert-${type}`)
      .text(text);
  }
});
