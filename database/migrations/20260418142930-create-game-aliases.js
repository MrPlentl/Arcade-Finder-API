'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('game_aliases', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    game_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'game', // Name of the target table
        key: 'id', // Key in the target table
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    name_variant: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });

  // CRITICAL: Add an index for speed
  await queryInterface.addIndex('game_aliases', ['name_variant']);
}
export async function down(queryInterface) {
  await queryInterface.dropTable('game_aliases');
}
