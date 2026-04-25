"use strict";

export async function up(queryInterface, Sequelize) {
	await queryInterface.createTable("game_ratings", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: Sequelize.INTEGER,
		},
		game_id: {
			type: Sequelize.INTEGER,
			allowNull: false,
			references: {
				model: "game", // name of the target table
				key: "id",
			},
			onUpdate: "CASCADE",
			onDelete: "CASCADE",
		},
		total_rating: {
			// Using FLOAT for decimals, change to Sequelize.INTEGER if you only store rounded whole numbers
			type: Sequelize.FLOAT,
			allowNull: true,
		},
		total_rating_count: {
			type: Sequelize.INTEGER,
			allowNull: true,
			defaultValue: 0,
		},
	});
}

export async function down(queryInterface) {
	await queryInterface.dropTable("game_ratings");
}
