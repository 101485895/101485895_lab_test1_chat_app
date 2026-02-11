const socket = io();

const user = JSON.parse(localStorage.getItem("chat_user"));
if (!user) window.location.href = "/view/login.html";

$("#whoami").text(`Logged in as: ${user.username}`);

let currentRoom = null;
let typingTimer = null;

function setChatEnabled(enabled) {
    $("#msgInput").prop("disabled", !enabled);
    $("#sendBtn").prop("disabled", !enabled);
    $("#leaveBtn").prop("disabled", !enabled);
}

$("#logoutBtn").click(() => {
    localStorage.removeItem("chat_user");
    window.location.href = "/view/login.html";
});

$("#joinBtn").click(() => {
    const room = $("#roomSelect").val();

    if (currentRoom) socket.emit("leaveRoom", currentRoom);

    currentRoom = room;
    $("#currentRoom").text(currentRoom);
    $("#chatBox").html("");
    $("#typing").text("");

    socket.emit("joinRoom", { room, username: user.username });
    setChatEnabled(true);
});

$("#leaveBtn").click(() => {
    if (!currentRoom) return;
    socket.emit("leaveRoom", currentRoom);
    currentRoom = null;
    $("#currentRoom").text("none");
    $("#typing").text("");
    setChatEnabled(false);
});

$("#sendBtn").click(sendMessage);
$("#msgInput").on("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

function sendMessage() {
    const msg = $("#msgInput").val().trim();
    if (!msg || !currentRoom) return;

    socket.emit("groupMessage", {
        room: currentRoom,
        from_user: user.username,
        message: msg
    });
  $("#msgInput").val("");
}

socket.on("groupMessage", (data) => {
    $("#chatBox").append(
        `<div><strong>${data.from_user}:</strong> ${escapeHtml(data.message)}</div>`
    );
    $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
});

socket.on("roomHistory", (msgs) => {
    $("#chatBox").html("");
    msgs.forEach(m => {
        $("#chatBox").append(`<div><strong>${m.from_user}:</strong> ${escapeHtml(m.message)}</div>`);
    });
    $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
});

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[m]));
}
