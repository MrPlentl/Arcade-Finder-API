'use strict';

export async function up(queryInterface, Sequelize) {
  // 1. Movies & Shows (Simplified for brevity, follow similar pattern for full columns)
  await queryInterface.createTable('movie', {
    id: { type: Sequelize.SMALLINT, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING(250), allowNull: false },
    slug: {
      type: Sequelize.STRING(250),
      unique: true,
    },
    year: { type: Sequelize.SMALLINT },
    link_imdb: {
      type: Sequelize.STRING(250),
      allowNull: true,
    },
    link_letterboxd: {
      type: Sequelize.STRING(250),
      allowNull: true,
    },
    link_justwatch: {
      type: Sequelize.STRING(250),
      allowNull: true,
    },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  });
  // Unique constraint on movie name/year
  await queryInterface.addConstraint('movie', {
    fields: ['name', 'year'],
    type: 'unique',
    name: 'name_year_unique',
  });

  // 2. Movie Links (Join Table)
  await queryInterface.createTable('movie_links', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    movie_id: {
      type: Sequelize.SMALLINT,
      references: { model: 'movie', key: 'id' },
    },
    game_id: {
      type: Sequelize.INTEGER,
      references: { model: 'game', key: 'id' },
    },
  });

  await queryInterface.addIndex('movie_links', ['movie_id'], {
    name: 'idx_movie_links_movie_id',
  });

  await queryInterface.addIndex('movie_links', ['game_id'], {
    name: 'idx_movie_links_game_id',
  });

  await queryInterface.createTable('show', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.SMALLINT,
    },
    name: { type: Sequelize.STRING(100), allowNull: false },
    slug: {
      type: Sequelize.STRING(250),
      unique: true,
    },
    year: { type: Sequelize.SMALLINT },
    link_imdb: { type: Sequelize.STRING(250) },
    link_justwatch: { type: Sequelize.STRING(250) },
    deleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  });

  // 2. Show Links (Join Table)
  await queryInterface.createTable('show_links', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    show_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'show', key: 'id' },
    },
    game_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'game', key: 'id' },
    },
  });

  await queryInterface.addIndex('show_links', ['show_id'], {
    name: 'idx_show_links_show_id',
  });

  await queryInterface.addIndex('show_links', ['game_id'], {
    name: 'idx_show_links_game_id',
  });

  // 3. User Roles (Join Table)
  await queryInterface.createTable('user_roles', {
    user_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      references: { model: 'users', key: 'id' },
    },
    role_id: {
      type: Sequelize.SMALLINT,
      primaryKey: true,
      references: { model: 'roles', key: 'id' },
    },
  });

  await queryInterface.addIndex('user_roles', ['role_id'], {
    name: 'idx_user_roles_role_id',
  });

  await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_set_movie_slug
    BEFORE INSERT ON movie
    FOR EACH ROW
    WHEN (NEW.slug IS NULL)
    EXECUTE FUNCTION function_generate_unique_slug();
  `);

  // This function inserts a record into user_roles using the ID of the newly created user
  await queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION function_assign_default_user_role()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO "user_roles" (user_id, role_id)
      VALUES (NEW.id, 0);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // We use AFTER INSERT because user_roles has a foreign key constraint
  // that requires the user record to already exist in the users table.
  await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_assign_default_role
    AFTER INSERT ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION function_assign_default_user_role();
  `);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('user_roles');
  await queryInterface.dropTable('show_links');
  await queryInterface.dropTable('show');
  await queryInterface.dropTable('movie_links');
  await queryInterface.dropTable('movie');
}
