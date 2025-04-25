// guild-settings.js

window.addEventListener("DOMContentLoaded", async () => {
  const guildId = window.location.pathname.split("/").pop();
  const guildNameElem = document.getElementById("guildName");
  const form = document.getElementById("settingsForm");

  try {
    const res = await fetch(`/api/guilds/${guildId}/settings`);
    const data = await res.json();

    guildNameElem.textContent = `Settings for Guild ID: ${guildId}`; // Can be updated with actual name from backend

    form.prefix.value = data.prefix || '!';
    form.welcomeMessage.value = data.welcomeMessage || '';
    form.autorole.value = data.autorole || '';
    form.modLogChannel.value = data.modLogChannel || '';
    form.autoModeration.value = data.autoModeration || 'off';

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const settings = {
        prefix: form.prefix.value,
        welcomeMessage: form.welcomeMessage.value,
        autorole: form.autorole.value,
        modLogChannel: form.modLogChannel.value,
        autoModeration: form.autoModeration.value
      };

      const updateRes = await fetch(`/api/guilds/${guildId}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      const result = await updateRes.json();
      alert("Settings updated successfully!");
    });

  } catch (err) {
    guildNameElem.textContent = "Failed to load guild settings.";
    console.error("Error:", err);
  }
});
