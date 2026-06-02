// Cyanth - a simple angular blog
// author: Celvra
// licensed under MIT License
// https://github.com/Celvra/Cyanth/blob/master/LICENSE
//
export async function onRequest({ request }: { request: Request }): Promise<Response> {
  const url = new URL(request.url);
  const target = `https://api.fuchenboke.cn${url.pathname.replace(/^\/wallpaper-api/, '')}${url.search}`;
  return fetch(target, { redirect: 'follow' });
}
