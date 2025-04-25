// dashboard.js

window.addEventListener("DOMContentLoaded", async () => {
  const guildsContainer = document.getElementById("guilds");
  const template = document.getElementById("guild-card-template").content;

  try {
    const res = await fetch("/api/guilds");
    const guilds = await res.json();

    guilds.forEach(guild => {
      const card = template.cloneNode(true);
      card.querySelector(".guild-name").textContent = guild.name;
      card.querySelector(".settings-button").addEventListener("click", () => {
        window.location.href = `/guilds/${guild.id}`;
      });
      guildsContainer.appendChild(card);
    });
  } catch (err) {
    guildsContainer.innerHTML = `<p class='text-red-500'>Failed to load guilds. Please try again.</p>`;
    console.error("Error loading guilds:", err);
  }
});

