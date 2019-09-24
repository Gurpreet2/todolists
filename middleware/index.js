
module.exports = {
  isLoggedIn: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      return res.redirect("/login");
    }
  }
};
