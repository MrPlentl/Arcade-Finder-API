'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('game_views', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    game_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'game', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    viewed_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });

  // CRITICAL: Add an index for speed
  await queryInterface.addIndex('game_views', ['game_id', 'viewed_at'], {
    name: 'game_views_query_idx',
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('game_views');
}
