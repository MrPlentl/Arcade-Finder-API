"use strict";

// Table List:
// 1. Location (One-to-One with Venue mostly)
// 2. Inventory (The connection between Venues and Games)
// 3. Hours

export async function up(queryInterface, Sequelize) {
	// 1. Location (One-to-One with Venue mostly)
	await queryInterface.createTable("location", {
		venue_id: {
			allowNull: false,
			primaryKey: true,
			type: Sequelize.INTEGER,
			references: { model: "venue", key: "id" },
			onDelete: "CASCADE",
		},
		street: { type: Sequelize.STRING(250) },
		city: { type: Sequelize.STRING(30) },
		state: { type: Sequelize.CHAR(2) },
		zip: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: { model: "zipcode", key: "id" },
		},
		coordinates: { type: Sequelize.STRING(50) },
		plus_code: { type: Sequelize.STRING(50) },
		parking_type: {
			type: Sequelize.SMALLINT,
			references: { model: "parking_type", key: "id" },
		},
		parking_fee: { type: Sequelize.STRING(30) },
		created_by: {
			type: Sequelize.INTEGER,
			defaultValue: 1,
			references: {
				model: "users", // name of the Target table
				key: "id", // key in Target table that we're referencing
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL", // If the user is deleted, keep the record but set ID to null
		},
		updated_by: {
			type: Sequelize.INTEGER,
			references: {
				model: "users",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
		},
		created_at: {
			type: Sequelize.DATE,
			allowNull: false,
			defaultValue: Sequelize.literal("DATE_TRUNC('second', NOW())"),
		},
		updated_at: { type: Sequelize.DATE },
	});

	await queryInterface.addIndex("location", ["zip"], {
		name: "idx_location_zip",
	});

	// 2. Inventory (The connection between Venues and Games)
	await queryInterface.createTable("inventory", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
		},
		venue_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: { model: "venue", key: "id" },
		},
		game_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: { model: "game", key: "id" },
		},
		type: {
			type: Sequelize.SMALLINT,
			references: { model: "inventory_type", key: "id" },
		},
		variant: {
			type: Sequelize.SMALLINT,
			references: { model: "inventory_variant", key: "id" },
		},
		status: {
			type: Sequelize.SMALLINT,
			references: { model: "inventory_status", key: "id" },
		},
		created_by: {
			type: Sequelize.INTEGER,
			defaultValue: 1,
			references: {
				model: "users", // name of the Target table
				key: "id", // key in Target table that we're referencing
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL", // If the user is deleted, keep the record but set ID to null
		},
		updated_by: {
			type: Sequelize.INTEGER,
			references: {
				model: "users",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
		},
		created_at: {
			type: Sequelize.DATE,
			allowNull: false,
			defaultValue: Sequelize.literal("DATE_TRUNC('second', NOW())"),
		},
		updated_at: { type: Sequelize.DATE },
	});

	await queryInterface.addIndex("inventory", ["game_id"], {
		name: "idx_inventory_game_id",
	});

	await queryInterface.addIndex("inventory", ["venue_id"], {
		name: "idx_inventory_venue_id",
	});

	// 3. Hours (Composite Key)
	await queryInterface.createTable("hours", {
		venue_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			primaryKey: true,
			references: { model: "venue", key: "id" },
		},
		day: {
			type: Sequelize.SMALLINT, // 0-6 for days of week
			allowNull: false,
			primaryKey: true,
		},
		open: {
			type: Sequelize.TIME, // Changed from STRING(5)
			allowNull: false,
		},
		close: {
			type: Sequelize.TIME, // Changed from STRING(5)
			allowNull: false,
		},
		curfew: {
			type: Sequelize.TIME, // Changed from STRING(5)
		},
		created_by: {
			type: Sequelize.INTEGER,
			defaultValue: 1,
			references: {
				model: "users", // name of the Target table
				key: "id", // key in Target table that we're referencing
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL", // If the user is deleted, keep the record but set ID to null
		},
		updated_by: {
			type: Sequelize.INTEGER,
			references: {
				model: "users",
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "SET NULL",
		},
		created_at: {
			type: Sequelize.DATE,
			allowNull: false,
			defaultValue: Sequelize.literal("DATE_TRUNC('second', NOW())"),
		},
		updated_at: { type: Sequelize.DATE },
	});

	await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_set_location_updated_at
    BEFORE UPDATE ON location
    FOR EACH ROW
    EXECUTE FUNCTION function_set_updated_at_timestamp();
  `);

	await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_set_hours_updated_at
    BEFORE UPDATE ON hours
    FOR EACH ROW
    EXECUTE FUNCTION function_set_updated_at_timestamp();
  `);
}
export async function down(queryInterface) {
	await queryInterface.sequelize.query(
		"DROP TRIGGER IF EXISTS trigger_set_hours_updated_at ON hours",
	);
	await queryInterface.sequelize.query(
		"DROP TRIGGER IF EXISTS trigger_set_location_updated_at ON location",
	);
	await queryInterface.dropTable("hours");
	await queryInterface.dropTable("inventory");
	await queryInterface.dropTable("location");
}
