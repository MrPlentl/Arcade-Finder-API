"use strict";

export async function up(queryInterface) {
	// 1. Game Types
	await queryInterface.bulkInsert("game_type", [
		{ id: 0, name: "Unknown", description: "Unknown game type" },
		{
			id: 1,
			name: "Pinball Machines",
			description: "Traditional Pinball machine",
		},
		{
			id: 2,
			name: "Single Game Cabinet",
			description: "Arcade cabinet that only has one game available",
		},
		{
			id: 3,
			name: "Multi-Game Cabinet",
			description:
				"Arcade cabinet that has multiple games running on it like a NEO Geo cabinet",
		},
		{
			id: 4,
			name: "Driving / Flying Game",
			description:
				"An arcade with a steering wheel to drive or joystick to fly",
		},
		{
			id: 5,
			name: "Shooter Game",
			description: "Arcade game that uses a replica gun",
		},
		{
			id: 6,
			name: "Dancing Game",
			description: "Rhythm based game where the user dances",
		},
		{
			id: 7,
			name: "Rhythm Game",
			description: "Rhythm based game other than a dance game",
		},
		{
			id: 8,
			name: "Sports Game",
			description: "A game like Basketball or Axe throwing",
		},
		{
			id: 9,
			name: "Carnival",
			description: "Carnival games like ring toss or bean bag toss",
		},
		{
			id: 10,
			name: "Console",
			description: "Consoles setup running contemporary video games",
		},
		{
			id: 11,
			name: "Merchandiser (Claw Crane)",
			description: "Games that have immediate prize redemption",
		},
		{
			id: 12,
			name: "Pachinko",
			description: "Traditional Pachinko machine",
		},
		{
			id: 13,
			name: "Photo Booth",
			description: "Standard Photo booth",
		},
		{
			id: 14,
			name: "Redemption",
			description: "Games that earn tickets for prizes",
		},
		{
			id: 15,
			name: "Slot machine",
			description: "Standard slot machine",
		},
		{ id: 16, name: "Other", description: "Any other style game" },
	]);

	// 2. Venue Status & Types
	await queryInterface.bulkInsert("venue_status", [
		{ id: 0, name: "Closed" },
		{ id: 1, name: "Open" },
		{ id: 2, name: "Coming Soon" },
		{ id: 3, name: "Unknown" },
		{ id: 9, name: "Closed Permanently" },
	]);

	await queryInterface.bulkInsert("venue_type", [
		{
			id: 0,
			name: "Unknown",
			description: "This arcade has an unknown vibe",
		},
		{
			id: 1,
			name: "Traditional Arcade",
			description: "Arcade focus with Beer",
		},
		{
			id: 2,
			name: "Barcade",
			description: "Bar focus with Arcade machines",
		},
		{
			id: 3,
			name: "Family",
			description: "Family Entertainment Center",
		},
		{
			id: 4,
			name: "Premium",
			description: "Adult Entertainment focus (e.g. Dave and Busters)",
		},
		{
			id: 5,
			name: "Redemption",
			description: "Ticket games with exchange counter",
		},
		{
			id: 6,
			name: "Small",
			description: "Less than 50 machines, no food/drink",
		},
		{
			id: 7,
			name: "Minicade",
			description: "Arcade machines within a Business (5 or less)",
		},
	]);

	// 3. Inventory Metadata
	await queryInterface.bulkInsert("inventory_status", [
		{ id: 0, name: "Out of Order" },
		{ id: 1, name: "Working" },
		{ id: 2, name: "Malfunctioning" },
		{ id: 3, name: "Missing from floor" },
	]);

	// 4. Permissions & Roles
	await queryInterface.bulkInsert("permissions", [
		{
			id: 1,
			name: "read",
			description: "Permission to read data from GET requests.",
		},
		{
			id: 2,
			name: "apikey_create",
			description: "Can create an apikey",
		},
		{
			id: 3,
			name: "movie_read",
			description: "Can read all movie records",
		},
		{
			id: 4,
			name: "movie_create",
			description: "Can create new Movies",
		},
		{
			id: 7,
			name: "game_read",
			description: "Can read all game records",
		},
		{
			id: 8,
			name: "game_create",
			description: "Can create new games",
		},
		{
			id: 9,
			name: "show_read",
			description: "Can read all show records",
		},
		{
			id: 10,
			name: "show_create",
			description: "Can create new shows",
		},
		{
			id: 11,
			name: "admin_validate",
			description: "Can validate user",
		},
	]);

	await queryInterface.bulkInsert("roles", [
		{
			id: 0,
			name: "Pending",
			display_name: "Pending",
			description:
				"Can only read posts, pages and comments. Can only Access their profile to resend account confirmation email.",
		},
		{
			id: 1,
			name: "Basic",
			display_name: "Basic",
			description:
				"Can read and comment on posts and pages. Can create and Access to their profile, ratings and inventory.",
		},
		{
			id: 2,
			name: "Contributor",
			display_name: "Contributer",
			description:
				"Has no live publishing or uploading capability (content is moderated), but they can write and edit their own posts until they are published. Limit 5 at a time in the moderation queue. Must be validated by an Admin or Editor.",
		},
		{
			id: 3,
			name: "Author",
			display_name: "Author",
			description:
				"Can write, upload photos, edit, and publish their own posts and reviews without moderation.",
		},
		{
			id: 4,
			name: "Editor",
			display_name: "Editor",
			description:
				"Generally reserved for trusted unknown users. Has access to all Venues, models, and links with the power to suspend and remove users. All changes are logged and the actions should be easily reverted if an Editor goes Rogue.",
		},
		{
			id: 5,
			name: "Administrator",
			display_name: "Administrator",
			description:
				"Nothing is off limits. Reserved for Elite Team members. Able to remove and elevate users. They can also help with support tickets. All updates and changes are logged and reversible.",
		},
		{
			id: 9,
			name: "Super Admin",
			display_name: "Super Admin",
			description:
				"Access to the Admin Dashboard and Analytics. The Super Admin will be hard coded to give power regardless of DB status. Only 1 single user can be the Super Admin.",
		},
	]);

	// 5. Parking Types
	await queryInterface.bulkInsert("parking_type", [
		{
			id: 0,
			name: "Unknown",
			is_detached: false,
			description:
				"Unknown: the real event is the treasure hunt for a spot—will it be behind a sketchy alley, or did the parking gods smile upon you today?",
		},
		{
			id: 1,
			name: "Parking Lot (small)",
			is_detached: false,
			description:
				"A tiny lot where every car is a Tetris piece, spots are mythological, and turning around feels like solving a Rubik’s Cube in reverse.",
		},
		{
			id: 2,
			name: "Parking Lot (medium)",
			is_detached: false,
			description:
				"A medium lot: not too big, not too small—just enough space to find a spot after one lap, two arguments, and a suspiciously lucky reverse park.",
		},
		{
			id: 3,
			name: "Parking Lot (large)",
			is_detached: false,
			description:
				"A large parking lot: where you park near a landmark, forget it anyway, and get your daily steps in just trying to find your car.",
		},
		{
			id: 4,
			name: "Parking Lot (small)",
			is_detached: true,
			description:
				"A small detached parking lot: just a lonely patch of asphalt pretending to be useful—fits five cars, but only if two are best friends.",
		},
		{
			id: 5,
			name: "Parking Lot (medium)",
			is_detached: true,
			description:
				"A medium detached parking lot: big enough to feel hopeful, small enough to crush that hope when the last spot is taken by a scooter.",
		},
		{
			id: 6,
			name: "Parking Lot (large)",
			is_detached: true,
			description:
				"A large detached parking lot: basically its own zip code—by the time you find a spot, you’ve aged a year and questioned all your life choices.",
		},
		{
			id: 7,
			name: "Parking Garage (small)",
			is_detached: false,
			description:
				"A small parking garage: where every turn feels like a boss battle, ceiling clearance is a suggestion, and backing out is a three-act tragedy.",
		},
		{
			id: 8,
			name: "Parking Garage (medium)",
			is_detached: false,
			description:
				"A medium parking garage: just big enough to get lost, but small enough to still hit a pillar while trying to avoid eye contact with other drivers.",
		},
		{
			id: 9,
			name: "Parking Garage (large)",
			is_detached: false,
			description:
				"A large parking garage: a concrete labyrinth where your car disappears into legend, and every level looks exactly like the one you just checked.",
		},
		{
			id: 10,
			name: "Parking Garage (small)",
			is_detached: true,
			description:
				"Basically a hide-and-seek champion for cars—fits a handful, echoes like a cave, and always smells mysteriously like tires and regret.",
		},
		{
			id: 11,
			name: "Parking Garage (medium)",
			is_detached: true,
			description:
				"A medium detached parking garage: just enough room to park, panic, and pray—tight corners, low ceilings, and that one guy who always takes two spots.",
		},
		{
			id: 12,
			name: "Parking Garage (large)",
			is_detached: true,
			description:
				"A large detached parking garage: a concrete kingdom with endless ramps, ghost-levels, and the haunting echo of your key fob doing absolutely nothing.",
		},
		{
			id: 13,
			name: "Underground Parking (small)",
			is_detached: false,
			description:
				"A small underground parking: like squeezing into a basement built by hobbits—low ceilings, tight spots, and zero signal to call for emotional support.",
		},
		{
			id: 14,
			name: "Underground Parking (medium)",
			is_detached: false,
			description:
				"Deep enough to question sunlight, roomy enough for false hope, and just echoey enough to hear your bad parking decisions.",
		},
		{
			id: 15,
			name: "Underground Parking (large)",
			is_detached: false,
			description:
				"A large underground parking: basically the Batcave, if Batman forgot where he parked—miles of mystery, identical pillars, and zero GPS mercy.",
		},
		{
			id: 16,
			name: "Underground Parking (small)",
			is_detached: true,
			description:
				"Like a secret bunker for cars—low ceilings, cramped spaces, and a faint smell of mystery (and maybe old gym socks).",
		},
		{
			id: 17,
			name: "Underground Parking (medium)",
			is_detached: true,
			description:
				"Just enough space to feel important, but tight enough that your car might need therapy after every parking attempt.",
		},
		{
			id: 18,
			name: "Underground Parking (large)",
			is_detached: true,
			description:
				"A subterranean maze where your car becomes a lost adventurer, and every turn feels like you're in a low-budget spy movie.",
		},
		{
			id: 19,
			name: "Park-and-Ride",
			is_detached: true,
			description:
				"A place where your car hangs out, probably making new friends, while you wait for a bus that’s always five minutes late.",
		},
		{
			id: 20,
			name: "Valet Parking",
			is_detached: true,
			description:
				"Where you hand over your keys, trust a stranger with your car, and then feel like you’ve just entered a high-stakes game of 'Hot Potato.'",
		},
		{
			id: 21,
			name: "None",
			is_detached: true,
			description:
				"No parking: here your car takes a solo road trip while you embark on a quest for street parking, hoping your shoes are up for the adventure.",
		},
	]);
	await queryInterface.bulkInsert("pricing_type", [
		{ id: 0, name: "Unknown", description: null },
		{ id: 1, name: "General Daily Admission", description: null },
		{ id: 2, name: "General Monthly Pass", description: null },
		{ id: 3, name: "General Weekend Pass", description: null },
		{ id: 4, name: "General Yearly Pass", description: null },
		{ id: 5, name: "Season Pass", description: null },
		{ id: 6, name: "Adult Daily Admission", description: null },
		{ id: 7, name: "Adult Monthly Pass", description: null },
		{ id: 8, name: "Adult Yearly", description: null },
		{ id: 9, name: "Child Daily Admission", description: null },
		{ id: 10, name: "Child Monthly Pass", description: null },
		{ id: 11, name: "Child Yearly Pass", description: null },
	]);
	await queryInterface.bulkInsert("menu_type", [
		{ id: 0, name: "Unknown", description: null },
		{ id: 1, name: "General", description: null },
		{ id: 2, name: "Food and Alcohol", description: null },
		{ id: 3, name: "Food and Beverage", description: null },
		{ id: 4, name: "Food Only", description: null },
		{ id: 5, name: "Alcohol Only", description: null },
		{ id: 6, name: "Beer and Wine", description: null },
		{ id: 7, name: "Cider", description: null },
		{ id: 8, name: "Non-Alcohol Beverages", description: null },
	]);
	await queryInterface.bulkInsert("inventory_type", [
		{ id: 1, name: "Arcade", description: null },
		{ id: 2, name: "Carnival", description: null },
		{ id: 3, name: "Console", description: null },
		{ id: 4, name: "Merchandiser (Claw Crane)", description: null },
		{ id: 5, name: "Pachinko", description: null },
		{ id: 6, name: "Photo Booth", description: null },
		{ id: 7, name: "Pinball", description: null },
		{ id: 8, name: "Redemption", description: null },
		{ id: 9, name: "Slot machine", description: null },
		{ id: 10, name: "Sports", description: null },
	]);
	await queryInterface.bulkInsert("inventory_variant", [
		{ id: 1, name: "Standard Cabinet", description: null },
		{ id: 2, name: "Cocktail", description: null },
		{ id: 3, name: "Sit Down", description: null },
		{ id: 4, name: "Stand Up", description: null },
		{ id: 5, name: "Stylish Deluxe Cabinet", description: null },
		{ id: 6, name: "2 Player", description: null },
		{ id: 7, name: "3 Player", description: null },
		{ id: 8, name: "4 Player", description: null },
		{ id: 9, name: "5 Player", description: null },
		{ id: 10, name: "6 Player", description: null },
		{ id: 11, name: "8+ Player", description: null },
		{
			id: 12,
			name: "Area 51 + Maximum Force",
			description:
				"Dual arcade machine that plays both games through game selection",
		},
		{
			id: 13,
			name: "Class Of 1981",
			description:
				"20 year reunion combo cabinet featuring Galaga and Ms. Pac-Man",
		},
		{
			id: 14,
			name: "Candy Cab",
			description: "Traditional Japanese sit down arcade machine",
		},
		{
			id: 15,
			name: "Silver Anniversary",
			description: "Space Invaders / Qix combo cabinet",
		},
		{
			id: 16,
			name: "Neo Geo MVS",
			description:
				"Generally a 4-slot Multi Video System (MVS) arcade cabinet",
		},
		{
			id: 17,
			name: "Custom",
			description:
				"A custom cabinet that was built specifically for a single game or several games",
		},
		{
			id: 18,
			name: "PlayChoice-10",
			description:
				"Arcade system developed and marketed by Nintendo released in August 1986 as the successor to the Nintendo VS. System",
		},
		{
			id: 19,
			name: "Nintendo VS. System",
			description:
				"An arcade system developed and marketed by Nintendo introduced in March 1984",
		},
		{
			id: 20,
			name: "Standard Size",
			description: "Standard size merchandiser game",
		},
		{
			id: 21,
			name: "Mini",
			description: "Miniature size merchandiser game",
		},
		{ id: 22, name: "Large", description: "Large size merchandiser game" },
		{ id: 23, name: "Pro", description: "Stern Pro variant" },
		{ id: 24, name: "Premium", description: "Stern Premium variant" },
		{ id: 25, name: "Limited", description: "Stern Limited variant" },
		{ id: 26, name: "Standard", description: "Standard Pinball" },
	]);
}
export async function down(queryInterface) {
	// Delete in reverse order to respect foreign keys if you ever revert
	await queryInterface.bulkDelete("inventory_variant", null, {});
	await queryInterface.bulkDelete("inventory_type", null, {});
	await queryInterface.bulkDelete("menu_type", null, {});
	await queryInterface.bulkDelete("pricing_type", null, {});
	await queryInterface.bulkDelete("parking_type", null, {});
	await queryInterface.bulkDelete("roles", null, {});
	await queryInterface.bulkDelete("permissions", null, {});
	await queryInterface.bulkDelete("inventory_status", null, {});
	await queryInterface.bulkDelete("venue_type", null, {});
	await queryInterface.bulkDelete("venue_status", null, {});
	await queryInterface.bulkDelete("game_type", null, {});
}
