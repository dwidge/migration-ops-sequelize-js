const { Sequelize } = require("sequelize");
const { assertColumns } = require("@dwidge/migration-ops-sequelize");

module.exports = assertColumns("Conditions", {
  id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    primaryKey: true,
  },
  createdAt: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  deletedAt: {
    type: DataTypes.INTEGER,
  },
  authorId: {
    type: DataTypes.INTEGER,
    references: {
      name: "Condition_AuthorId_fk",
      table: "Users",
      model: "User",
      key: "id",
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  companyId: {
    type: DataTypes.INTEGER,
    references: {
      name: "Condition_CompanyId_fk",
      table: "Companies",
      model: "Company",
      key: "id",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },

  name: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.STRING,
  },
  data: {
    type: DataTypes.STRING,
  },

  AreaId: {
    type: DataTypes.BIGINT,
    references: {
      name: "Condition_AreaId_fk",
      table: "Areas",
      model: "Area",
      key: "id",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  ParentConditionId: {
    type: DataTypes.BIGINT,
    references: {
      name: "Condition_ParentConditionId_fk",
      table: "Conditions",
      model: "Condition",
      key: "id",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
});
