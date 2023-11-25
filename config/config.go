package config

type AppConfig struct {
	Port       int
	Dirs       []string
	Domains    []string
	Sentry_DSN string
	S3_KeyID   string
	S3_AppKey  string
	S3_RegionName string
	S3_RegionURL string 
	S3_BucketName string
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
	
	S3_KeyID: "00558daa392fb700000000001",
	S3_AppKey: "K0058jnF/dPReKrJx3UpHCpeaCy/Gqg",
	S3_RegionURL: "https://s3.us-east-005.backblazeb2.com",
	S3_RegionName: "us-east-005",
	S3_BucketName: "Tritan-Images",
}
