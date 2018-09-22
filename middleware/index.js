
module.exports = {
  isLoggedIn: function(req, res, next) {
    if (req.isAuthenticated()) {
      if (req.session.tokenAuthenticated) {
        return next();
      } else {
        return res.redirect("/login/token");
      }
    } else {
      return res.redirect("/login");
    }
  }
};
