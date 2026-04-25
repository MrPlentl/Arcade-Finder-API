"use strict";

export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("menu", {
		venue_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			primaryKey: true,
			references: {
				model: "venue",
				key: "id",
			},
			onDelete: "CASCADE",
		},
		type: {
			type: Sequelize.SMALLINT,
			allowNull: false,
			primaryKey: true,
			references: {
				model: "menu_type",
				key: "id",
			},
		},
		items: {
			type: Sequelize.JSONB,
			comment: "Stores the menu items for the venue",
		},
		created_by: {
			type: Sequelize.INTEGER,
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

	await queryInterface.sequelize.query(
		"COMMENT ON TABLE \"menu\" IS 'The menu items for the venue';",
	);
}
export async function down(queryInterface) {
	await queryInterface.dropTable("menu");
}
