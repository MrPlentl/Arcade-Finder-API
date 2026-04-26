'use strict';

export async function up(queryInterface, Sequelize) {
  const distanceTables = [
    { name: 'zipdistance05', precision: [2, 1] },
    { name: 'zipdistance25', precision: [3, 1] },
    { name: 'zipdistance50', precision: [3, 1] },
    { name: 'zipdistance100', precision: [4, 1] },
  ];

  for (const table of distanceTables) {
    await queryInterface.createTable(table.name, {
      origin: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'zipcode', key: 'id' },
      },
      destination: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        // Note: Destination in your SQL dump doesn't have an explicit FK,
        // but logically it maps to zipcode as well.
      },
      distance: {
        type: Sequelize.DECIMAL(table.precision[0], table.precision[1]),
      },
    });
  }

  await queryInterface.addIndex('zipdistance05', ['origin', 'distance'], {
    name: 'idx_zipdistance05_lookup',
  });

  await queryInterface.addIndex('zipdistance25', ['origin', 'distance'], {
    name: 'idx_zipdistance25_lookup',
  });

  await queryInterface.addIndex('zipdistance50', ['origin', 'distance'], {
    name: 'idx_zipdistance50_lookup',
  });

  await queryInterface.addIndex('zipdistance100', ['origin', 'distance'], {
    name: 'idx_zipdistance100_lookup',
  });
}
export async function down(queryInterface) {
  await queryInterface.dropTable('zipdistance100');
  await queryInterface.dropTable('zipdistance50');
  await queryInterface.dropTable('zipdistance25');
  await queryInterface.dropTable('zipdistance05');
}
