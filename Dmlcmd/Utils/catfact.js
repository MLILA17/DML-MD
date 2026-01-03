module.exports = async (context) => {

const { client, m, text, fetchJson } = context;


try {


const data = await fetchJson('https://api.dreaded.site/api/catfact');

const fact = data.fact;

await m.reply(fact);

} catch (error) {

m.reply('Something is wrong.')

}

}