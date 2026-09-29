function toggleSidebar() {
  let sidebar = document.getElementById("sidebar");

  let content = document.getElementById("main-content");

  let showBtn = document.getElementById("show-sidebar-btn");

  sidebar.classList.toggle("hide");

  content.classList.toggle("full");

  if (sidebar.classList.contains("hide")) {
    showBtn.style.display = "block";
  } else {
    showBtn.style.display = "none";
  }
}

