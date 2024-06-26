module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
      task_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      task_description: {
        type: DataTypes.TEXT,
      },
      due_date: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.ENUM('pending', 'completed'),
        defaultValue: 'pending',
      },
    }, {
      timestamps: false // Disable the automatic addition of timestamp fields
    });
    return Task;
  };