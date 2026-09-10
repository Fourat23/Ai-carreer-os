export function authStatus(ctx) {
  if (!ctx.authenticated) return 401;
  if (!ctx.exists) return 404;
  if (!ctx.authorized) return 403;
  return 200;
}
