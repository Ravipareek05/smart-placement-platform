export default function admin(req, res, next) {
  if (req.role !== "ADMIN") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}