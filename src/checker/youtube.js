import ytdl from "ytdl-core";
import { getConfig } from "../util.mjs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, writeFileSync, existsSync } from "fs";

// create cache file if doesn't exists
if (!existsSync(youtubeCachePath)) {
	writeFileSync(youtubeCachePath, "[]");
}

/**
 * Return if given url contains spam elements such as keywords
 * @param {string} url
 * @returns {Promise<boolean|undefined>} Boolean value if check was successful,
 *  undefined if failed or not a youtube link
 */
export const isSpam = async (url) => {
	return await checkMessage(url);
};

/**
 * Extract youtube video info and check for spam elements
 * @param {string} url
 * @returns {Promise<boolean|undefined>} Boolean value if API call was successful,
 *  undefined if failed
 */
const checkMessage = async (url) => {
	try {
		const youtubeRegex =
			/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/gim;

		if (!youtubeRegex.test(url)) return;

		// check cache
		const cache = JSON.parse(readFileSync(youtubeCachePath));

		if (cache.includes(url)) {
			return true;
		}

		const youtubeID = extractYoutubeID(url);

		if (!youtubeID) return;

		const info = await ytdl.getBasicInfo(youtubeID);

		// video title and description
		const title = info.videoDetails.title;
		const description = info.videoDetails.description;

		let isSpam = false;

		config.YOUTUBE_SPAM_MATCHES.every((match) => {
			const regex = new RegExp(match, "gi");
			isSpam = regex.test(title) || regex.test(description);
			return !isSpam;
		});

		// save to cache
		if (isSpam) {
			cache.push(url);
			writeFileSync(youtubeCachePath, JSON.stringify(cache));
		}

		return isSpam;
	} catch (e) {
		console.log(e);
		return;
	}
};

/**
 * Extract ID from a youtube url for ytdl-core
 * @param {string} url
 * @returns {string|false} Youtube ID if successful and false if failed
 */
const extractYoutubeID = (url) => {
	var regExp =
		/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	const match = url.match(regExp);
	if (match && match[2].length == 11) {
		return match[2];
	} else {
		return false;
	}
};
