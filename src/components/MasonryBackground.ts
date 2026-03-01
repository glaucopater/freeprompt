const PICSUM_BASE = "https://picsum.photos";
const ITEMS_PER_COL = 8;

function getImageUrl(seed: number, h: number): string {
  return `${PICSUM_BASE}/seed/${seed}/400/${h}`;
}

function isMobile(): boolean {
  return typeof window !== "undefined" && window.innerWidth < 768;
}

export function initMasonryBackground(): void {
  const container = document.getElementById("masonry-bg");
  if (!container) return;

  const cols = isMobile() ? 3 : 5;
  const columns = Array.from({ length: cols }, (_, colIdx) =>
    Array.from({ length: ITEMS_PER_COL }, (_, rowIdx) => {
      const seed = colIdx * 100 + rowIdx;
      const h = 200 + ((seed * 37) % 200);
      return { id: `${colIdx}-${rowIdx}`, url: getImageUrl(seed, h), height: h };
    })
  );

  const columnsEl = document.createElement("div");
  columnsEl.className = "masonry-bg-columns";

  columns.forEach((col, colIdx) => {
    const colEl = document.createElement("div");
    colEl.className = "masonry-bg-col";

    const trackEl = document.createElement("div");
    trackEl.className = "masonry-bg-track";
    trackEl.style.animationDuration = `${600 + colIdx * 75}s`;

    [...col, ...col].forEach((item) => {
      const itemEl = document.createElement("div");
      itemEl.className = "masonry-bg-item";
      itemEl.style.height = `${item.height}px`;

      const img = document.createElement("img");
      img.src = item.url;
      img.alt = "";
      img.loading = "lazy";

      itemEl.appendChild(img);
      trackEl.appendChild(itemEl);
    });

    colEl.appendChild(trackEl);
    columnsEl.appendChild(colEl);
  });

  container.appendChild(columnsEl);
}
