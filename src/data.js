const fs = require("fs");
const readline = require("readline");
const Database = require("better-sqlite3");

// reference to db table
let dbRef;

const updateDatabase = () => {
	// domain list from github
	const domainsListPath = "/tmp/ALL-phishing-domains.txt";
	const domainsListModifiedTime = fs.statSync(domainsListPath).mtimeMs;

	const db = getConnection();

	// check db modified time
	const modifiedTimeStmt = db.prepare("SELECT * FROM metadata WHERE key = ?");
	const modifiedTimeResult = modifiedTimeStmt.get("modified_time");

	// ignore if domain list hasn't changed
	if (
		modifiedTimeResult &&
		modifiedTimeResult.value == domainsListModifiedTime
	) {
		return;
	}

	// clear table
	db.exec("DELETE FROM phishing_domains");
	db.exec("DELETE FROM metadata WHERE key = 'modified_time'");

	// transaction for inserting data
	const insertStmt = db.prepare(
		"INSERT INTO phishing_domains(domain) VALUES(?)"
	);

	const insertMany = db.transaction((domainsArr) => {
		for (const domain of domainsArr) insertStmt.run(domain);
	});

	// read the large text file line by line and import to db
	const rl = readline.createInterface({
		input: fs.createReadStream("/tmp/ALL-phishing-domains.txt", "utf-8"),
		crlfDelay: Infinity,
	});

	let domains = [];

	rl.on("line", (line) => {
		domains.push(line);
		if (domains.length === 5000) {
			insertMany(domains);
			domains = [];
		}
	});

	if (domains.length > 0) {
		insertMany(domains);
	}

	// update metadata
	const metadataStmt = db.prepare("INSERT INTO metadata VALUES(?,?)");
	metadataStmt.run("modified_time", domainsListModifiedTime);
};

/**
 * @returns {Database} Database connection
 */
const getConnection = () => {
	if (dbRef) {
		return dbRef;
	}

	const dbPath = `${__dirname}/../data/data.db`;
	dbRef = new Database(dbPath);

	dbRef.exec(
		"CREATE TABLE IF NOT EXISTS metadata (key TEXT UNIQUE, value TEXT);"
	);
	dbRef.exec(
		"CREATE TABLE IF NOT EXISTS phishing_domains (id INTEGER PRIMARY KEY AUTOINCREMENT, domain TEXT)"
	);

	return dbRef;
};

updateDatabase();
