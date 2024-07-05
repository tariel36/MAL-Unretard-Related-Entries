// ==UserScript==
// @name         MAL - Unretard Related Entries
// @description  Reverts retarded changes from 2024-05-24 to related entries back to the sane list.
// @version      1.0.1
// @author       tariel36
// @grant        GM_setValue
// @grant        GM_getValue
// @namespace    https://github.com/tariel36/MAL-Unretard-Related-Entries
// @match        https://myanimelist.net/*
// @updateURL    https://raw.githubusercontent.com/tariel36/MAL-Unretard-Related-Entries/master/MAL-Unretard-Related-Entries.user.js
// @downloadURL  https://raw.githubusercontent.com/tariel36/MAL-Unretard-Related-Entries/master/MAL-Unretard-Related-Entries.user.js
// @license      MIT
// ==/UserScript==

function unretard() {
  // Variables etc,
  const orderingArray = [
    "Adaptation",
    "Prequel",
    "Sequel",
    "Summary",
    "Parent Story",
    "Side Story",
    "Alternative Version",
    "Alternative Setting",
    "Spin-Off",
    "Other",
    "Character"
  ];

  // Unfold
  Array.from(document.getElementsByClassName("hide-entry")).forEach((el) =>
    el.removeAttribute("style")
  );

  // Get aggregated entries from retarded area
  const retardedEntries = Array.from(document.getElementsByClassName("entry"))
    .map((entry) => ({
      entry,
      key: entry
        .querySelector(".content")
        ?.querySelector(".relation")
        ?.innerText?.trim()
        ?.split("(")
        .find(() => true)
        ?.trim(),
    }))
    .filter((x) => !!x.key)
    .reduce((prev, curr) => {
      if (!prev[curr.key]) {
        prev[curr.key] = [];
      }
      prev[curr.key].push(curr.entry);
      return prev;
    }, {});

  // Get table's parent
  const relatedEntriesContainer = document.querySelector(".related-entries");

  // Get table
  const table =
    [...relatedEntriesContainer.getElementsByClassName("entries-table")]
      .find((x) => true)
      ?.querySelector("tbody") ??
    (() => {
      const table = document.createElement("table");
      table.className = "entries-table";

      const tbody = document.createElement("tbody");

      // Append the tbody to the table
      table.appendChild(tbody);
      relatedEntriesContainer.appendChild(table);

      return tbody;
    })();

  // Get all sections headers
  const existingSections = [
    ...([...document.getElementsByClassName("entries-table")]
      .find((x) => true)
      ?.querySelector("tbody")
      ?.querySelectorAll("td") ?? []),
  ].filter((x) => !!x && x.classList.contains("ar"));

  // Add entries
  Object.keys(retardedEntries).forEach((y) => {
    const entriesCollection = retardedEntries[y];
    const key = y;

    const section =
      existingSections.find((z) =>
        (z.innerText ?? "").toUpperCase().includes(key.toUpperCase())
      ) ??
      (() => {
        const row = document.createElement("tr");

        const cell1 = document.createElement("td");
        cell1.textContent = ` ${key}: `;
        cell1.setAttribute("valign", "top");
        cell1.className = "ar fw-n borderClass nowrap";

        const cell2 = document.createElement("td");
        cell2.setAttribute("width", "100%");
        cell2.className = "borderClass";

        const ul = document.createElement("ul");
        ul.className = "entries";
        cell2.appendChild(ul);

        row.appendChild(cell1);
        row.appendChild(cell2);
        table.appendChild(row);

        return cell1;
      })();

    entriesCollection.forEach((z) => {
      const relationTypeRaw = (
        (z.querySelector(".relation").innerText.split("(") ?? []).at(-1) ?? ""
      ).trim();
      const actualRelationType = relationTypeRaw ? ` (${relationTypeRaw}` : "";

      const list = section.nextElementSibling.querySelector("ul");

      const li = document.createElement("li");
      const a = z.querySelector(".title").querySelector("a");
      a.innerText = (a.innerText ?? "").trim();

      li.appendChild(a);
      li.appendChild(document.createTextNode(` ${actualRelationType}`));

      list.appendChild(li);
    });
  });

  // Remove useless nodes
  document.querySelector(".entries-tile")?.remove();
  document.querySelector(".related-entries > div:first-of-type")?.remove();

  // Sort related entries in sane order
  const sortedArray = [
    ...([...document.getElementsByClassName("entries-table")]
      .find((x) => true)
      ?.querySelector("tbody")
      ?.querySelectorAll("td") ?? []),
  ]
    .filter((x) => !!x && x.classList.contains("ar"))
    .map((x) => ({
      child: x,
      parent: x.parentNode,
      key: x.innerText.trim().slice(0, -1),
    }))
    .sort(
      (a, b) => orderingArray.indexOf(a.key) - orderingArray.indexOf(b.key)
    );

  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }

  sortedArray.forEach((x) => {
    table.appendChild(x.parent);
  });
}

unretard();
