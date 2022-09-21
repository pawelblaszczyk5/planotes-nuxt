import { type z, type TypeOf } from 'zod';

const PARSING_ERROR = 'JSON is not valid';

type Scalar = string | number | boolean | null | undefined;

export type JSON = Scalar | { [key: string]: JSON } | Array<JSON>;

export const parseJsonToString = (jsonToParse: JSON) => {
	try {
		return JSON.stringify(jsonToParse);
	} catch {
		throw new Error(PARSING_ERROR);
	}
};

export const parseStringToJson = <ZodType extends z.ZodTypeAny>(
	stringToParse: string,
	schema: ZodType,
): TypeOf<ZodType> => {
	try {
		const parsedString = JSON.parse(stringToParse);
		return schema.parse(parsedString);
	} catch {
		throw new Error(PARSING_ERROR);
	}
};
