import { DataSource, DataSourceOptions } from 'typeorm'

import { config } from 'dotenv'

config()

export const dataSourceOptions: DataSourceOptions = {
	type: 'sqlite',
	database: "db_sqlite",
	entities: [__dirname + '/../**/*.entity{.ts,.js}'],
	logging: true,
	synchronize: false,
	migrations: ['dist/database/migrations/*.js'],
	migrationsRun: false,
}

export const appDataSource = new DataSource(dataSourceOptions)
