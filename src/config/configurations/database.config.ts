export interface DatabaseConfig {
  uri: string;
}

export default (): { database: DatabaseConfig } => {
  const user = encodeURIComponent(process.env.BD_PENDIG_USER_TRASVERSAL ?? '');
  const password = encodeURIComponent(process.env.BD_PENDIG_PASS_TRASVERSAL ?? '');
  const host = process.env.PENDIG_MONGODB_HOST;
  const db = process.env.PENDIG_MONGODB_DB_TRANSVERSALES;
  const dbType = process.env.DB_TYPE;

  return {
    database: {
      uri:
        dbType === 'MONGOOSE'
          ? `mongodb+srv://${user}:${password}@${host}/${db}`
          : (process.env[`DATABASE_${dbType}_URL_WITH_SCHEMA`] ?? ''),
    },
  };
};
