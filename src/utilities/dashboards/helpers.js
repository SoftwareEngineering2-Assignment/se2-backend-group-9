module.exports = async (foundDashboard, res, next) => {
  /**
   * @name sendEmail
   * @description Is used to send an email to a user
   */
  if (!foundDashboard) {
    return res.json({
      status: 409,
      message: 'The specified dashboard has not been found.'
    });
  }

  const dashboard = {};
  dashboard.name = foundDashboard.name;
  dashboard.layout = foundDashboard.layout;
  dashboard.items = foundDashboard.items;

  if (userId && foundDashboard.owner.equals(userId)) {
    foundDashboard.views += 1;
    await foundDashboard.save();

    return res.json({
      success: true,
      owner: 'self',
      shared: foundDashboard.shared,
      hasPassword: foundDashboard.password !== null,
      dashboard
    });
  }
  if (!(foundDashboard.shared)) {
    return res.json({
      success: true,
      owner: '',
      shared: false
    });
  }
  if (foundDashboard.password === null) {
    foundDashboard.views += 1;
    await foundDashboard.save();

    return res.json({
      success: true,
      owner: foundDashboard.owner,
      shared: true,
      passwordNeeded: false,
      dashboard
    });
  }
  return res.json({
    success: true,
    owner: '',
    shared: true,
    passwordNeeded: true
  });
};