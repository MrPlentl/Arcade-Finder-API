"use strict";

export async function up(queryInterface, Sequelize) {
	// 1. Zipcodes
	await queryInterface.createTable("zipcode", {
		id: {
			allowNull: false,
			primaryKey: true,
			type: Sequelize.INTEGER,
		},
		country: {
			type: Sequelize.CHAR(2),
			defaultValue: "US",
		},
	});

	// 2. Users
	await queryInterface.createTable("users", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
		},
		email: {
			type: Sequelize.STRING(255),
			allowNull: false,
			unique: true,
		},
		password: {
			type: Sequelize.TEXT,
		},
		display_name: {
			type: Sequelize.STRING(100),
		},
		apikey_id: {
			type: Sequelize.INTEGER,
		},
		deleted: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		is_suspended: {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		uuid: {
			type: Sequelize.UUID,
			defaultValue: Sequelize.literal("gen_random_uuid()"), // Requires pgcrypto usually, or DB default
		},
		created_by: { type: Sequelize.INTEGER },
		updated_by: { type: Sequelize.INTEGER },
		created_at: {
			type: Sequelize.DATE,
			allowNull: false,
			defaultValue: Sequelize.literal("DATE_TRUNC('second', NOW())"),
		},
		updated_at: { type: Sequelize.DATE },
	});

	await queryInterface.addIndex("users", ["uuid"], {
		name: "idx_users_uuid",
	});

	await queryInterface.sequelize.query(`
    CREATE TRIGGER trigger_set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION function_set_updated_at_timestamp();
  `);

	// 3. IGDB Reference
	await queryInterface.createTable("igdb", {
		id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER },
		name: { type: Sequelize.STRING(250) },
		slug: { type: Sequelize.STRING(75) },
		first_release_date: { type: Sequelize.STRING(10) },
		summary: { type: Sequelize.TEXT },
		last_updated: {
			type: Sequelize.DATE,
			defaultValue: Sequelize.literal("DATE_TRUNC('second', NOW())"),
		},
	});
}

export async function down(queryInterface) {
	await queryInterface.sequelize.query(
		"DROP TRIGGER IF EXISTS trigger_set_users_updated_at ON users",
	);
	await queryInterface.dropTable("users");
	await queryInterface.dropTable("zipcode");
	await queryInterface.dropTable("igdb");
}
