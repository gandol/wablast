const puppeteer = require('puppeteer');
const config = require('./config')
const fs = require('fs')
const db = require('./database');
db.connect(function (err) {
	if (err) throw err
})
const start = async () => {
	const browser = await puppeteer.launch({
		headless: false,
		userDataDir: '/home/g3nt0/.config/google-chrome'
	})
	const page = await browser.newPage()
	const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
		'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
	await page.setUserAgent(userAgent);
	await page.goto('http://web.whatsapp.com')
	await page.waitForSelector('#app > div > div > div._10V4p._1jxtm > div > div > div.mOuAM > h1', { timeout: 60000 })

	console.log('logged in')

	let sql = 'SELECT * FROM nomor_tujuan where send=0';
	db.query(sql, async function (err, result) {
		for (let index = 0; index < result.length; index++) {
			const precontent = getContent(config.content)
			let content = encodeURI(precontent)
			await page.goto('https://web.whatsapp.com/send?phone=' + result[index].nomor + '&text=' + content)
			await page.on('dialog', async dialog => {
				await dialog.accept()
			})
			try {
				await page.waitForSelector('._3u328', { timeout: 10000 })
			} catch (error) {
				console.log('gk punya wa si - ' + result[index].nomor)
				let sqlUpdate = `UPDATE nomor_tujuan SET send=1 where nomor='${result[index].nomor}'`
				db.query(sqlUpdate, function (errror, respon) {
					if (errror) throw errror
				})
				continue;
			}
			await page.focus('._3u328.copyable-text.selectable-text')
			await page.keyboard.press(String.fromCharCode(13))
			console.log('success send message to ' + result[index].nomor)
			let sqlUpdate = `UPDATE nomor_tujuan SET send=1 where nomor='${result[index].nomor}'`
			db.query(sqlUpdate, function (errror, respon) {
				if (errror) throw errror
			})
			await sleep(getRndInteger(10000, 30000))
		}
		db.destroy();
		console.log('done')
		await page.waitFor(1000)
		browser.close()
	})

}
let sql = 'SELECT * FROM nomor_tujuan where send=0';
db.query(sql, function (err, result) {
	if (result.length > 0) {
		start();
	} else {
		console.log("list tidak ada\n silahkan jalankan 'npm run reset' untuk mereset list");
		db.destroy();
		process.exit();
	}
})
const getContent = (path) => {
	const content = fs.readFileSync(path, { encoding: 'utf-8' })
	return content;
}
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}
