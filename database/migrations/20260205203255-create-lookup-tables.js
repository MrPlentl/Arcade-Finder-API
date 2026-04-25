"use strict";

export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("parking_type", {
		id: {
			allowNull: false,
			primaryKey: true,
			type: Sequelize.SMALLINT,
		},
		name: {
			type: Sequelize.STRING(50),
			allowNull: false,
		},
		is_detached: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		description: {
			type: Sequelize.STRING(150),
		},
	});

	await queryInterface.sequelize.query(
		"COMMENT ON TABLE \"parking_type\" IS 'What type of parking that is immediately available for the venue';",
	);

	const lookupTables = [
		"game_type",
		"venue_type",
		"venue_status",
		"inventory_status",
		"inventory_type",
		"inventory_variant",
		"menu_type",
		"pricing_type",
		"permissions",
		"roles",
	];

	for (const table of lookupTables) {
		await queryInterface.createTable(table, {
			id: {
				allowNull: false,
				autoIncrement: table === "permissions",
				primaryKey: true,
				type: Sequelize.SMALLINT,
			},
			name: {
				type: Sequelize.STRING(50),
				allowNull: false,
				unique: table === "roles" || table === "permissions",
			},
			description: {
				type: Sequelize.STRING(250),
			},
		});
	}

	// Specific adjustment for roles which has display_name
	await queryInterface.addColumn("roles", "display_name", {
		type: Sequelize.STRING(50),
	});

	await queryInterface.sequelize.query(`
    CREATE FUNCTION function_set_updated_at_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = date_trunc('second', now());
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
}
export async function down(queryInterface) {
	await queryInterface.sequelize.query(
		"DROP FUNCTION IF EXISTS function_set_updated_at_timestamp()",
	);
	// Drop in reverse order or all at once
	const lookupTables = [
		"roles",
		"permissions",
		"pricing_type",
		"parking_type",
		"menu_type",
		"inventory_variant",
		"inventory_type",
		"inventory_status",
		"venue_status",
		"venue_type",
		"game_type",
	];
	for (const table of lookupTables) {
		await queryInterface.dropTable(table);
	}
}
