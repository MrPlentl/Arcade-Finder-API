"use strict";

export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("pricing", {
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
				model: "pricing_type",
				key: "id",
			},
		},
		amount: {
			type: Sequelize.DECIMAL(5, 2),
			allowNull: true,
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

	// Adding the comment from the SQL dump
	await queryInterface.sequelize.query(
		"COMMENT ON TABLE \"pricing\" IS 'The price information and possible subscriptions for the venue';",
	);
}
export async function down(queryInterface) {
	await queryInterface.dropTable("pricing");
}
