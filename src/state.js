class AppState {
  constructor() {
    this.isSearching = false;
    this.isAddingNewAchievement = false;
    this.editingAchievement = undefined;
    this.user = {
      id: undefined,
      fullName: undefined,
      group: undefined,
      faculty: undefined,
      isAdmin: false,
    };
    this.newAchievement = {
      name: undefined,
      date: undefined,
      doc: undefined,
    };
  }

  resetAppState() {
    this.isSearching = false;
    this.isAddingNewAchievement = false;
    this.editingAchievement = undefined;
    this.newAchievement = {
      name: undefined,
      date: undefined,
      doc: undefined,
    };
  }
  setUser(user) {
    this.user = user;
  }

  setNewAchievement(achievement) {
    this.newAchievement = achievement;
  }
}

module.exports = new AppState();
