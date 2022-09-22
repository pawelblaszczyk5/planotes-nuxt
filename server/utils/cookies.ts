import { timingSafeEqual, createHmac } from 'node:crypto';

const COOKIE_READING_ERRROR = 'Cookie value can not be verifed';

const convertToBase64 = (stringToConvert: string) =>
	Buffer.from(stringToConvert).toString('base64');

const convertFromBase64 = (stringToConvert: string) =>
	Buffer.from(stringToConvert, 'base64').toString('utf-8');

export const signCookie = (cookieValue: string, secret: string) =>
	`${convertToBase64(cookieValue)}.${createHmac('sha512', secret)
		.update(cookieValue)
		.digest('base64')}`;

export const readSignedCookie = (cookieValue: string, secret: string) => {
	const valueFromCookie = convertFromBase64(cookieValue.slice(0, cookieValue.lastIndexOf('.')));
	const cookieValueBuffer = Buffer.from(cookieValue);
	const expectedCookieBuffer = Buffer.from(signCookie(valueFromCookie, secret));
	const isEqual =
		expectedCookieBuffer.length === cookieValueBuffer.length &&
		timingSafeEqual(cookieValueBuffer, expectedCookieBuffer);

	if (!isEqual) throw new Error(COOKIE_READING_ERRROR);

	return valueFromCookie;
};
