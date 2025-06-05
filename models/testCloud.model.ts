import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

const TestCloud = sequelize.define(
  'TestCloud',
  {
    idtestCloud: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    testCloudimage: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
  },
  {
    tableName: 'testCloud',
    timestamps: false,
  }
);

export default TestCloud;
