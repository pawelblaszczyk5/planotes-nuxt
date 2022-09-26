import { Temporal } from '@js-temporal/polyfill';

export const isDateBefore = (
	dateToCheck: Temporal.ZonedDateTime,
	dateToCompareAgainst: Temporal.ZonedDateTime,
) => Temporal.ZonedDateTime.compare(dateToCheck, dateToCompareAgainst) === -1;

export const isDateBeforeNow = (dateToCheck: Temporal.ZonedDateTime) =>
	isDateBefore(dateToCheck, Temporal.Now.zonedDateTimeISO('UTC'));

export const parseEpochSecondsToDate = (seconds: number) =>
	Temporal.Instant.fromEpochSeconds(seconds).toZonedDateTimeISO('UTC');

export const getDateWithOffset = (offset: Temporal.Duration | Temporal.DurationLike) =>
	Temporal.Now.zonedDateTimeISO('UTC').add(offset);

export const getCurrentEpochSeconds = () => Temporal.Now.zonedDateTimeISO('UTC').epochSeconds;
