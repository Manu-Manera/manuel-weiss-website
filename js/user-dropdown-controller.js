/**
 * User-Dropdown – nur per Klick öffnen, Klick ins Leere / Escape schließt.
 * Auth-Systeme dürfen Inhalte aktualisieren, aber nicht automatisch öffnen.
 */
(function () {
  'use strict';

  var instances = [];

  function UserDropdownInstance(opts) {
    this.button = opts.button;
    this.dropdown = opts.dropdown;
    this.open = false;
    this._onButtonClick = this._onButtonClick.bind(this);
    this._onDocumentClick = this._onDocumentClick.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this.button.addEventListener('click', this._onButtonClick);
    document.addEventListener('click', this._onDocumentClick);
    document.addEventListener('keydown', this._onKeyDown);
  }

  UserDropdownInstance.prototype._setOpen = function (open) {
    this.open = !!open;
    if (this.dropdown) {
      this.dropdown.style.display = this.open ? 'block' : 'none';
      this.dropdown.setAttribute('aria-hidden', this.open ? 'false' : 'true');
    }
  };

  UserDropdownInstance.prototype._onButtonClick = function (e) {
    if (!this.button.classList.contains('logged-in')) return;
    e.preventDefault();
    e.stopPropagation();
    this._setOpen(!this.open);
  };

  UserDropdownInstance.prototype._onDocumentClick = function (e) {
    if (!e.isTrusted || !this.open) return;
    if (this.button.contains(e.target) || this.dropdown.contains(e.target)) return;
    this._setOpen(false);
  };

  UserDropdownInstance.prototype._onKeyDown = function (e) {
    if (e.key === 'Escape' && this.open) this._setOpen(false);
  };

  UserDropdownInstance.prototype.close = function () {
    this._setOpen(false);
  };

  function initPair(buttonId, dropdownId) {
    var button = document.getElementById(buttonId);
    var dropdown = document.getElementById(dropdownId);
    if (!button || !dropdown || button.dataset.dropdownBound === '1') return null;
    button.dataset.dropdownBound = '1';
    dropdown.style.display = 'none';
    dropdown.setAttribute('aria-hidden', 'true');
    var inst = new UserDropdownInstance({ button: button, dropdown: dropdown });
    instances.push(inst);
    return inst;
  }

  function initStandard() {
    initPair('authButton', 'userDropdown');
  }

  function closeAll() {
    instances.forEach(function (inst) { inst.close(); });
    document.querySelectorAll('.user-dropdown, .user-menu, .nav-user-menu, #userDropdown').forEach(function (el) {
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
    });
  }

  window.UserDropdownController = {
    init: initStandard,
    initPair: initPair,
    closeAll: closeAll
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStandard);
  } else {
    initStandard();
  }
})();
