
/* global $ */

var oldPasswordElem = $("#oldPassword");
var newPasswordElem = $("#newPassword");
var confirmNewPasswordElem = $("#confirmNewPassword");


function flagOldPassword() {
  if (oldPasswordElem.val() === "") {
    oldPasswordElem.addClass("border border-danger");
  } else {
    oldPasswordElem.removeClass("border border-danger");
  }
}

function flagNewPasswords() {
  if (newPasswordElem.val() === "" || confirmNewPasswordElem.val() === "" || newPasswordElem.val() !== confirmNewPasswordElem.val()) {
    newPasswordElem.addClass("border border-danger");
    confirmNewPasswordElem.addClass("border border-danger");
  } else {
    newPasswordElem.removeClass("border border-danger");
    confirmNewPasswordElem.removeClass("border border-danger");
  }
}

function validatePasswords() {
  if (oldPasswordElem.val() === "" && newPasswordElem.val() === "" && confirmNewPasswordElem.val() === "") {
    return true;
  } else {
    if (oldPasswordElem.val() !== "" && newPasswordElem.val() !== "" && confirmNewPasswordElem.val() !== "" && newPasswordElem.val() === confirmNewPasswordElem.val()) {
      return true;
    } else {
      flagOldPassword();
      flagNewPasswords();
      return false;
    }
  }
}
