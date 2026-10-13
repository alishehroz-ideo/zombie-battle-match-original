// Reassemble the unchanged Unity data bytes from hosting-sized chunks.
(() => {
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, options) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!String(url).split('?')[0].endsWith('/webgl-build.data.unityweb'))
      return originalFetch(input, options);
    const base = new URL(url, location.href);
    const parts = [];
    for (let i = 0; i < 29; i++) {
      const response = await originalFetch(new URL(`game-data-${i}.bin?v=${base.searchParams.get("v") || ""}`, base), options);
      if (!response.ok) throw new Error(`Game data download failed (${response.status})`);
      parts.push(await response.arrayBuffer());
    }
    const body = new Blob(parts, {type: 'application/octet-stream'});
    const response = new Response(body, {headers: {'Content-Length': String(body.size), 'Content-Type': 'application/octet-stream'}});
    Object.defineProperty(response, 'url', {value: base.href});
    return response;
  };
})();
