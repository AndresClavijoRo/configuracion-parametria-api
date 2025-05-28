import { Enviroment } from '../../common/enums/enviroment.enum';

export interface AppConfig {
  port: number;
  environment: Enviroment;
}

export default (): { app: AppConfig } => ({
  app: {
    port: parseInt(process.env.PORT ?? '', 10) || 3000,
    environment: (process.env.ENV as Enviroment) || Enviroment.Local,
  },
});
