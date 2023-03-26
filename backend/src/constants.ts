// Values from ENVIRONMENT VARIABLES and other constants are loaded here:

// get .env values or supply defaults
const dbAddress: string = process.env.DB_CONTAINER_NAME as string || 'localhost';

// export values
export const constants = {
    DB_URL_STRING: `mongodb://${dbAddress}:27017`,
}
