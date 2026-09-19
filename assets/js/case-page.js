import { PROJECTS } from "./projects.js";
import { asset, page } from "./root.js";

const id = document.body.dataset.project;
const project = PROJECTS.find((item) => item.id === id);

function fill() {
  if (!project) return;

  document.title = `${project.title} — LUMEN`;
  const title = document.querySelector("[data-c-title]");
  const info = document.querySelector("[data-c-info]");
  const type = document.querySelector("[data-c-type]");
  const loc = document.querySelector("[data-c-loc]");
  const year = document.querySelector("[data-c-year]");
  const area = document.querySelector("[data-c-area]");
  const photos = document.querySelector("[data-c-photos]");
  const brief = document.querySelector("[data-c-brief]");
  const approach = document.querySelector("[data-c-approach]");
  const result = document.querySelector("[data-c-result]");
  const materials = document.querySelector("[data-c-materials]");
  const rooms = document.querySelector("[data-c-rooms]");

  if (title) title.textContent = project.title;
  if (info) info.textContent = project.lead;
  if (type) type.textContent = project.type;
  if (loc) loc.textContent = project.loc;
  if (year) year.textContent = project.year;
  if (area) area.textContent = project.area;
  if (brief) brief.textContent = project.brief;
  if (approach) approach.textContent = project.approach;
  if (result) result.textContent = project.result;
  if (photos) {
    photos.innerHTML = project.images
      .map((src) => `<img src="${asset(src)}" alt="${project.title}" />`)
      .join("");
  }
  if (materials) {
    materials.innerHTML = project.materials.map((item) => `<li>${item}</li>`).join("");
  }
  if (rooms) {
    rooms.innerHTML = project.rooms.map((item) => `<li>${item}</li>`).join("");
  }

  const next = PROJECTS[(PROJECTS.findIndex((item) => item.id === id) + 1) % PROJECTS.length];
  const nextLink = document.querySelector("[data-c-next]");
  if (next && nextLink) {
    nextLink.href = page(`work/${next.id}.html`);
    nextLink.textContent = `Next — ${next.title}`;
  }
}

fill();
