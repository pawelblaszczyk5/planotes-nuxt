export default defineEventHandler(event => {
	// TODO: implement logic later
	const { res } = event;

	res.statusCode = 204;

	return 'OK';
});
