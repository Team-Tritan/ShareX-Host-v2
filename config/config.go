package config

type AppConfig struct {
	Port       int
	Dirs       []string
	Domains    []string
	Sentry_DSN string
}

var AppConfigInstance = AppConfig{
	Port: 8080,
	Dirs: []string{
		"suicidey", "pp", "kms", "fbi", "cia", "666", "777",
	},
	Domains: []string{
		"https://im.sleepdeprived.wtf",
		"https://ur.sleepdeprived.wtf",
		"https://probably.sleepdeprived.wtf",
		"https://because.sleepdeprived.wtf",
		"https://im.horny.rip",
		"https://ur.horny.rip",
		"https://probably.horny.rip",
		"https://because.horny.rip",
		"https://img.cock.expert",
		"https://img.femboys.porn",
		"https://img.femboys.fyi",
		"https://img.sexy.ong",
		"https://img.highon.christmas",
		"https://img.wank.group",
		"https://img.cocks.dev",
		"https://img.stoner.host",
		"https://img.onlycats.ong",
	},
	Sentry_DSN: "https://82c2d5853bb3bbd20124cec5bf3fa86e@sentry.tritan.dev/12",
}
