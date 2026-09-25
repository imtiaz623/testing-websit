/* ==========================================================================
   FreshDrop -- Account dashboard interactivity
   Self-contained: does not depend on script.js internals.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const toastContainer = document.getElementById("toastContainer");

  function showToast(message, type) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast" + (type === "error" ? " error" : "");
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("show"); });
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.remove(); }, 300);
    }, 3200);
  }

  /* ---------- Sidebar panel switching ---------- */
  const navItems = document.querySelectorAll(".dashboard-nav-item[data-panel]");
  const panels = document.querySelectorAll(".dashboard-panel[data-panel]");

  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      const target = item.getAttribute("data-panel");

      navItems.forEach(function (i) { i.classList.remove("active"); });
      item.classList.add("active");

      panels.forEach(function (panel) {
        panel.classList.toggle("active", panel.getAttribute("data-panel") === target);
      });
    });
  });

  /* ---------- Profile form ---------- */
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", function (e) {
      e.preventDefault();
      showToast("Profile updated successfully.", "success");
    });
  }

  /* ---------- Password form ---------- */
  const passwordForm = document.getElementById("passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const field = document.getElementById("newPassword");
      if (field.value && field.value.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        return;
      }
      showToast("Password updated successfully.", "success");
      passwordForm.reset();
    });
  }

  /* ---------- Mini order tracking ---------- */
  const dashboardTrackingForm = document.getElementById("dashboardTrackingForm");
  const dashboardTrackingId = document.getElementById("dashboardTrackingId");
  const dashboardTrackingResult = document.getElementById("dashboardTrackingResult");
  const dashboardTrackingOrderId = document.getElementById("dashboardTrackingOrderId");
  const dashboardTrackingStatusText = document.getElementById("dashboardTrackingStatusText");
  const dashboardTimelineSteps = document.querySelectorAll("#dashboardTimeline .timeline-step");

  const orderStore = {
    "FD-1001": { status: "out-for-delivery" },
    "FD-2045": { status: "delivered" },
    "FD-1877": { status: "delivered" }
  };

  const statusOrder = ["placed", "preparing", "out-for-delivery", "delivered"];
  const statusMessages = {
    placed: "Order received -- preparing to pick your items.",
    preparing: "Your basket is being hand-picked and packed cold.",
    "out-for-delivery": "Your driver is on the way!",
    delivered: "Delivered -- enjoy your fresh groceries!"
  };

  function deterministicStatusFromId(id) {
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return statusOrder[sum % statusOrder.length];
  }

  function renderDashboardTimeline(status) {
    const statusIndex = statusOrder.indexOf(status);
    dashboardTimelineSteps.forEach(function (step) {
      const stepIndex = statusOrder.indexOf(step.getAttribute("data-status"));
      step.classList.remove("done", "current");
      if (stepIndex < statusIndex) step.classList.add("done");
      if (stepIndex === statusIndex) step.classList.add("current");
    });
    dashboardTrackingStatusText.textContent = statusMessages[status];
  }

  if (dashboardTrackingForm) {
    dashboardTrackingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const id = dashboardTrackingId.value.trim().toUpperCase();

      if (!id) {
        showToast("Enter an order ID to track your delivery.", "error");
        return;
      }

      let order = orderStore[id];
      if (!order) {
        if (!/^FD-\d{3,5}$/.test(id)) {
          showToast("We couldn't find an order with that ID.", "error");
          dashboardTrackingResult.hidden = true;
          return;
        }
        order = { status: deterministicStatusFromId(id) };
      }

      dashboardTrackingOrderId.textContent = id;
      renderDashboardTimeline(order.status);
      dashboardTrackingResult.hidden = false;
    });
  }

  /* ---------- Logout ---------- */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      showToast("Logged out successfully.", "success");
      setTimeout(function () { window.location.href = "index.html"; }, 700);
    });
  }
});
