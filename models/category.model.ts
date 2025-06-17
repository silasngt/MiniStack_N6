import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Category = sequelize.define(
  'Category',
  {
    CategoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: DataTypes.STRING(255),
    Type: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const raw = this.getDataValue('Type');
        return raw ? JSON.parse(raw) : [];
      },
      set(val: string[] | string) {
        this.setDataValue('Type', JSON.stringify(val));
      },
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    tableName: 'Category',
    timestamps: false,
  }
);

export default Category;
