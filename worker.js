export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "nikiiman.com") {
      url.hostname = "www.nikiiman.com";
      url.protocol = "https:";
      return new Response(null, {
        status: 301,
        headers: {
          Location: url.toString(),
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
