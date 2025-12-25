export default function permission(allowedRoles = []) {
  return (ctx, next) => {
    const user = ctx.db.users[ctx.from.id];
    if (!user || !allowedRoles.includes(user.telegram.role)) {
      return ctx.reply("❌ Kamu tidak memiliki izin menggunakan command ini.");
    }
    return next();
  };
}