export const CATEGORIES = [
	{ id: 'health', label: 'Gesundheit', color: '#ef4444' },
	{ id: 'fitness', label: 'Fitness', color: '#f59e0b' },
	{ id: 'learning', label: 'Lernen', color: '#3b82f6' },
	{ id: 'mindfulness', label: 'Achtsamkeit', color: '#10b981' },
	{ id: 'productivity', label: 'Produktivität', color: '#8b5cf6' },
	{ id: 'social', label: 'Soziales', color: '#ec4899' }
];

export const PRESET_COLORS = [
	'#ef4444', '#f97316', '#f59e0b', '#eab308',
	'#84cc16', '#22c55e', '#10b981', '#14b8a6',
	'#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
	'#a855f7', '#ec4899', '#f43f5e'
];

export const ICON_GROUPS = [
	{
		label: 'Gesundheit & Körper',
		icons: [
			'bi-heart-pulse-fill', 'bi-droplet-fill', 'bi-capsule', 'bi-thermometer-half',
			'bi-eye-fill', 'bi-lungs-fill', 'bi-bandaid-fill', 'bi-hospital-fill',
			'bi-heart-fill', 'bi-shield-plus-fill', 'bi-clipboard2-pulse-fill',
			'bi-activity', 'bi-person-fill', 'bi-patch-plus-fill', 'bi-moisture'
		]
	},
	{
		label: 'Fitness & Sport',
		icons: [
			'bi-bicycle', 'bi-person-walking', 'bi-trophy-fill', 'bi-lightning-fill',
			'bi-fire', 'bi-stopwatch-fill', 'bi-person-arms-up', 'bi-life-preserver',
			'bi-flag-fill', 'bi-bullseye', 'bi-arrow-repeat', 'bi-person-standing',
			'bi-speedometer2', 'bi-bar-chart-steps', 'bi-dribbble'
		]
	},
	{
		label: 'Lernen & Bildung',
		icons: [
			'bi-book-fill', 'bi-laptop', 'bi-pencil-fill', 'bi-mortarboard-fill',
			'bi-journal-text', 'bi-translate', 'bi-code-slash', 'bi-lightbulb-fill',
			'bi-calculator-fill', 'bi-globe', 'bi-patch-check-fill', 'bi-clipboard-fill',
			'bi-diagram-3-fill', 'bi-card-text', 'bi-journal-bookmark-fill'
		]
	},
	{
		label: 'Achtsamkeit & Natur',
		icons: [
			'bi-peace', 'bi-wind', 'bi-tree-fill', 'bi-cloud-fill',
			'bi-stars', 'bi-moon-stars-fill', 'bi-sun-fill', 'bi-water',
			'bi-flower1', 'bi-leaf-fill', 'bi-sunrise-fill', 'bi-sunset-fill',
			'bi-snow', 'bi-rainbow', 'bi-emoji-smile-fill'
		]
	},
	{
		label: 'Produktivität & Arbeit',
		icons: [
			'bi-check2-circle', 'bi-clock-fill', 'bi-calendar-check-fill', 'bi-list-check',
			'bi-kanban-fill', 'bi-graph-up-arrow', 'bi-inbox-fill', 'bi-briefcase-fill',
			'bi-folder-fill', 'bi-pin-fill', 'bi-alarm-fill', 'bi-gear-fill',
			'bi-rocket-fill', 'bi-send-fill', 'bi-lightning-charge-fill'
		]
	},
	{
		label: 'Soziales & Familie',
		icons: [
			'bi-people-fill', 'bi-chat-heart-fill', 'bi-telephone-fill', 'bi-gift-fill',
			'bi-person-heart', 'bi-house-heart-fill', 'bi-hand-thumbs-up-fill',
			'bi-envelope-heart-fill', 'bi-chat-dots-fill', 'bi-megaphone-fill',
			'bi-share-fill', 'bi-balloon-heart-fill', 'bi-emoji-laughing-fill'
		]
	},
	{
		label: 'Ernährung & Kochen',
		icons: [
			'bi-cup-hot-fill', 'bi-basket-fill', 'bi-cart-fill', 'bi-apple',
			'bi-cup-straw', 'bi-egg-fill', 'bi-bag-fill', 'bi-shop',
			'bi-box-seam-fill', 'bi-droplet', 'bi-star-fill', 'bi-globe2'
		]
	},
	{
		label: 'Finanzen & Business',
		icons: [
			'bi-cash-stack', 'bi-piggy-bank-fill', 'bi-graph-up', 'bi-wallet-fill',
			'bi-bank', 'bi-bar-chart-fill', 'bi-currency-euro', 'bi-credit-card-fill',
			'bi-receipt', 'bi-percent', 'bi-coin', 'bi-currency-dollar',
			'bi-safe-fill', 'bi-handbag-fill'
		]
	},
	{
		label: 'Kreativität & Kunst',
		icons: [
			'bi-palette-fill', 'bi-brush-fill', 'bi-camera-fill', 'bi-music-note-beamed',
			'bi-film', 'bi-pencil-square', 'bi-scissors', 'bi-mic-fill',
			'bi-pen-fill', 'bi-vinyl-fill', 'bi-easel-fill', 'bi-paint-bucket',
			'bi-image-fill', 'bi-collection-fill'
		]
	},
	{
		label: 'Reisen & Orte',
		icons: [
			'bi-airplane-fill', 'bi-geo-alt-fill', 'bi-map-fill', 'bi-compass-fill',
			'bi-luggage-fill', 'bi-train-front-fill', 'bi-car-front-fill', 'bi-bus-front-fill',
			'bi-ship-fill', 'bi-house-door-fill', 'bi-building-fill', 'bi-signpost-fill',
			'bi-camera2', 'bi-tent-fill'
		]
	},
	{
		label: 'Technik & Digital',
		icons: [
			'bi-phone-fill', 'bi-laptop-fill', 'bi-headphones', 'bi-wifi',
			'bi-cpu-fill', 'bi-robot', 'bi-terminal-fill', 'bi-cloud-upload-fill',
			'bi-database-fill', 'bi-keyboard-fill', 'bi-mouse-fill', 'bi-tv-fill',
			'bi-watch', 'bi-printer-fill', 'bi-hdd-fill'
		]
	},
	{
		label: 'Freizeit & Hobby',
		icons: [
			'bi-dice-5-fill', 'bi-puzzle-fill', 'bi-joystick', 'bi-suit-heart-fill',
			'bi-balloon-fill', 'bi-binoculars-fill', 'bi-controller', 'bi-book',
			'bi-music-player-fill', 'bi-camera', 'bi-bicycle', 'bi-balloon-heart',
			'bi-sunglasses', 'bi-star-half'
		]
	}
];

export function getCategoryById(id, userCategories = []) {
	return (
		CATEGORIES.find((c) => c.id === id) ||
		userCategories.find((c) => c._id === id) ||
		CATEGORIES[4]
	);
}
