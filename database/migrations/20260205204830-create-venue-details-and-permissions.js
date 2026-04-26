'use strict';

export async function up(queryInterface, Sequelize) {
  // 1. Contact Info
  await queryInterface.createTable('contact_info', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    venue_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'venue', key: 'id' },
      onDelete: 'CASCADE',
    },
    name: { type: Sequelize.STRING(50), allowNull: false },
    description: { type: Sequelize.STRING(50) },
    phone: { type: Sequelize.STRING(10) },
    email: { type: Sequelize.STRING(250) },
    website: { type: Sequelize.STRING(250) },
    updated_by: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    updated_at: { type: Sequelize.DATE },
    created_by: {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      references: {
        model: 'users', // name of the Target table
        key: 'id', // key in Target table that we're referencing
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // If the user is deleted, keep the record but set ID to null
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal("DATE_TRUNC('second', NOW())"),
    },
  });

  await queryInterface.addIndex('contact_info', ['venue_id'], {
    name: 'idx_contact_info_venue_id',
  });

  await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_set_contact_info_updated_at
    BEFORE UPDATE ON contact_info
    FOR EACH ROW
    EXECUTE FUNCTION function_set_updated_at_timestamp();
  `);

  // 2. Role Permissions (Join table)
  await queryInterface.createTable('role_permissions', {
    role_id: {
      type: Sequelize.SMALLINT,
      allowNull: false,
      primaryKey: true,
      references: { model: 'roles', key: 'id' },
    },
    permission_id: {
      type: Sequelize.SMALLINT,
      allowNull: false,
      primaryKey: true,
      references: { model: 'permissions', key: 'id' },
    },
  });

  await queryInterface.addIndex('role_permissions', ['permission_id'], {
    name: 'idx_role_permissions_permission_id',
  });
}
export async function down(queryInterface) {
  await queryInterface.sequelize.query(
    'DROP TRIGGER IF EXISTS trigger_set_contact_info_updated_at ON contact_info',
  );
  await queryInterface.dropTable('role_permissions');
  await queryInterface.dropTable('contact_info');
}
