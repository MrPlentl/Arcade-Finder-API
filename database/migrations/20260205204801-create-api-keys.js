'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('apikey', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    lookup_hash: {
      type: Sequelize.CHAR(16),
      allowNull: false,
      unique: true,
    },
    hashed_key: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("DATE_TRUNC('second', NOW())"),
    },
    expires_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("DATE_TRUNC('second', NOW() + INTERVAL '6 months')"),
    },
  });

  // Adding the index for lookup performance as seen in the SQL dump
  await queryInterface.addIndex('apikey', ['lookup_hash'], {
    name: 'idx_lookup_hash',
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('apikey');
}
