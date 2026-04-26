'use strict';

export async function up(queryInterface, Sequelize) {
  // 1. Venues
  await queryInterface.createTable('venue', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING(250),
      allowNull: false,
    },
    slug: {
      type: Sequelize.STRING(250),
      unique: true,
    },
    type: {
      type: Sequelize.SMALLINT,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: Sequelize.SMALLINT,
      allowNull: false,
      defaultValue: 1,
    },
    verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
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
    updated_by: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("DATE_TRUNC('second', NOW())"),
    },
    updated_at: { type: Sequelize.DATE },
  });

  await queryInterface.addIndex('venue', ['status', 'type'], {
    name: 'idx_venue_status_type',
  });

  await queryInterface.addIndex('venue', ['name'], {
    name: 'idx_venue_name',
  });

  await queryInterface.addIndex(
    'venue',
    [
      {
        attribute: 'created_at',
        order: 'DESC',
      },
    ],
    {
      name: 'idx_venue_created_at',
    },
  );

  // 2. Games
  await queryInterface.createTable('game', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING(250),
      allowNull: false,
    },
    slug: {
      type: Sequelize.STRING(75),
      unique: true,
    },
    type: {
      type: Sequelize.SMALLINT,
      defaultValue: 0,
    },
    igdb_id: {
      type: Sequelize.INTEGER,
    },
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
    updated_by: {
      type: Sequelize.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("DATE_TRUNC('second', NOW())"),
    },
    updated_at: { type: Sequelize.DATE },
  });

  await queryInterface.addConstraint('game', {
    fields: ['name', 'type'],
    type: 'unique',
    name: 'unique_game_name_type',
  });

  await queryInterface.addIndex('game', ['type'], {
    name: 'idx_game_type',
  });

  await queryInterface.addIndex('game', ['name'], {
    name: 'idx_game_name',
  });

  await queryInterface.addIndex(
    'game',
    [
      {
        attribute: 'created_at',
        order: 'DESC',
      },
    ],
    {
      name: 'idx_game_created_at',
    },
  );

  // 3. Create functions and triggers
  await queryInterface.sequelize.query(`
		CREATE FUNCTION function_generate_unique_slug_for_venue()
		RETURNS TRIGGER AS $$
		DECLARE
			base_slug TEXT;
			final_slug TEXT;
			counter INTEGER := 1;
		BEGIN
			base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
			base_slug := trim(both '-' from base_slug);
			
			final_slug := base_slug;

			WHILE EXISTS (SELECT 1 FROM "venue" WHERE slug = final_slug AND id IS DISTINCT FROM NEW.id) LOOP
				final_slug := base_slug || '-' || counter;
				counter := counter + 1;
			END LOOP;

			NEW.slug := final_slug;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
	`);

  await queryInterface.sequelize.query(`
		CREATE FUNCTION function_generate_unique_slug_for_game()
		RETURNS TRIGGER AS $$
		DECLARE
			base_slug TEXT;
			final_slug TEXT;
			counter INTEGER := 1;
		BEGIN
			base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
			base_slug := trim(both '-' from base_slug);
			
			final_slug := base_slug;

			WHILE EXISTS (SELECT 1 FROM "game" WHERE slug = final_slug AND id IS DISTINCT FROM NEW.id) LOOP
				final_slug := base_slug || '-' || counter;
				counter := counter + 1;
			END LOOP;

			NEW.slug := final_slug;
			RETURN NEW;
		END;
		$$ LANGUAGE plpgsql;
	`);

  await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_set_venue_slug
    BEFORE INSERT ON venue
    FOR EACH ROW
    WHEN (NEW.slug IS NULL)
    EXECUTE FUNCTION function_generate_unique_slug_for_venue();
  `);

  await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_set_game_slug
    BEFORE INSERT ON game
    FOR EACH ROW
    WHEN (NEW.slug IS NULL)
    EXECUTE FUNCTION function_generate_unique_slug_for_game();
  `);

  await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_set_venue_updated_at
    BEFORE UPDATE ON venue
    FOR EACH ROW
    EXECUTE FUNCTION function_set_updated_at_timestamp();
  `);

  await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_set_game_updated_at
    BEFORE UPDATE ON game
    FOR EACH ROW
    EXECUTE FUNCTION function_set_updated_at_timestamp();
  `);
}

export async function down(queryInterface) {
  await queryInterface.sequelize.query(
    'DROP TRIGGER IF EXISTS trigger_set_game_updated_at ON game',
  );
  await queryInterface.sequelize.query(
    'DROP TRIGGER IF EXISTS trigger_set_venue_updated_at ON venue',
  );
  await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trigger_set_venue_slug ON venue');
  await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS generate_unique_slug_for_venue()');
  await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS trigger_set_game_slug ON game');
  await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS generate_unique_slug_for_game()');
  await queryInterface.dropTable('game');
  await queryInterface.dropTable('venue');
}
